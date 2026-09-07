import { v2 as cloudinary } from "cloudinary";
cloudinary.config({ secure: true });
export const CLOUDINARY_FOLDER = "jhaku-fitness";
export default cloudinary;
