import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	logger: Logger = new Logger("AllExceptionsFilter", { timestamp: true });

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const status = HttpStatus.INTERNAL_SERVER_ERROR;
		const message = "Internal server error";

		if (exception instanceof HttpException) {
			return;
		}

		this.logger.error(exception);

		const { httpAdapter } = this.httpAdapterHost;

		const body = {
			statusCode: status,
			error: HttpStatus[status],
			message,
		};

		httpAdapter.reply(ctx.getResponse(), body, status);
	}
}
