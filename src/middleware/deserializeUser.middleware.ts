import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { JwtService } from "../utils/jwt/jwt.service";
import prisma from "../common/database/primsa";

@Injectable()
export class DeserializeUserMiddleware implements NestMiddleware {
	constructor(private readonly jwtService: JwtService) {}

	async use(req: Request, res: Response, next: NextFunction) {
		// get authorization token from headers
		try {
			if (!req.headers.authorization) {
				throw new UnauthorizedException();
			}

			const token = req.headers.authorization.replace(/^Bearer\s+/, "");

			// verify if token is valid
			const decodedToken = await this.jwtService.verifyToken<{ user_id: string }>(
				token,
				"accessToken",
			);

			// save user in res.locals
			const userFromDb = await prisma.user.findUnique({
				where: { id: +decodedToken.user_id },
				include: { profile: true },
			});

			res.locals.user = userFromDb;

			next();
		} catch (err) {
			throw new UnauthorizedException();
		}
	}
}
