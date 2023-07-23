import {
	ConflictException,
	HttpStatus,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { LoginDto, SignupDto, VerifyAccountDto } from "./auth.dto";
import prisma from "../../common/database/primsa";
import { VerificationCodeService } from "../../utils/verification-code/verification-code.service";
import { compare, genSalt, hash } from "bcrypt";
import { MailerService } from "../../utils/mailer/mailer.service";
import path from "path";
import { Prisma, User } from "@prisma/client";
import { ErrorService } from "../../utils/error/error.service";
import { ConfigService } from "@nestjs/config";
import randomMC from "random-material-color";
import { JwtService } from "../../utils/jwt/jwt.service";

@Injectable()
export class AuthService {
	constructor(
		private readonly verificationCodeService: VerificationCodeService,
		private readonly mailerService: MailerService,
		private readonly errorService: ErrorService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}
	logger: Logger = new Logger("AuthService", { timestamp: true });

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
			await this.mailerService.sendEmail(
				signupDto.email,
				"Welcome to maya, please verify you'r email",
				this.emailTemplate(signupDto.name, verificationCode),
				[
					{
						filename: "logo",
						path: path.resolve("./assets/logos/full.png"),
						cid: "logo",
					},
					{
						filename: "banner",
						path: path.resolve("./assets/logos/banner.png"),
						cid: "banner",
					},
				],
			);

			return Promise.resolve(createdUser);
		} catch (err) {
			return Promise.reject(err);
		}
	}

	/**
	 * Verify the user after signup
	 * @param params params from the request
	 */
	public async getVerifyAccount(params: VerifyAccountDto) {
		try {
			const user = await prisma.user.findUniqueOrThrow({ where: { email: params.email } });

			if (user.verification_code !== +params.verification_code) {
				return Promise.reject(
					this.errorService.serviceAPIError(
						"Invalid verification code",
						HttpStatus.UNAUTHORIZED,
					),
				);
			}

			const updatedUser = await prisma.user.update({
				where: { email: params.email },
				data: { verified: true, verification_code: 0 },
			});

			return Promise.resolve(updatedUser);
		} catch (err) {
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
				return Promise.reject(
					this.errorService.serviceAPIError("User not verified", HttpStatus.FORBIDDEN),
				);
			}

			// check if password is correct
			const isPasswordCorrect = await compare(loginDto.password, user.password);

			if (!isPasswordCorrect) {
				return Promise.reject(
					this.errorService.serviceAPIError("Invalid password", HttpStatus.UNAUTHORIZED),
				);
			}

			const tokens = await this.createAccessAndRefreshTokens(user);

			return Promise.resolve({
				access_token: tokens.accessToken,
				refresh_token: tokens.refreshToken,
			});
		} catch (err) {
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
	 * Template for the email that will be sent to the user
	 * on signup and this will contain the verification code
	 *
	 * @param name name of user to which email is to be sent
	 * @param verificationCode the verification code to be sent
	 */
	private emailTemplate(name: string, verificationCode: number) {
		// eslint-disable-next-line no-secrets/no-secrets
		return `
		<img src="cid:banner" alt="banner" style="
		display: block; margin-left: auto; margin-right: auto;
		    height: 350px;
			width: 50vw;
			text-align: center;
			margin-top: 0;
			margin-bottom: 0;
		" />
		<h1
		style="text-align: center;"
	>
		Welcome To maya!
	</h1>
	<img
		style="display: block; margin-left: auto; margin-right: auto; margin-top: 0; width: 20%"
		src="cid:logo"
		alt="Logo"
	/>
	<p style="margin-top: 0; font-size: medium; text-align: center">
		Dear ${name}, <br />
		<br />
		Thank you for registering. Please enter this OTP in maya
	</p>
	<p style="text-align: center; margin-top: 0;">
		<a
			href="#"
			style="
				text-align: center;
				display: flex;
				width: 7%;
				padding: 10px 20px;
				background-color: #56baa7;
				text-decoration: none;
				border-radius: 5px;
				font-size: medium;
				color: #ffffff;
				justify-content: center;
				margin-left: auto;
				margin-right: auto;
			"
			>${verificationCode}</a
		>
	</p>
	<p style="text-align: center; color: #888888">
		If you did not register on our site, please ignore this email.
		<br />Regards, <br />maya
	</p>
		
		`;
	}
}
