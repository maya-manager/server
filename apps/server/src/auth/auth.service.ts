import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { SignupDto } from "./dto/signup.dto";
import prisma from "../database/primsa";
import { VerificationCodeService } from "../utils/verification-code/verification-code.service";
import { genSalt, hash } from "bcrypt";
import { MailerService } from "../utils/mailer/mailer.service";
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
					path: path.resolve("../../assets/logos/full.png"),
					cid: "logo",
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
		return `	<style>
			* {
				padding: 0;
				box-sizing: border-box;
			}
			.banner {
				background-image: url(./Screenshot\ 2023-06-16\ at\ 1.03.21\ AM.png);
				height: 100vh;
				background-size: cover;
				background-position: center;
				overflow: hidden;
				position: relative;
			}
			.banner .waves {
				position: absolute;
				width: 100%;
				left: 0;
                bottom: 0;
			}
            .header{
                text-align: center;
            }
            .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #56BAA7;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
    .img{
        height: 250px;
        width: 250px;
    }
		</style>

		
        
<section class="banner">
             <div class="header">
            <h1>Welcome to Maya!</h1>
            <h2>kindly verify your email here </h2>
            <img class="img" height="500px" width="500px" src="cid:logo" alt="Logo">
            <p> Dear ${name}<br>
            Please enter this OTP in maya</p>
            
			<h3>OTP: ${verificationCode}</h3>

        </div>
		</section>`;
	}
}
