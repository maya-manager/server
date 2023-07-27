import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

@Injectable()
export class MailerService {
	constructor(private readonly configService: ConfigService) {}

	logger: Logger = new Logger("MailerService", { timestamp: true });

	/**
	 * Send an email to the specified email address in html format
	 * @param to email address to send the email to
	 * @param subject The subject of the email
	 * @param body The body of the email in html form
	 */
	async sendEmail(
		to: string,
		subject: string,
		body: string,
		attachments?: nodemailer.SendMailOptions["attachments"],
	): Promise<nodemailer.SentMessageInfo> {
		try {
			const environment = this.configService.get<string>("NODE_ENV");

			let transporter: nodemailer.Transporter;
			if (environment === "development") {
				const testAccount = await nodemailer.createTestAccount();
				transporter = nodemailer.createTransport({
					host: "smtp.ethereal.email",
					port: 587,
					secure: false,
					auth: {
						user: testAccount.user,
						pass: testAccount.pass,
					},
				});
			} else if (environment === "production") {
				transporter = nodemailer.createTransport({
					host: this.configService.get<string>("MAIL_HOST"),
					secure: false,
					auth: {
						user: this.configService.get<string>("MAIL_USER"),
						pass: this.configService.get<string>("MAIL_PASSWORD"),
					},
					from: this.configService.get<string>("MAIL_CUSTOM_USER"),
				});
			}

			const info = await transporter.sendMail({
				from: "Maya <no-reply@ayushchugh.me>",
				to: to,
				subject: subject,
				html: body,
				attachments: attachments,
			});

			if (environment === "development") {
				this.logger.verbose(`Message sent: ${info.messageId}`);
				this.logger.verbose(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
			}

			return Promise.resolve(info);
		} catch (err) {
			return Promise.reject(err);
		}
	}
}
