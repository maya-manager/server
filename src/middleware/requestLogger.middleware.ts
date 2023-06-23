import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export default class RequestLoggerMiddleware implements NestMiddleware {
	private logger: Logger = new Logger("HTTP");
	use(req: Request, res: Response, done: NextFunction) {
		const { ip, method, path: url } = req;
		const userAgent = req.get("user-agent") || "";

		res.on("close", () => {
			const { statusCode } = res;
			const contentLength = res.get("content-length");
			this.logger.log(`${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
		});

		done();
	}
}
