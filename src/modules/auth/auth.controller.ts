import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	ForbiddenException,
	Get,
	HttpStatus,
	Logger,
	NotFoundException,
	Param,
	Post,
	Query,
	UnauthorizedException,
} from "@nestjs/common";
import {
	ForgotPasswordParams,
	LoginDto,
	ResendVerificationEmailParams,
	ResetPasswordDto,
	ResetPasswordParams,
	SignupDto,
	VerifyAccountParams,
	VerifyAccountQuery,
} from "./auth.dto";
import { AuthService } from "./auth.service";
import { Prisma } from "@prisma/client";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	private readonly logger: Logger = new Logger("AuthController", { timestamp: true });

	/**
	 * [POST] /auth/signup
	 *
	 * This endpoint is used to create a new user
	 *
	 * @param signupDto The body of the request
	 */
	@Post("/signup")
	public async postSignup(@Body() signupDto: SignupDto) {
		try {
			// TODO: resend verification email

			if (signupDto.password !== signupDto.cpassword) {
				throw new BadRequestException("password and confirm password do not match");
			}

			await this.authService.postSignup(signupDto);

			return {
				statusCode: HttpStatus.CREATED,
				message: "user created and verification email sent successfully",
			};
		} catch (err: any) {
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
				throw new ConflictException("Account with this email or username already exists");
			}

			throw new Error(err);
		}
	}

	/**
	 * [GET] /verify/:email/resend
	 *
	 * This endpoint is used to resend verification email
	 *
	 * @params params The params of the request
	 */
	@Get("/verify/:email/resend")
	public async getResendVerificationEmail(@Param() params: ResendVerificationEmailParams) {
		try {
			await this.authService.getResendVerificationEmail(params.email);

			return {
				statusCode: HttpStatus.OK,
				message: "verification email sent successfully",
			};
		} catch (err: any) {
			if (err.code === HttpStatus.NOT_FOUND) {
				throw new NotFoundException(err.message);
			}

			if (err.code === HttpStatus.CONFLICT) {
				throw new ConflictException(err.message);
			}

			throw new Error(err);
		}
	}

	/**
	 * [GET] /auth/verify/:email
	 *
	 * verify user account after signup
	 * @param params The params of the request
	 * @param query The query of the request
	 */
	@Get("/verify/:email")
	public async getVerifyAccount(
		@Param() params: VerifyAccountParams,
		@Query() query: VerifyAccountQuery,
	) {
		try {
			if (!query.vc) {
				throw new BadRequestException("verification code is required");
			}

			await this.authService.getVerifyAccount(params, query);

			return {
				statusCode: HttpStatus.OK,
				message: "Account verified successfully",
			};
		} catch (err: any) {
			if (err.code === HttpStatus.UNAUTHORIZED) {
				throw new UnauthorizedException(err.message);
			}

			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
				throw new NotFoundException("Account with this email does not exists");
			}

			throw new Error(err);
		}
	}

	/**
	 * [POST] /auth/login
	 *
	 * Logins user with access and refresh tokens
	 */
	@Post("/login")
	public async postLogin(@Body() loginDto: LoginDto) {
		try {
			const tokens = await this.authService.postLogin(loginDto);

			return {
				statusCode: HttpStatus.OK,
				message: "Login successful",
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token,
			};
		} catch (err: any) {
			if (err.code === HttpStatus.FORBIDDEN) {
				throw new ForbiddenException(err.message);
			}

			if (err.code === HttpStatus.UNAUTHORIZED) {
				throw new UnauthorizedException(err.message);
			}

			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
				throw new NotFoundException("Account with this email or username does not exists");
			}

			throw new Error(err);
		}
	}

	@Get("/forgot-password/:email")
	public async getForgotPassword(@Param() params: ForgotPasswordParams) {
		try {
			await this.authService.getForgotPassword(params);

			return {
				statusCode: HttpStatus.OK,
				message: "Verification email sent to your email address",
			};
		} catch (err: any) {
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
				throw new NotFoundException("Account with this email does not exists");
			}

			throw new Error(err);
		}
	}

	@Post("/reset-password/:email")
	public async postResetPassword(
		@Param() params: ResetPasswordParams,
		@Body() body: ResetPasswordDto,
	) {
		try {
			if (body.password !== body.cpassword) {
				throw new BadRequestException("password and confirm password do not match");
			}

			await this.authService.postResetPassword(params, body);

			return {
				statusCode: HttpStatus.OK,
				message: "Password reset successfully",
			};
		} catch (err: any) {
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
				throw new NotFoundException("Account with this email does not exists");
			}

			if (err.code === HttpStatus.UNAUTHORIZED) {
				throw new UnauthorizedException(err.message);
			}

			throw new Error(err);
		}
	}
}
