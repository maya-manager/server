import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService as JwtServiceNest } from "@nestjs/jwt";

@Injectable()
export class JwtService {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtServiceNest,
	) {}

	public async signToken(payload: any, type: "access" | "refresh") {
		try {
			const accessTokenPrivateKey = this.configService.get<string>(
				"ACCESS_TOKEN_PRIVATE_KEY",
			);
			const refreshTokenPrivateKey = this.configService.get<string>(
				"REFRESH_TOKEN_PRIVATE_KEY",
			);

			if (type === "access") {
				const accessToken = await this.jwtService.signAsync(payload, {
					privateKey: accessTokenPrivateKey,
					expiresIn: "15m",
				});

				return Promise.resolve(accessToken);
			} else if (type === "refresh") {
				const refreshToken = await this.jwtService.signAsync(payload, {
					privateKey: refreshTokenPrivateKey,
					expiresIn: "7d",
				});

				return Promise.resolve(refreshToken);
			}
		} catch (err) {
			Promise.reject(err);
		}
	}
}
