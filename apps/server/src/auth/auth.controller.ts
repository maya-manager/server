import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	HttpStatus,
	Logger,
	Post,
} from "@nestjs/common";
import { SignupDto } from "./dto/signup.dto";
import { AuthService } from "./auth.service";
import { Prisma } from "@prisma/client";

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
	async postSignup(@Body() signupDto: SignupDto) {
		// TODO: resend verification email

		try {
			if (signupDto.password !== signupDto.cpassword) {
				throw new BadRequestException("password and confirm password do not match");
			}

			await this.authService.postSignup(signupDto);

			return {
				statusCode: HttpStatus.CREATED,
				message: "user created and verification email sent successfully",
			};
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.meta && err.meta.target[0] === "email") {
					throw new ConflictException("an account with this email already exists");
				}

				if (err.meta && err.meta.target[0] === "username") {
					throw new ConflictException("an account with this username already exists");
				}
			}

			this.logger.error(err);
		}
	}
}
