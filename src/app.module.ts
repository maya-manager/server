import { MiddlewareConsumer, Module, NestModule, UseFilters } from "@nestjs/common";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { VerificationCodeModule } from "./utils/verification-code/verification-code.module";
import { MailerModule } from "./utils/mailer/mailer.module";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./filters/allExceptions.filter";
import RequestLoggerMiddleware from "./middleware/requestLogger.middleware";
import { ErrorModule } from "./utils/error/error.module";
import { FirebaseModule } from "./utils/firebase/firebase.module";
import { HttpExceptionsFilter } from "./filters/httpExceptions.filter";
import { UserModule } from "./modules/user/user.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		HealthModule,
		AuthModule,
		UserModule,
		VerificationCodeModule,
		MailerModule,
		ErrorModule,
		FirebaseModule,
	],
	controllers: [],
})
@UseFilters(AllExceptionsFilter)
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(RequestLoggerMiddleware).forRoutes("*");
	}
}
