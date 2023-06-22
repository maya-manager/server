import { Controller, Get, HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { IResponseSuccess } from "../../common/types/interface";
import prisma from "../../common/database/primsa";

@Controller("health")
export class HealthController {
	/**
	 * This will check if the server is up and running
	 */
	@Get()
	async getHealth(): Promise<IResponseSuccess | InternalServerErrorException> {
		try {
			await prisma.$connect();

			return {
				statusCode: HttpStatus.OK,
				message: "Server is up and running",
			};
		} catch (err) {
			throw new InternalServerErrorException();
		}
	}
}
