import { MiddlewareConsumer, Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { DeserializeUserMiddleware } from "../../middleware/deserializeUser.middleware";

@Module({
	providers: [UserService],
	controllers: [UserController],
})
export class UserModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(DeserializeUserMiddleware).forRoutes("/user/profile/avatar");
	}
}
