import { Injectable } from "@nestjs/common";

@Injectable()
export class VerificationCodeService {
	/**
	 * Generate a random 4 digit number
	 */
	generateCode(): number {
		return Math.floor(1000 + Math.random() * 9000);
	}
}
