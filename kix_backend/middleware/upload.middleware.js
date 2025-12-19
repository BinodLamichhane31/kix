import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Middleware for single image upload (optional - allows no file)
export const uploadSingle = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    // Ignore multer errors if no file is provided (we allow URL instead)
    // Only pass through actual errors (like file size, file type)
    if (err) {
      // If it's a "no file" error, ignore it
      if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.message.includes('Unexpected field')) {
        return next();
      }
      // For other errors (file size, type), pass them through
      return next(err);
    }
    next();
  });
};

// Middleware for multiple images upload (main image + additional images)
export const uploadProductImages = (req, res, next) => {
  const fields = [
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 4 },
  ];
  
  upload.fields(fields)(req, res, (err) => {
    if (err) {
      // If it's a "no file" error, ignore it
      if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.message.includes('Unexpected field')) {
        return next();
      }
      // For other errors (file size, type), pass them through
      return next(err);
    }
    next();
  });
};

// Middleware for multiple images upload (legacy)
export const uploadMultiple = upload.array('images', 10); // Max 10 images

// Helper to get file URL
export const getFileUrl = (filename) => {
  if (!filename) return null;
  // If it's already a full URL, return it
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  // Return relative path that can be served statically
  return `/uploads/products/${filename}`;
};

