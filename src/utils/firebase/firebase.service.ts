import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { getStorage, ref, uploadBytes } from "firebase/storage";
import { initializeApp } from "firebase/app";

@Injectable()
export class FirebaseService {
	constructor(private readonly configService: ConfigService) {}

	private config = {
		apiKey: this.configService.get<string>("FIREBASE_API_KEY"),
		authDomain: this.configService.get<string>("FIREBASE_AUTH_DOMAIN"),
		projectId: this.configService.get<string>("FIREBASE_PROJECT_ID"),
		storageBucket: this.configService.get<string>("FIREBASE_STORAGE_BUCKET"),
		messagingSenderId: this.configService.get<string>("FIREBASE_MESSAGING_SENDER_ID"),
		appId: this.configService.get<string>("FIREBASE_APP_ID"),
		measurementId: this.configService.get<string>("FIREBASE_MEASUREMENT_ID"),
	};

	private firebaseApp = initializeApp(this.config);
	private storage = getStorage(this.firebaseApp, this.firebaseApp.options.storageBucket);

	/**
	 * Upload a file buffer to firebase storage
	 * @param buffer image buffer
	 * @param filename image filename
	 */
	async uploadFileBuffer(buffer: Buffer, filename: string, options: UploadFileBufferOptions) {
		const storageRef = ref(this.storage, `images/${filename}`);
		const metaData = {
			contentType: options.contentType,
		};

		return await uploadBytes(storageRef, buffer, metaData);
	}
}

interface UploadFileBufferOptions {
	contentType: string;
}
