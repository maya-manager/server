import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import 'dotenv/config'
@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
})
export class AuthModule {}
