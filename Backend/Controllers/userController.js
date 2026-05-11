import { setOptMail } from "../EmailVerify/sendOtpMal.js";
import { verifyMail } from "../EmailVerify/verifyEmail.js";
import { Section } from "../models/SectionModel.js";
import { User } from "../models/Usermodels.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cloudinary from '../utils/cloudinary.js';
import Editor from "../models/EditorModel.js";
import fs from 'fs'; 
import { Upload } from "../models/UploadModel.js";

export const verification = async (req, res) => {
    try {
        const authHeadears = req.headers.authorization
        if (!authHeadears || !authHeadears.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Authorization Token is missing" })

        }
        const token = authHeadears.split(" ")[1]
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECREAT_KEY)
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(400).json({ success: false, message: "The registration token is expired" })
                // res.send(ErrorCode(400, 'The registration token is expire'))
            }
            return res.status(400).json({ success: false, message: "Token verfication is failed" })
            // return res.send(400, 'Token verification Failed')
        }
        const user = await User.findById(decoded.id)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not Found!" })
            // return res.send(404, 'User not Found!')
        }
        user.token = null
        user.isVerified = true
        await user.save()
        return res.status(200).json({ success: true, message: "Email verified sucessfully" })
        // return res.send(SuccessCode(200, 'Email Verified Successfully'))
    } catch (error) {
        console.log('There is some error in the Verification feild : ', error);
        return res.status(500).json({ success: false, message: error.message })
        // return res.send(500, error.message)
    }
}

export const logOutUser = async (req, res) => {
    try {
        const userId = req.userId
        await Section.deleteMany({ userId })
        await User.findByIdAndUpdate(userId, { isLoggedIn: false })
        return res.status(200).json({ success: true, message: "LogOut Sucessfully" })
        // return res.send(SuccessCode(200, 'LogOut Succussfully!'))
    } catch (error) {
        console.log('There is some erro in the logout the user:  ', error);
        return res.status(500).json({ success: false, message: error.message })
        // return res.send(ErrorCode(500, error.message))
    }
}

export const forgotpassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: "User not Found!" })
            // return res.send(ErrorCode(404, 'User not Found!'))
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expire = new Date(Date.now() + 10 * 60 * 1000)

        user.otp = otp
        user.otpExpiry = expire
        await user.save()

        await setOptMail(email, otp)
        return res.status(200).json({ success: true, message: "OTP Send Successfully ..." })
        // return res.send(SuccessCode(200, 'OTP Send Successfully'))
    } catch (error) {
        console.log('There is some error in the forgot password Function ', error);
        return res.status(500).json({ success: false, message: error.message })
        // return res.send(ErrorCode(500, error.message))
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body
        const email = req.params.email

        if (!otp) {
            return res.status(400).json({ success: false, message: "otp is requried" })
            // return res.send(ErrorCode(400, 'OTP is requried'))
        }
        try {
            const user = await User.findOne({ email })
            if (!user) {
                return res.status(404).json({ success: false, message: "User not Found" })
                // return res.send(ErrorCode(404, 'User not Found!'))
            }
            if (!user.otp || !user.otpExpiry) {
                return res.status(400).json({ success: false, message: "OTP not generated or already verified" })
                // return res.send(400, 'OTP not generated Because it is Already Verified')
            }
            if (user.otpExpiry < new Date()) {
                return res.status(400).json({ success: false, message: "Req for the new otp bcz previous is expire" })
                // return res.send(ErrorCode(400, 'Request for the new OTP BEcause the previous one os Expire'))
            }
            if (otp !== user.otp) {
                return res.status(400).json({ success: false, message: "Invalid OTP" })
                // return res.send(ErrorCode(400, 'Invalid OTP'))
            }
            user.otp = null
            user.otpExpiry = null
            await user.save()
            return res.status(200).json({ success: true, message: "Otp verified Successfully" })
            // return res.send(SuccessCode(200, 'OTP Verified Successfully'))
        } catch (error) {
            console.log('There is some error in verifing the OTP: ', error);
            return res.status(500).json({ success: false, message: error.message })
            // return res.send(400, error.message)
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
        // return res.send(ErrorCode(500, error.message))
    }
}

export const changePassword = async (req, res) => {
    try {
        const { newPassword, confirmpass } = req.body
        const email = req.params.email
        if (!newPassword || !confirmpass) {
            return res.status(400).json({ success: false, message: "All feilds are requried" })
            // return res.send(ErrorCode(400, 'All feilds are requried'))
        }
        if (newPassword !== confirmpass) {
            return res.status(400).json({ success: false, message: "Password do not matched" })
            // return res.send(ErrorCode(400, 'Password not matched'))
        }
        try {
            const user = await User.findOne({ email })
            if (!user) {
                return res.status(404).json({ success: false, message: "User is not Found" })
                // return res.send(ErrorCode(404, 'User not Found!'))
            }
            const hashPassword = await bcrypt.hash(newPassword, 10)
            user.password = hashPassword
            await user.save()
            return res.status(200).json({ success: true, message: "Password Changed Successfully" })
            // return res.send(SuccessCode(200, 'Password Change Successfuly'))
        } catch (error) {
            console.log("There is some error in the Forgot password deep  Function  :", error);
            return res.status(400).json({ success: false, message: error.message })
        }
    } catch (error) {
        console.log("There is some error in the Forgot password  Function  :", error);
        return res.status(500).json({ success: false, message: error.messag })
        // return res.status(500).json({ success: false, message: error.message })

    }
}

// export const registerUser = async (req, res) => {
//     try {
//         const { username, email, password, role } = req.body // role passed from frontend
//         if (!username || !email || !password) {
//             return res.status(400).json({ success: false, message: "All fields are required" })
//         }

//         const existingUser = await User.findOne({ email })
//         if (existingUser) {
//             return res.status(400).json({ success: false, message: "User Already exist" })
//         }

//         const hashPassword = await bcrypt.hash(password, 10)

//         // Logic: Only admin is hardcoded by email for safety, others are dynamic
//         let userRole = role || 'freelancer';
//         let approvalStatus = true;

//         // If it's an editor, they need admin approval (isApproved = false)
//         if (userRole === 'editor') {
//             approvalStatus = false;
//         }

//         // Manual Admin Check (You can change this email)
//         if (email === "waseeqniaz@gmail.com") {
//             userRole = 'admin';
//             approvalStatus = true;
//         }

//         const newUser = await User.create({
//             username,
//             email,
//             password: hashPassword,
//             role: userRole,
//             isApproved: approvalStatus
//         })

//         const token = jwt.sign({ id: newUser._id }, process.env.SECREAT_KEY, { expiresIn: "10min" })
//         verifyMail(token, email)
//         newUser.token = token
//         await newUser.save()

//         return res.status(201).json({
//             success: true,
//             message: userRole === 'editor' ? "Registered! Wait for Admin approval." : "User registered",
//             data: newUser
//         })
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message })
//     }
// }

export const registerUser = async (req, res) => {
    const documentPath = req.file ? req.file.path : null;

    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            if (documentPath) fs.unlinkSync(documentPath); 
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (documentPath) fs.unlinkSync(documentPath); 
            return res.status(400).json({ 
                success: false, 
                message: "User already exists with this email" 
            });
        }

        let userRole = role || 'freelancer';
        let approvalStatus = true;

        if (userRole === 'editor') {
            approvalStatus = false;
            if (!documentPath) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Verification document is required for Editors" 
                });
            }
        }

        if (email === "waseeqniaz@gmail.com") {
            userRole = 'admin';
            approvalStatus = true;
        }

     
        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashPassword,
            role: userRole,
            isApproved: approvalStatus,
            document: documentPath 
        });

        const token = jwt.sign(
            { id: newUser._id }, 
            process.env.SECREAT_KEY, 
            { expiresIn: "10min" }
        );

        newUser.token = token;
        await newUser.save();

        verifyMail(token, email); 

        return res.status(201).json({
            success: true,
            message: userRole === 'editor' 
                ? "Registration successful! Please verify your email and wait for Admin approval." 
                : "Registration successful! Please verify your email.",
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                isApproved: newUser.isApproved
            }
        });

    } catch (error) {
        if (documentPath) {
            try {
                fs.unlinkSync(documentPath);
            } catch (unlinkError) {
                console.error("Failed to delete file after error:", unlinkError);
            }
        }

        console.error("Registration Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error: " + error.message 
        });
    }
};

export const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({ success: false, message: "UnAuthorize Acess" })
        }
        const passChk = await bcrypt.compare(password, user.password);
        if (!passChk) {
            return res.status(402).json({ success: false, message: "Incorrect Password!" })
        }
        if (user.isVerified !== true) {
            return res.status(403).json({ success: false, message: "Please Verify Your account " })
        }

        // CHECK APPROVAL STATUS
        if (!user.isApproved) {
            return res.status(403).json({ success: false, message: "Your account is pending Admin approval." })
        }

        // Create section logic...
        const ExistingSection = await Section.findOne({ userId: user._id })
        if (ExistingSection) { await Section.deleteOne({ userId: user._id }) }
        await Section.create({ user: user._id })

        const acessToken = jwt.sign({ id: user._id, role: user.role }, process.env.SECREAT_KEY, { expiresIn: "10d" })
        user.isLoggedIn = true
        await user.save()

        return res.status(200).json({
            success: true,
            message: `WelCome Back ${user.username}`,
            acessToken,
            user
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const getPendingEditors = async (req, res) => {
    try {
        // Find users who are editors but haven't been approved yet
        const editors = await User.find({ role: 'editor', isApproved: false });
        res.status(200).json({ success: true, editors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const approveEditor = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { isApproved: true }, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "Editor Approved Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload an image" });
        }

        const userId = req.userId;

        const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "user_profiles",
                        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(fileBuffer);
            });
        };

        const result = await uploadToCloudinary(req.file.buffer);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { avatar: result.secure_url },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            data: updatedUser
        });

    } catch (error) {
        console.log("Error in uploadProfilePicture: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const profile = await Editor.findOne({ userId: req.userId });
        if (!profile) {
            return res.status(200).json({
                success: true,
                data: null,
                message: "No profile created yet"
            });
        }
        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllEditors = async (req, res) => {
    try {
        const editors = await Editor.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: editors
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateEditorProfile = async (req, res) => {
    try {

        const userId = req.userId;

        const { name, role, rate, status, experience, skills, bio, portfolioLinks } = req.body;

        if (!name || !role || !rate || !experience || !skills || !bio) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }


        const skillsArray = Array.isArray(skills) ? skills :
            (skills ? skills.split(',').map(s => s.trim()) : []);


        const profileData = {
            userId,
            name,
            role,
            rate: Number(rate),
            status: status || "Available",
            experience,
            skills: skillsArray,
            bio,
            portfolioLinks: Array.isArray(portfolioLinks)
                ? portfolioLinks
                : (portfolioLinks ? String(portfolioLinks).split(',').map((link) => link.trim()).filter(Boolean) : [])
        };


        const profile = await Editor.findOneAndUpdate(
            { userId: userId },
            profileData,
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile
        });

    } catch (error) {
        console.error("Error in updateEditorProfile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message
        });
    }
};

export const rejectEditor = async (req, res) => {
    try {
        const { id } = req.params;
        // Option A: Delete the user entirely
        const user = await User.findByIdAndDelete(id);

        // Option B: If you prefer to just change their role back to 'user' instead of deleting:
        // const user = await User.findByIdAndUpdate(id, { role: 'user', isApproved: false });

        // 2. Delete the associated Editor Profile 
        // We match by 'userId' because that's how it's saved in updateEditorProfile
        await Editor.findOneAndDelete({ userId: id });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({
            success: true,
            message: "User and associated Editor profile successfully removed"
        });
    } catch (error) {
        console.error("Error in rejectEditor:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject editor",
            error: error.message
        });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const q = String(req.query.q || "").trim();
        const role = String(req.query.role || "").trim().toLowerCase();
        const limit = Math.min(Math.max(Number(req.query.limit || 8), 1), 20);

        const filters = [];
        if (q) {
            filters.push({
                username: { $regex: q, $options: "i" }
            });
        }
        if (role) {
            filters.push({
                role: { $regex: `^${role}$`, $options: "i" }
            });
        }

        const query = filters.length > 0 ? { $and: filters } : {};

        const users = await User.find(query)
            .select("username role avatar email")
            .sort({ username: 1 })
            .limit(limit);

        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }
 
    const userId = req.userId;
 
    const saved = await Promise.all(
      req.files.map(async (file) => {
        const isVideo = file.mimetype.startsWith("video/");
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "chat_uploads",
              resource_type: isVideo ? "video" : "image",
              transformation: isVideo ? [] : [{ width: 1200, crop: "limit", quality: "auto" }],
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(file.buffer);
        });
 
        const doc = await Upload.create({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          mediaType: isVideo ? "video" : "image",
          originalName: file.originalname,
          size: file.size,
          uploadedBy: userId,
        });
 
        return {
          _id: doc._id,
          url: doc.url,
          mediaType: doc.mediaType,
          originalName: doc.originalName,
          size: doc.size,
        };
      })
    );
 
    return res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      data: saved,
      url: saved[0]?.url,
    });
  } catch (err) {
    console.error("[uploadFiles]", err);
    return res.status(500).json({ success: false, message: err.message || "Upload failed" });
  }
};
 
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const userId = req.userId;
 
    const doc = await Upload.findOne({ publicId });
    if (!doc) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
 
    if (String(doc.uploadedBy) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
 
    const resourceType = doc.mediaType === "video" ? "video" : "image";
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    await doc.deleteOne();
 
    return res.status(200).json({ success: true, message: "File deleted" });
  } catch (err) {
    console.error("[deleteFile]", err);
    return res.status(500).json({ success: false, message: err.message || "Delete failed" });
  }
};
 
export const getMyUploads = async (req, res) => {
  try {
    const userId = req.userId; 
 
    const files = await Upload.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .select("url mediaType originalName size createdAt");
 
    return res.status(200).json({ success: true, data: files });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};