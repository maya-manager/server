import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [JwtModule.register({ global: true, signOptions: { algorithm: "RS256" } })],
})
export class AuthModule {}
