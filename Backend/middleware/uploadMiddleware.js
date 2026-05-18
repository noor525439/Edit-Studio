import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // File extension nikalne ke liye
    const fileExtension = file.originalname.split('.').pop();
    
    return {
      folder: 'edit-studio/support-files',
      // Dynamic resource_type taake video, images aur raw docs sab upload ho sakein
      resource_type: 'auto', 
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
      public_id: `${Date.now()}-${file.originalname.replace(`.${fileExtension}`, '')}`
    };
  }
});

const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  }
});

export default uploadMiddleware;