import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { VerificationCodeModule } from "./utils/verification-code/verification-code.module";
import { MailerModule } from "./utils/mailer/mailer.module";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./common/filters/allExceptions.filter";

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
export class AppModule {}
