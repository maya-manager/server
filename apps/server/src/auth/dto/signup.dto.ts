import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class SignupDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@MinLength(3)
	@MaxLength(20)
	@IsNotEmpty()
	username: string;

	@MinLength(3)
	@MaxLength(30)
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	password: string;

	@IsNotEmpty()
	cpassword: string;
}
