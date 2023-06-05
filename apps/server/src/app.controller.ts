import { Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import prisma from "./database/primsa";

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get("/users")
	async getUsers() {
		const users = await prisma.user.findMany();

		return {
			message: "Users fetched successfully",
			data: users,
		};
	}

	@Post("/signup")
	async postSignup() {
		const data = await prisma.user.create({
			data: {
				name: "Ayush Chugh",
				email: "email",
				username: "ayushchugh",
			},
		});

		return {
			message: "User created successfully",
			data,
		};
	}
}
