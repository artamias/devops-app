import path from 'path';
import express from 'express';
import multer from 'multer';
import { minioClient, BUCKET_NAME } from '../config/minio.js';

const router = express.Router();

// Use memoryStorage
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
}

const upload = multer({ storage, fileFilter });

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No image file provided' });
  };

  try {
    const filename = `${req.file.fieldname}-${Date.now()}${path.extname(req.file.originalname)}`;
    const metaData = { 'Content-Type': req.file.mimetype };

    await minioClient.putObject(
      BUCKET_NAME,
      filename,
      req.file.buffer,
      req.file.size,
      metaData
    );

    // Return URL
    const imageUrl = `${process.env.MINIO_PUBLIC_URL}/${BUCKET_NAME}/${filename}`;

    res.status(200).send({
      message: 'Image uploaded successfully',
      image: imageUrl,
    });
  } catch (err) {
    console.error('MinIO upload error:', err);
    res.status(500).send({ message: 'Upload failed', error: err.message });
  }
});

export default router;