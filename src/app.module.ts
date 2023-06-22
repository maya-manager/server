import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { VerificationCodeModule } from "./utils/verification-code/verification-code.module";
import { MailerModule } from "./utils/mailer/mailer.module";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./filters/allExceptions.filter";
import RequestLoggerMiddleware from "./middleware/RequestLogger";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		HealthModule,
		AuthModule,
		VerificationCodeModule,
		MailerModule,
	],
	controllers: [],
	providers: [
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter,
		},
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(RequestLoggerMiddleware).forRoutes('*');
	}
}
