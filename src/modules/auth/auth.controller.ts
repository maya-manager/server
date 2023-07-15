import {
	BadRequestException,
	Body,
	Controller,
	ForbiddenException,
	Get,
	HttpStatus,
	Logger,
	NotFoundException,
	Param,
	Post,
	UnauthorizedException,
	UseFilters,
} from "@nestjs/common";
import { LoginDto, SignupDto, VerifyAccountDto } from "./auth.dto";
import { AuthService } from "./auth.service";
import { HttpExceptionsFilter } from "../../filters/httpExceptions.filter";
import { Prisma } from "@prisma/client";
import { ErrorService } from "../../utils/error/error.service";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	logger: Logger = new Logger("AuthController", { timestamp: true });

	/**
	 * `POST` /auth/signup
	 *
	 * This endpoint is used to create a new user
	 *
	 * @param signupDto The body of the request
	 */
	@Post("/signup")
	@UseFilters(HttpExceptionsFilter)
	async postSignup(@Body() signupDto: SignupDto) {
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
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
				throw new BadRequestException("Account with this email or username already exists");
			}
		}
	}

	/**
	 * [GET] /auth/verify/:email/:verification_code
	 *
	 * verify user account after signup
	 * @param params The params of the request
	 */
	@Get("/verify/:email/:verification_code")
	@UseFilters(HttpExceptionsFilter)
	async getVerifyAccount(@Param() params: VerifyAccountDto) {
		try {
			await this.authService.getVerifyAccount(params);

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
		}
	}

	/**
	 * [POST] /auth/login
	 *
	 * Logins user with access and refresh tokens
	 */
	@Post("/login")
	@UseFilters(HttpExceptionsFilter)
	async postLogin(@Body() loginDto: LoginDto) {
		try {
			await this.authService.postLogin(loginDto);

			return {
				statusCode: HttpStatus.OK,
				message: "Login successful",
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
		}
	}
}
