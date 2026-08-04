import cloudinary from "../configs/cloudinary.js";

// Uploads an image received from Multer to Cloudinary.
//
// Parameter:
// file -> This is the object created by Multer middleware.
//         It contains information about the uploaded file such as:
//         - originalname
//         - mimetype
//         - size
//         - buffer (actual binary data of the image)
//
// Express.Multer.File is ONLY a TypeScript type.
// At runtime, this object is actually req.file.
//
// Return Type:
// Promise<string>
//
// Why Promise<string>?
//
// Uploading an image takes time because it travels over the internet.
//
// The function DOES NOT immediately return the image URL.
//
// Instead it returns a Promise which will eventually resolve
// to the uploaded image's secure URL.
//
// Example:
//
// const imageUrl = await uploadToCloudinary(req.file!);
//
// imageUrl is inferred by TypeScript as a string.
export const uploadToCloudinary = (
  file: Express.Multer.File
): Promise<string> => {

  // Cloudinary's upload_stream() API is callback-based.
  //
  // Modern JavaScript applications prefer async/await.
  //
  // To use async/await we manually convert ("promisify")
  // Cloudinary's callback API into a Promise.
  //
  // Promise has two important functions:
  //
  // resolve(value)
  //      -> Upload succeeded.
  //
  // reject(error)
  //      -> Upload failed.
  //
  // Whoever does:
  //
  // await uploadToCloudinary(...)
  //
  // will pause until either resolve() or reject() is called.
  return new Promise((resolve, reject) => {

    // upload_stream() DOES NOT upload the image immediately.
    //
    // It creates and returns a Writable Stream.
    //
    // Think of a stream as an empty pipe waiting for data.
    //
    // Your code
    //      |
    //      ▼
    //  ───────────────
    //  Empty Pipe
    //  ───────────────
    //      |
    //      ▼
    // Cloudinary
    //
    // After creating this stream we still need to send
    // the image bytes into it.
    const stream = cloudinary.uploader.upload_stream(

      // Upload options.
      //
      // folder tells Cloudinary where to store this image.
      //
      // Inside your Cloudinary dashboard you'll see:
      //
      // chat-images/
      //      image1.png
      //      image2.jpg
      //      profile.png
      //
      // Cloudinary automatically creates this folder if
      // it doesn't already exist.
      {
        folder: "chat-images",
      },

      // This callback is automatically executed AFTER
      // Cloudinary finishes uploading.
      //
      // IMPORTANT:
      //
      // This function is NOT called immediately.
      //
      // It is called later when Cloudinary responds.
      //
      // Possible outcomes:
      //
      // Success:
      //
      // error = null
      // result = upload information
      //
      // Failure:
      //
      // error = Error object
      // result = undefined
      //
      (error, result) => {

        // Upload failed.
        //
        // reject() causes:
        //
        // await uploadToCloudinary(...)
        //
        // to throw an error which can be caught
        // inside a try/catch block.
        if (error) {
          return reject(error);
        }

        // A safety check.
        //
        // Normally if upload succeeds,
        // result should always exist.
        //
        // However defensive programming is good practice.
        //
        // If for some unexpected reason result is missing,
        // reject the Promise.
        if (!result) {
          return reject(new Error("Upload failed"));
        }

        // Upload succeeded.
        //
        // result contains lots of information like:
        //
        // {
        //     public_id,
        //     width,
        //     height,
        //     format,
        //     bytes,
        //     secure_url,
        //     ...
        // }
        //
        // secure_url is the HTTPS URL of the uploaded image.
        //
        // Example:
        //
        // https://res.cloudinary.com/xxxxx/image/upload/...
        //
        // resolve() finishes the Promise.
        //
        // Whoever wrote:
        //
        // const imageUrl = await uploadToCloudinary(...)
        //
        // now receives:
        //
        // imageUrl = result.secure_url
        resolve(result.secure_url);
      }
    );

    // Multer stored the uploaded image entirely in RAM
    // because we configured:
    //
    // storage: multer.memoryStorage()
    //
    // Therefore:
    //
    // file.buffer
    //
    // contains the raw binary bytes of the uploaded image.
    //
    // Example (conceptually):
    //
    // Buffer <FF D8 FF E0 ...>
    //
    // Calling stream.end(buffer) does TWO things:
    //
    // 1. Writes all bytes into Cloudinary's upload stream.
    // 2. Tells the stream:
    //
    //    "I'm done sending data."
    //
    // After this Cloudinary begins processing
    // and uploading the image.
    //
    // Once upload finishes,
    // the callback above is executed automatically.
    stream.end(file.buffer);
  });
};