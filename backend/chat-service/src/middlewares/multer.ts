import multer from "multer";

export const upload = multer({
  // memoryStorage() keeps it inside RAM. Like Buffer inside req.file.buffer Nothing is written to disk.

  // Because immediately after receiving it, uploading it to Cloudinary. No need to waste disk space.
  storage: multer.memoryStorage(),

  // max size can be 5 mbs 1024 bytes = 1kb 1024kb = 1mb
  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});
