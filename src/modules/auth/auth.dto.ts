import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class SignupDto {
	@IsNotEmpty({ message: "Email is required" })
	@IsEmail()
	email: string;

	@MinLength(3)
	@MaxLength(20)
	@IsNotEmpty({ message: "Username is required" })
	username: string;

	@MinLength(3)
	@MaxLength(30)
	@IsNotEmpty({ message: "Name is required" })
	name: string;

	@IsNotEmpty({ message: "Password is required" })
	password: string;

	@IsNotEmpty({ message: "Confirm password is required" })
	cpassword: string;
}

export class VerifyAccountDto {
	@IsEmail({}, { message: "Email is not valid" })
	email: string;

	verification_code: number;
}

export class LoginDto {
	@IsNotEmpty({ message: "Username or email is required" })
	email_username: string;

	@IsNotEmpty({ message: "Password is required" })
	password: string;
}
