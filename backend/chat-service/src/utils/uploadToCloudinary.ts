import cloudinary from "../configs/cloudinary.js";

export const uploadToCloudinary = (
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "chat-images",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Upload failed"));
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
};
