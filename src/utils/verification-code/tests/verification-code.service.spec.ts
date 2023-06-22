import { Test, TestingModule } from "@nestjs/testing";
import { VerificationCodeService } from "../verification-code.service";

describe("VerificationCodeService", () => {
	let service: VerificationCodeService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [VerificationCodeService],
		}).compile();

		service = module.get<VerificationCodeService>(VerificationCodeService);
	});

	describe("verificationCode", () => {
		it("should be defined", () => {
			expect(service).toBeDefined();
		});

		it("should generate a random 4 digit number", () => {
			const code = service.generateCode();
			expect(code).toBeGreaterThanOrEqual(1000);
			expect(code).toBeLessThanOrEqual(9999);
		});
	});
});
