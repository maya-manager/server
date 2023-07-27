import {
	Controller,
	HttpStatus,
	InternalServerErrorException,
	ParseFilePipeBuilder,
	Patch,
	Res,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Multer } from "multer";
import { Response } from "express";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Patch("/profile/avatar")
	@UseInterceptors(FileInterceptor("avatar"))
	async patchAvatar(
		@Res() res: Response,
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({ fileType: new RegExp(/^image\//) })
				.addMaxSizeValidator({ maxSize: 5242880, message: "File can't be more than 5mb" }) // 5mb
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		avatar: Express.Multer.File,
	) {
		try {
			await this.userService.patchAvatar(avatar, res);

			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: "Avatar updated successfully",
			});
		} catch (err) {
			throw new InternalServerErrorException();
		}
	}
}
