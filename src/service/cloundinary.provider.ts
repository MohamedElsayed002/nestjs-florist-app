
import { v2 as cloudinary } from "cloudinary";
import { ConfigService } from "@nestjs/config";
import { Provider } from "@nestjs/common";

export const CloudinaryProvider: Provider = {
    provide : 'CLOUDINARY',
    useFactory: (configService: ConfigService) => {
        return cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key : process.env.CLOUDINARY_API_KEY,
            api_secret : process.env.CLOUDINARY_API_SECRET
        })
    },
    inject: [ConfigService]
}