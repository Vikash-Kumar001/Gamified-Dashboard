import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../services/firebase';
import { FaUserCircle, FaCamera, FaSpinner } from 'react-icons/fa';
import Header from '../components/Header';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Profile() {
    const [user, loading, error] = useAuthState(auth);
    const [previewURL, setPreviewURL] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [success, setSuccess] = useState('');

    // Set initial preview URL when user loads
    useEffect(() => {
        if (user?.photoURL) {
            setPreviewURL(user.photoURL);
        }
    }, [user]);

    const validateFile = (file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (file.size > maxSize) {
            return 'File size must be less than 5MB';
        }

        if (!allowedTypes.includes(file.type)) {
            return 'Only JPEG, PNG, GIF, and WebP images are allowed';
        }

        return null;
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
            setUploadError(validationError);
            return;
        }

        const storage = getStorage();
        const fileRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);

        try {
            setUploading(true);
            setUploadError('');
            setSuccess('');

            // Upload file to Firebase Storage
            const snapshot = await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            // Update Firebase Auth profile
            await updateProfile(user, { photoURL: downloadURL });
            
            // Update leaderboard entry if it exists (for consistency with dashboard)
            try {
                await setDoc(doc(db, 'leaderboard', user.uid), {
                    displayName: user.displayName || user.email || 'Anonymous',
                    email: user.email,
                    photoURL: downloadURL,
                    lastUpdated: new Date().toISOString()
                }, { merge: true });
            } catch (leaderboardError) {
                // Don't fail the whole operation if leaderboard update fails
                console.warn('Could not update leaderboard photo:', leaderboardError);
            }

            setPreviewURL(downloadURL);
            setSuccess('Profile image updated successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Upload error:', err);
            
            // Provide more specific error messages
            if (err.code === 'storage/unauthorized') {
                setUploadError('You do not have permission to upload files. Please check your authentication.');
            } else if (err.code === 'storage/canceled') {
                setUploadError('Upload was canceled.');
            } else if (err.code === 'storage/unknown') {
                setUploadError('An unknown error occurred. Please try again.');
            } else {
                setUploadError('Image upload failed. Please try again.');
            }
        } finally {
            setUploading(false);
            // Clear the file input
            e.target.value = '';
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
                <Header />
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2 text-xl text-gray-600">
                        <FaSpinner className="animate-spin" />
                        Loading profile...
                    </div>
                </div>
            </div>
        );
    }

    // Auth error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
                <Header />
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <h2 className="text-xl font-bold text-red-800 mb-2">Authentication Error</h2>
                        <p className="text-red-600">{error.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
                <Header />
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                        <h2 className="text-xl font-bold text-yellow-800 mb-2">Not Signed In</h2>
                        <p className="text-yellow-600">Please sign in to view your profile.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
            <Header />
            <div className="max-w-2xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
                    My Profile
                </h1>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    <div className="flex flex-col items-center text-center">
                        {/* Profile Image Section */}
                        <div className="relative w-32 h-32 mb-6 group">
                            {previewURL ? (
                                <img
                                    src={previewURL}
                                    alt="User Avatar"
                                    className="w-32 h-32 rounded-full border-4 border-indigo-400 object-cover shadow-lg"
                                />
                            ) : (
                                <FaUserCircle className="w-full h-full text-indigo-400" />
                            )}
                            
                            {/* Camera overlay */}
                            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                {uploading ? (
                                    <FaSpinner className="text-white text-2xl animate-spin" />
                                ) : (
                                    <FaCamera className="text-white text-2xl" />
                                )}
                            </label>
                        </div>

                        {/* Upload Button */}
                        <label className="cursor-pointer text-sm text-blue-600 font-medium mb-4 hover:underline transition-colors">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={uploading}
                            />
                            {uploading ? (
                                <span className="flex items-center gap-2">
                                    <FaSpinner className="animate-spin" />
                                    Uploading...
                                </span>
                            ) : (
                                'Change Profile Image'
                            )}
                        </label>

                        {/* Status Messages */}
                        {uploadError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4 max-w-md">
                                {uploadError}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm mb-4 max-w-md">
                                {success}
                            </div>
                        )}

                        {/* User Info */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {user.displayName || 'Anonymous User'}
                        </h2>
                        <p className="text-gray-600 mb-6">{user.email || 'No email available'}</p>
                    </div>

                    {/* Profile Details */}
                    <div className="mt-8">
                        <h3 className="font-semibold text-indigo-700 mb-4 text-lg">Profile Details</h3>
                        <div className="bg-indigo-50 rounded-xl p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Display Name:</span>
                                <span className="text-gray-900">{user.displayName || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Email:</span>
                                <span className="text-gray-900">{user.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Email Verified:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.emailVerified 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {user.emailVerified ? 'Verified' : 'Not Verified'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Account Created:</span>
                                <span className="text-gray-900">
                                    {user.metadata?.creationTime 
                                        ? new Date(user.metadata.creationTime).toLocaleDateString()
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Last Sign In:</span>
                                <span className="text-gray-900">
                                    {user.metadata?.lastSignInTime 
                                        ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* File Upload Guidelines */}
                    <div className="mt-6 text-xs text-gray-500 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Image Upload Guidelines:</h4>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Maximum file size: 5MB</li>
                            <li>Supported formats: JPEG, PNG, GIF, WebP</li>
                            <li>Recommended size: 400x400 pixels or larger</li>
                            <li>Images will be displayed as circular avatars</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}