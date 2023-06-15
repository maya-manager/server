import { Injectable, Logger } from "@nestjs/common";
import { SignupDto } from "./dto/signup.dto";
import prisma from "../database/primsa";
import { VerificationCodeService } from "../utils/verification-code/verification-code.service";
import { genSalt, hash } from "bcrypt";
import { MailerService } from "../utils/mailer/mailer.service";

@Injectable()
export class AuthService {
	constructor(
		private readonly verificationCodeService: VerificationCodeService,
		private readonly mailerService: MailerService,
	) {}
	logger: Logger = new Logger("AuthService", { timestamp: true });

	/**
	 * Create a new user in the database and send a verification email
	 * @param signupDto Details of the user to be created
	 */
	async postSignup(signupDto: SignupDto) {
		const hashedPassword = await this.hashPassword(signupDto.password);

		const verificationCode = this.verificationCodeService.generateCode();

		// TODO: improve email template
		// send verification email
		const html = `
            <h1>Verify your email</h1>
            <p>Please enter this verification code in maya <b>${verificationCode}</b></p>
        `;

		await this.mailerService.sendEmail(
			signupDto.email,
			"Welcome to maya, please verify you'r email",
			html,
		);

		return await prisma.user.create({
			data: {
				name: signupDto.name,
				email: signupDto.email,
				username: signupDto.username,
				password: hashedPassword,
				verification_code: verificationCode,
			},
		});
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
	async hashPassword(password: string): Promise<string> {
		const salt = await genSalt(10);

		return await hash(password, salt);
	}
}
