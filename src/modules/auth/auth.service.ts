import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { SignupDto } from "./dto/signup.dto";
import prisma from "../../common/database/primsa";
import { VerificationCodeService } from "../../utils/verification-code/verification-code.service";
import { genSalt, hash } from "bcrypt";
import { MailerService } from "../../utils/mailer/mailer.service";
import path from "path";

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
		// check if user already exists

		const existingUser = await prisma.user.findMany({
			where: {
				OR: [
					{
						email: signupDto.email,
					},
					{
						username: signupDto.username,
					},
				],
			},
		});

		if (existingUser.length > 0) {
			throw new ConflictException("User with same email or username already exists");
		}

		const hashedPassword = await this.hashPassword(signupDto.password);

		const verificationCode = this.verificationCodeService.generateCode();

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

	/**
	 * Template for the email that will be sent to the user
	 * on signup and this will contain the verification code
	 *
	 * @param name name of user to which email is to be sent
	 * @param verificationCode the verification code to be sent
	 */
	emailTemplate(name: string, verificationCode: number) {
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
