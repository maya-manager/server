import { Injectable } from "@nestjs/common";

@Injectable()
export class ErrorService {
	/**
	 * return new error object
	 *
	 * @param message message to be sent to the user
	 * @param code error code
	 */
	APIError(message: string, code: number) {
		return { message, code };
	}
}
