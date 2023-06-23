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
	logger: Logger = new Logger("HTTP", { timestamp: true });

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

		const { method, url, ip } = request;
		const userAgent = request.get("user-agent");

		this.logger.error(`${method} ${url} ${statusCode} - ${userAgent} ${ip}, ${exception}`);

		response.status(statusCode).json(responseBody);
	}
}
