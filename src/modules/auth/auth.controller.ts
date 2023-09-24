import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Headers,
	Logger,
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
		if (signupDto.password !== signupDto.cpassword) {
			throw new BadRequestException("password and confirm password do not match");
		}

		return await this.authService.postSignup(signupDto);
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
		return await this.authService.getResendVerificationEmail(params.email);
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
		if (!query.vc) {
			throw new BadRequestException("verification code is required");
		}

		return await this.authService.getVerifyAccount(params, query);
	}

	/**
	 * [POST] /auth/login
	 *
	 * Logins user with access and refresh tokens
	 */
	@Post("/login")
	public async postLogin(@Body() loginDto: LoginDto) {
		return await this.authService.postLogin(loginDto);
	}

	/**
	 * [GET] /auth/forgot-password/:email
	 * @param params request params
	 */
	@Get("/forgot-password/:email")
	public async getForgotPassword(@Param() params: ForgotPasswordParams) {
		return await this.authService.getForgotPassword(params);
	}

	/**
	 * [POST] /auth/reset-password/:email
	 * @param params request params
	 * @param body request body
	 */
	@Post("/reset-password/:email")
	public async postResetPassword(
		@Param() params: ResetPasswordParams,
		@Body() body: ResetPasswordDto,
	) {
		if (body.password !== body.cpassword) {
			throw new BadRequestException("password and confirm password do not match");
		}

		return await this.authService.postResetPassword(params, body);
	}

	@Get("/refresh")
	public async getRefreshAccessToken(@Headers("x-refresh") authHeader) {
		if (!authHeader) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		return await this.authService.getRefreshAccessToken(authHeader);
	}
}
