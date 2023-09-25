import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { AuthTokens } from "./utils/authTokens.util";
import { DeserializeUserMiddleware } from "./middlewares/deserializeUser.middleware";

@Module({
	controllers: [AuthController],
	providers: [AuthService, AuthTokens],
	imports: [JwtModule.register({ global: true, signOptions: { algorithm: "RS256" } })],
})
export class AuthModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(DeserializeUserMiddleware).forRoutes("/user/profile/avatar");
	}
}
