import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },

  fileFilter: (_req, file, cb) => {
    const allowed = [
      "audio/webm",
      "audio/wav",
      "audio/mpeg",
      "video/webm",
      "audio/mp4",
      "audio/ogg",
      "audio/m4a",
      "audio/x-m4a",
    ];
    const base = (file.mimetype || "").split(";")[0].trim().toLowerCase();

    if (!allowed.includes(base)) {
      const err = new Error("Invalid audio type");
      err.statusCode = 415;
      return cb(err);
    }

    cb(null, true);
  },
});

export default upload;
