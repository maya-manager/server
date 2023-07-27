import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { initializeApp } from "firebase/app";

@Injectable()
export class FirebaseService {
	constructor(private readonly configService: ConfigService) {}

	private readonly config = {
		apiKey: this.configService.get<string>("FIREBASE_API_KEY"),
		authDomain: this.configService.get<string>("FIREBASE_AUTH_DOMAIN"),
		projectId: this.configService.get<string>("FIREBASE_PROJECT_ID"),
		storageBucket: this.configService.get<string>("FIREBASE_STORAGE_BUCKET"),
		messagingSenderId: this.configService.get<string>("FIREBASE_MESSAGING_SENDER_ID"),
		appId: this.configService.get<string>("FIREBASE_APP_ID"),
		measurementId: this.configService.get<string>("FIREBASE_MEASUREMENT_ID"),
	};

	private readonly firebaseApp = initializeApp(this.config);
	private readonly storage = getStorage(this.firebaseApp, this.firebaseApp.options.storageBucket);

	/**
	 * Upload a file buffer to firebase storage
	 * @param buffer image buffer
	 * @param filename image filename
	 */
	public async uploadImageBuffer(
		buffer: Buffer,
		filename: string,
		options: UploadFileBufferOptions,
	) {
		const storageRef = ref(this.storage, `images/${filename}`);
		const metaData = {
			contentType: options.contentType,
		};

		return await uploadBytes(storageRef, buffer, metaData);
	}

	/**
	 * Get the url of an image from firebase storage
	 * @param filepath The name of file to get the url
	 */
	public async getFileUrl(filepath: string) {
		const storageRef = ref(this.storage, `${filepath}`);
		return await getDownloadURL(storageRef);
	}

	/**
	 * Delete an image from firebase storage
	 * @param filename Name of file which will be deleted from firebase storage
	 */
	public async deleteImage(filename: string) {
		const storageRef = ref(this.storage, `images/${filename}`);
		return await deleteObject(storageRef);
	}
}

interface UploadFileBufferOptions {
	contentType: string;
}
