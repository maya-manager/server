import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

import { config } from "dotenv";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

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
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix("/v1");

	const config = new DocumentBuilder()
		.setTitle("Maya")
		.setDescription(
			"App to manage your pocket money and keep track of your expenses and account between multiple people",
		)
		.setVersion("1.0.0")
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, document);

	await app.listen(process.env.PORT || 8000);
}
bootstrap();
