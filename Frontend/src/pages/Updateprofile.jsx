import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react'; // Optional: install lucide-react
import { getData } from '@/context/UserContext';
import { toast } from 'react-toastify';

const UpdateProfile = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const { setUser } = getData();

    // Create a local preview URL when a file is selected
    useEffect(() => {
        if (!image) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(image);
        setPreview(objectUrl);

        // Clean up memory
        return () => URL.revokeObjectURL(objectUrl);
    }, [image]);

    // const handleUploadImage = async () => {
    //     if (!image) {
    //         alert("Please select an image first!");
    //         return;
    //     }

    //     setLoading(true);
    //     const formData = new FormData();
    //     formData.append("file", image);
    //     formData.append("upload_preset", "MyImages");
    //     formData.append("cloud_name", "doef2jzrc");

    //     try {
    //         const { data } = await axios.post(
    //             "https://api.cloudinary.com/v1_1/doef2jzrc/image/upload",
    //             formData
    //         );
    //         console.log('Image Data ', data);

    //         setUrl(data.secure_url);

    //     } catch (error) {
    //         console.error("Upload Error:", error.response?.data || error.message);
    //         alert("Upload failed. Check if your preset is 'Unsigned'.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

const handleUploadImage = async () => {
    if (!image) {
        toast.error("Please select an image first!");
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("avatar", image); 

    try {
        const token = localStorage.getItem("accessToken"); 
        const response = await axios.post(
            "http://localhost:3000/user/upload-profile", 
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}` 
                }
            }
        );

        if (response.data.success) {
            const updatedUser = response.data.data; 
    
            setUser(updatedUser); 
            
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            setUrl(updatedUser.avatar); 
            
            toast.success("Profile picture updated!");
        }

    } catch (error) {
        console.error("Upload Error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Upload failed.");
    } finally {
        setLoading(false);
    }
};
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Update Profile</h2>
                    <p className="mt-2 text-sm text-gray-600">Upload your new profile picture</p>
                </div>

                {/* Dropzone Area */}
                <div className="relative group">
                    <label className={`
                        flex flex-col items-center justify-center w-full h-64 
                        border-2 border-dashed rounded-xl cursor-pointer
                        transition-all duration-300 ease-in-out
                        ${preview ? 'border-green-400 bg-green-50' : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400'}
                    `}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {preview ? (
                                <img src={preview} alt="Preview" className="h-40 w-40 object-cover rounded-full border-4 border-white shadow-lg" />
                            ) : (
                                <>
                                    <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">Click to select image</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP</p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </label>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleUploadImage}
                    disabled={loading || !image}
                    className={`
                        w-full mt-6 py-3 px-4 rounded-xl font-bold text-white shadow-lg
                        transition-all duration-200 flex items-center justify-center gap-2
                        ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}
                        ${!image && !loading ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                    `}
                >
                    {loading ? (
                        <><span className="animate-spin">🌀</span> Uploading...</>
                    ) : (
                        'Save Profile Picture'
                    )}
                </button>

                {/* Success Message & Final Image */}
                {url && (
                    <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-xl animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-2 text-green-700 font-semibold mb-3">
                            <CheckCircle className="w-5 h-5" />
                            <span>Upload Successful!</span>
                        </div>
                       
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateProfile;