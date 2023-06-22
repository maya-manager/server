import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "../health.controller";
import request from "supertest";
import { INestApplication } from "@nestjs/common";

describe("HealthController", () => {
	let app: INestApplication;
	let controller: HealthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [HealthController],
		}).compile();

		controller = module.get<HealthController>(HealthController);
		app = module.createNestApplication();
		await app.init();
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("GET /health", () => {
		it("should return 200", () => {
			request(app.getHttpServer()).get("/health").expect(200).expect({
				status: "success",
				message: "Server is up and running",
			});
		});
	});
});
