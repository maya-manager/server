import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../../utils/firebase/firebase.service";
import { Response } from "express";
import { Profile, User } from "@prisma/client";
import prisma from "../../common/database/primsa";

@Injectable()
export class UserService {
	constructor(private readonly firebaseService: FirebaseService) {}

	/**
	 * Upload avatar to firebase storage and update avatar url in database
	 * @param avatar Multer file object
	 * @param res Express response object
	 */
	async patchAvatar(avatar: Express.Multer.File, res: Response) {
		try {
			const user = res.locals.user as UserProfile;

			// Delete previous avatar from firebase storage

			if (user.profile.avatar_filename) {
				await this.firebaseService.deleteImage(user.profile.avatar_filename);
			}

			const avatarFileName = `${user.username}-${user.id}-${avatar.originalname}`;

			// upload avatar to firebase storage
			const uploadedAvatar = await this.firebaseService.uploadImageBuffer(
				avatar.buffer,
				avatarFileName,
				{ contentType: avatar.mimetype },
			);

			// update avatar url in database
			const updatedProfile = await prisma.profile.update({
				where: { user_id: user.id },
				data: {
					avatar_url: await this.firebaseService.getFileUrl(uploadedAvatar.ref.fullPath),
					avatar_filename: avatarFileName,
				},
			});

			return Promise.resolve(updatedProfile);
		} catch (err) {
			return Promise.reject(err);
		}
	}
}

type UserProfile = User & { profile: Profile };
