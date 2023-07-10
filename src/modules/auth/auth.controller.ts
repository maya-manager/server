import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Logger,
	Param,
	Post,
	UseFilters,
} from "@nestjs/common";
import { SignupDto, VerifyAccountDto } from "./auth.dto";
import { AuthService } from "./auth.service";
import { HttpExceptionsFilter } from "../../filters/httpExceptions.filter";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	logger: Logger = new Logger("AuthController", { timestamp: true });

	/**
	 * `POST` /auth/signup
	 *
	 * @description This endpoint is used to create a new user
	 *
	 * @param signupDto The body of the request
	 */
	@Post("/signup")
	@UseFilters(HttpExceptionsFilter)
	async postSignup(@Body() signupDto: SignupDto) {
		// TODO: resend verification email

		if (signupDto.password !== signupDto.cpassword) {
			throw new BadRequestException("password and confirm password do not match");
		}

		await this.authService.postSignup(signupDto);

		return {
			statusCode: HttpStatus.CREATED,
			message: "user created and verification email sent successfully",
		};
	}

	@Get("/verify/:email/:verification_code")
	@UseFilters(HttpExceptionsFilter)
	async getVerifyAccount(@Param() params: VerifyAccountDto) {
		await this.authService.getVerifyAccount(params);

		return {
			statusCode: HttpStatus.OK,
			message: "Account verified successfully",
		};
	}
}
