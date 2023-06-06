import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { IResponseError, IResponseSuccess } from "../types/interface";
import prisma from "../database/primsa";

@ApiTags("App")
@Controller("health")
export class HealthController {
	/**
	 * This will check if the server is up and running
	 */
	@Get()
	@ApiResponse({
		status: 200,
		description: "Server is up and running",
		schema: {
			type: "object",
			properties: {
				status: { type: "string" },
				message: { type: "string" },
			},
			example: {
				status: "success",
				message: "Server is up and running",
			},
		},
	})
	@ApiResponse({
		status: 500,
		description: "Server is down",
		schema: {
			type: "object",
			properties: {
				status: { type: "string" },
				error: { type: "string" },
			},
			example: {
				status: "error",
				error: "Server is down",
			},
		},
	})
	async getHealth(): Promise<IResponseSuccess | IResponseError> {
		try {
			await prisma.$connect();

			return {
				status: "success",
				message: "Server is up and running",
			};
		} catch (err) {
			throw new HttpException(
				{ status: "error", error: "Server is down" },
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
