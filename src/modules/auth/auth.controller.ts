import {
	BadRequestException,
	Body,
	Controller,
	HttpStatus,
	Logger,
	Post,
	UseFilters,
} from "@nestjs/common";
import { SignupDto } from "./dto/signup.dto";
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

	@Post('/login')
	@UseFilters(HttpExceptionsFilter)
	async login(@Body() dto: SignupDto) {
		return this.authService.postLogin(dto)
	}
}
