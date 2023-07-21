import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
	async patchAvatar(avatar: Express.Multer.File) {
		// if (avatar) {
		// 	// upload avatar to firebase storage
		// 	const uploadedAvatar = await this.firebaseService.uploadFileBuffer(
		// 		avatar.buffer,
		// 		`${createdUser.username}-${createdUser.id}-${avatar.originalname}`,
		// 		{ contentType: avatar.mimetype },
		// 	);

		// 	// update avatar url in database
		// 	await prisma.profile.update({
		// 		where: { user_id: createdUser.id },
		// 		data: {
		// 			avatar_url: await this.firebaseService.getImageUrl(uploadedAvatar.ref.fullPath),
		// 		},
		// 	});
		// }
		return "Hello World!";
	}
}
