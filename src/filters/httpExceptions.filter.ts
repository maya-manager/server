import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
	logger: Logger = new Logger("AllExceptionsFilter", { timestamp: true });

	catch(exception: HttpException, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const request = ctx.getRequest<Request>();
		const response = ctx.getResponse<Response>();
		const statusCode = exception.getStatus();
		const { message } = exception;

		const responseBody = {
			statusCode,
			message,
			error: HttpStatus[statusCode],
		};

		const { method, originalUrl, ip, headers, body } = request;
		const userAgent = request.get("user-agent");

		this.logger.error(
			`[${method}] ${originalUrl} ${statusCode}  userAgent: ${userAgent} ip: ${ip} message: ${message} headers: ${JSON.stringify(
				headers,
			)} body: ${JSON.stringify(body)}`,
		);

		response.status(statusCode).json(responseBody);
	}
}
