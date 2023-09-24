import {
	ConflictException,
	ForbiddenException,
	HttpStatus,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import {
	ForgotPasswordParams,
	LoginDto,
	ResetPasswordDto,
	ResetPasswordParams,
	SignupDto,
	VerifyAccountParams,
	VerifyAccountQuery,
} from "./auth.dto";
import prisma from "../../common/database/primsa";
import { VerificationCodeService } from "../../utils/verification-code/verification-code.service";
import { compare, genSalt, hash } from "bcrypt";
import { MailerService } from "../../utils/mailer/mailer.service";
import { Prisma, User } from "@prisma/client";
import randomMC from "random-material-color";
import { JwtService } from "../../utils/jwt/jwt.service";

@Injectable()
export class AuthService {
	constructor(
		private readonly verificationCodeService: VerificationCodeService,
		private readonly mailerService: MailerService,
		private readonly jwtService: JwtService,
	) {}
	private readonly logger: Logger = new Logger("AuthService", { timestamp: true });

	/**
	 * Create a new user in the database and send a verification email
	 * @param signupDto Details of the user to be created
	 */
	public async postSignup(signupDto: SignupDto) {
		try {
			const hashedPassword = await this.hashPassword(signupDto.password);

			const verificationCode = this.verificationCodeService.generateCode();

			const createdUser = await prisma.user.create({
				data: {
					name: signupDto.name,
					email: signupDto.email,
					username: signupDto.username,
					password: hashedPassword,
					verification_code: verificationCode,
				},
			});

			// create profile for the user
			await prisma.profile.create({
				data: {
					user_id: createdUser.id,
					avatar_color: randomMC.getColor(),
				},
			});

			await prisma.user.update({
				where: { id: createdUser.id },
				data: { profile: { connect: { user_id: createdUser.id } } },
			});

			// send verification email
			await this.sendVerificationEmail(createdUser);

			return Promise.resolve({
				statusCode: HttpStatus.CREATED,
				message: "user created and verification email sent successfully",
			});
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
				throw new ConflictException("Account with this email or username already exists");
			}

			return Promise.reject(err);
		}
	}

	public async getResendVerificationEmail(email: string) {
		try {
			const user = await prisma.user.findUnique({ where: { email } });

			// check if user exists
			if (!user) {
				throw new NotFoundException("User with this email does not exist");
			}

			// check if user is already verified
			if (user.verified) {
				throw new ConflictException("User is already verified");
			}

			// send verification email
			await this.sendVerificationEmail(user);

			return Promise.resolve({
				statusCode: HttpStatus.OK,
				message: "verification email sent successfully",
			});
		} catch (err) {
			return Promise.reject(err);
		}
	}

	/**
	 * Verify the user after signup
	 * @param params params from the request
	 * @param query query from the request
	 */
	public async getVerifyAccount(params: VerifyAccountParams, query: VerifyAccountQuery) {
		try {
			const user = await prisma.user.findUniqueOrThrow({ where: { email: params.email } });

			if (user.verification_code !== +query.vc) {
				throw new UnauthorizedException("Invalid verification code");
			}

			await prisma.user.update({
				where: { email: params.email },
				data: { verified: true, verification_code: 0 },
			});

			return Promise.resolve({
				statusCode: HttpStatus.OK,
				message: "Account verified successfully",
			});
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
				throw new NotFoundException("Account with this email does not exists");
			}

			return Promise.reject(err);
		}
	}

	/**
	 * Create access and refresh tokens for the user
	 *
	 * also creates a session in database
	 */
	public async postLogin(loginDto: LoginDto) {
		try {
			let user: User;

			// check if input is email or username
			const isEmail = loginDto.email_username.includes("@");

			if (isEmail) {
				// find user with email
				user = await prisma.user.findUniqueOrThrow({
					where: {
						email: loginDto.email_username,
					},
				});
			} else {
				// find user with username
				user = await prisma.user.findUniqueOrThrow({
					where: {
						username: loginDto.email_username,
					},
				});
			}

			if (!user.verified) {
				throw new ForbiddenException("User not verified");
			}

			// check if password is correct
			const isPasswordCorrect = await compare(loginDto.password, user.password);

			if (!isPasswordCorrect) {
				throw new UnauthorizedException("Invalid credentials");
			}

			const tokens = await this.createAccessAndRefreshTokens(user);

			return Promise.resolve({
				statusCode: HttpStatus.OK,
				message: "Login successful",
				access_token: tokens.accessToken,
				refresh_token: tokens.refreshToken,
			});
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
				throw new NotFoundException("Account with this email or username does not exists");
			}

			return Promise.reject(err);
		}
	}

	/**
	 * Send a verification email to the user to forgot password
	 * @param forgotPasswordDto request body
	 */
	public async getForgotPassword(forgotPasswordDto: ForgotPasswordParams) {
		try {
			const user = await prisma.user.findUniqueOrThrow({
				where: { email: forgotPasswordDto.email },
			});

			const verificationCode = this.verificationCodeService.generateCode();

			await prisma.user.update({
				where: { email: forgotPasswordDto.email },
				data: { verification_code: verificationCode },
			});

			await this.sendForgotPasswordEmail(user);

			return Promise.resolve({
				statusCode: HttpStatus.OK,
				message: "Verification email sent to your email address",
			});
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
				throw new NotFoundException("Account with this email does not exists");
			}

			return Promise.reject(err);
		}
	}

	/**
	 * Reset the password of the user
	 * @param params Request params
	 * @param body Request body
	 */
	public async postResetPassword(params: ResetPasswordParams, body: ResetPasswordDto) {
		try {
			const user = await prisma.user.findUniqueOrThrow({
				where: { email: params.email },
			});

			if (!user.verified) {
				throw new ForbiddenException("User not verified");
			}

			if (user.verification_code !== +body.verification_code) {
				throw new UnauthorizedException("Invalid verification code");
			}

			const hashedPassword = await hash(body.password, 10);

			const updatedUser = await prisma.user.update({
				where: { email: params.email },
				data: { password: hashedPassword, verification_code: 0 },
			});

			return Promise.resolve({
				statusCode: HttpStatus.OK,
				message: "Password reset successfully",
			});
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
				throw new NotFoundException("Account with this email does not exists");
			}

			return Promise.reject(err);
		}
	}

	public async getRefreshAccessToken(refreshToken: string) {
		try {
			const decoded = await this.jwtService.verifyToken<{ session_id: number }>(
				refreshToken,
				"refreshToken",
			);

			if (!decoded) {
				throw new UnauthorizedException("Invalid token");
			}

			const session = await prisma.session.findUnique({ where: { id: decoded.session_id } });

			if (!session) {
				throw new UnauthorizedException("Invalid token");
			}

			const user = await prisma.user.findUnique({ where: { id: session.user_id } });

			if (!user) {
				throw new UnauthorizedException("Invalid token");
			}

			const { accessToken } = await this.createAccessAndRefreshTokens(user);

			return {
				statusCode: HttpStatus.OK,
				message: "access token generated successfully",
				access_token: accessToken,
			};
		} catch (err: any) {
			if (err.code === "IRT") {
				throw new UnauthorizedException("Invalid token");
			}

			return Promise.reject(err);
		}
	}

	/**
	 * Creates access and refresh tokens for the user
	 * @param user The user for which the tokens are to be created
	 */
	private async createAccessAndRefreshTokens(user: User) {
		try {
			// create a session in database
			const session = await prisma.session.create({
				data: {
					user_id: user.id,
				},
			});

			// create access and refresh tokens
			const accessToken = await this.jwtService.signToken({ user_id: user.id }, "access");
			const refreshToken = await this.jwtService.signToken(
				{ session_id: session.id },
				"refresh",
			);

			return Promise.resolve({
				accessToken,
				refreshToken,
			});
		} catch (err) {
			return Promise.reject(err);
		}
	}

	/**
	 * Hash a password
	 * @param password The password to be hashed
	 *
	 * @example
	 * ```ts
	 * const hashedPassword = await this.authService.hashPassword("password");
	 * ```
	 */
	private async hashPassword(password: string): Promise<string> {
		const salt = await genSalt(10);

		return await hash(password, salt);
	}

	/**
	 * Send verification email to the user's email
	 * @param user The user to whom the verification email is to be sent
	 */
	private async sendVerificationEmail(user: User) {
		const emailTemplate = `
			<div>
				<h1>Hey ${user.name}! Welcome to Maya</h1>
				<p>Enter this OTP: <strong>${user.verification_code}</strong>, to verify your account</p>
				<p>Please don't share this OTP with someone else</p>
			</div>
		`;

		await this.mailerService.sendEmail(user.email, "Please verify you'r email", emailTemplate);
	}

	/**
	 * Send forgot password email to the user's email
	 * @param user The user to whom the forgot password email is to be sent
	 */
	private async sendForgotPasswordEmail(user: User) {
		const emailTemplate = `
			<div>
				<h1>Hey ${user.name}!</h1>
				<p>Enter this OTP: <strong>${user.verification_code}</strong>, to reset your password</p>
				<p>Please don't share this OTP with anyone</p>
			</div>
		`;

		await this.mailerService.sendEmail(
			user.email,
			"Reset your password for Maya",
			emailTemplate,
		);
	}
}
