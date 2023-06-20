import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

import { config } from "dotenv";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AllExceptionsFilter } from "./common/filters/allExceptions.filter";

let envFile: string;

if (process.env.NODE_ENV === "production") {
	envFile = ".env";
} else if (process.env.NODE_ENV === "test") {
	envFile = ".env.test";
} else if (process.env.NODE_ENV === "development") {
	envFile = ".env.dev";
}

config({ path: envFile });

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.setGlobalPrefix("/v1");
	app.useGlobalPipes(new ValidationPipe());

	await app.listen(process.env.PORT || 8000);
}
bootstrap();
