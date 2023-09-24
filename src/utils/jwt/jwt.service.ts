import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService as JwtServiceNest } from "@nestjs/jwt";

@Injectable()
export class JwtService {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtServiceNest,
	) {}

	private readonly accessTokenPrivateKey = this.configService.get<string>(
		"ACCESS_TOKEN_PRIVATE_KEY",
	);
	private readonly accessTokenPublicKey =
		this.configService.get<string>("ACCESS_TOKEN_PUBLIC_KEY");
	private readonly refreshTokenPrivateKey = this.configService.get<string>(
		"REFRESH_TOKEN_PRIVATE_KEY",
	);
	private readonly refreshTokenPublicKey = this.configService.get<string>(
		"REFRESH_TOKEN_PUBLIC_KEY",
	);

	/**
	 * Sign given payload into JWT token
	 * @param payload data to be signed in the JWT
	 * @param type which type of token to be signed
	 */
	public async signToken(payload: any, type: "access" | "refresh"): Promise<string> {
		try {
			if (type === "access") {
				const accessToken = await this.jwtService.signAsync(payload, {
					privateKey: this.accessTokenPrivateKey,
					expiresIn: "15m",
				});

				return Promise.resolve(accessToken);
			} else if (type === "refresh") {
				const refreshToken = await this.jwtService.signAsync(payload, {
					privateKey: this.refreshTokenPrivateKey,
					expiresIn: "7d",
				});

				return Promise.resolve(refreshToken);
			}
		} catch (err) {
			Promise.reject(err);
		}
	}

	public async verifyToken<T>(token: string, type: "accessToken" | "refreshToken"): Promise<T> {
		try {
			let decodedToken;

			if (type === "accessToken") {
				decodedToken = await this.jwtService.verifyAsync(token, {
					publicKey: this.accessTokenPublicKey,
				});
			} else if (type === "refreshToken") {
				decodedToken = await this.jwtService.verifyAsync(token, {
					publicKey: this.refreshTokenPublicKey,
				});
			}

			return Promise.resolve(decodedToken);
		} catch (err) {
			return Promise.reject({
				message: "Invalid refresh token",
				code: "IRT",
			});
		}
	}
}
