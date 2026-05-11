import express from "express"
import multer from "multer";
import path from "path";
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const Upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Only .png, .jpg, .jpeg and .pdf formats allowed!"));
        }
    }
});

import {
    changePassword,
    forgotpassword,
    LoginUser,
    logOutUser,
    registerUser,
    verification,
    verifyOtp,
    getPendingEditors,
    approveEditor,
    uploadProfilePicture,
    getAllEditors,
    updateEditorProfile,
    getMyProfile,
    rejectEditor,
    searchUsers,
    uploadFiles,
    deleteFile,
    getMyUploads,
} from '../Controllers/userController.js'

import { isAuthenticated } from "../middleware/authenticated.js"
import { UserSchema, validateUser } from "../validators/uservalidate.js"

// router.post('/register', validateUser(UserSchema), registerUser)
router.post('/register', Upload.single('document'), validateUser(UserSchema), registerUser);
router.post('/login', LoginUser)
router.post('/verify', verification)
router.post('/logout', isAuthenticated, logOutUser)
router.post('/forgot-password', forgotpassword)
router.post('/verify-otp/:email', verifyOtp)
router.post('/change-password/:email', changePassword)
router.post('/upload-profile', isAuthenticated, upload.single('avatar'), uploadProfilePicture);
router.post('/editor/update-profile', isAuthenticated, updateEditorProfile);
router.get('/editor/me', isAuthenticated, getMyProfile);
router.get('/all-editors', getAllEditors);
router.get('/search', isAuthenticated, searchUsers);
router.delete('/reject-editor/:id', isAuthenticated, rejectEditor)
router.get('/pending-editors', isAuthenticated, getPendingEditors)
router.put('/approve-editor/:id', isAuthenticated, approveEditor)
router.post("/upload", isAuthenticated, upload.array("file", 10), uploadFiles);
router.get("/upload/my", isAuthenticated, getMyUploads);
router.delete("/upload/:publicId", isAuthenticated, deleteFile);
export default router