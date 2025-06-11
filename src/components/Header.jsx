import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { FaUserCircle } from 'react-icons/fa';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Header() {
    const navigate = useNavigate();
    const [dropdown, setDropdown] = useState(false);
    const [user] = useAuthState(auth);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    // Get initials from email if no photoURL
    const getInitials = (email) => email ? email[0].toUpperCase() : '?';

    return (
        <header className="w-full bg-white/90 backdrop-blur-md shadow-lg py-4 px-8 flex items-center justify-between z-30 border-b border-gray-100 sticky top-0">
            <div className="flex items-center gap-3">
                <span className="text-3xl animate-bounce">🎮</span>
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 tracking-tight drop-shadow">
                    Gamified Dashboard
                </span>
                <span className="ml-2 px-2 py-1 bg-gradient-to-r from-green-200 to-blue-200 rounded-full text-xs font-semibold text-green-700 shadow-sm animate-pulse">
                    Beta 2025
                </span>
            </div>
            <nav className="flex items-center gap-6 relative">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-indigo-700 rounded-xl font-semibold shadow hover:from-blue-200 hover:to-purple-200 transition border border-indigo-100"
                >
                    Dashboard
                </button>
                {/* Avatar/Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setDropdown((d) => !d)}
                        className="flex items-center gap-2 focus:outline-none"
                    >
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="avatar"
                                className="w-9 h-9 rounded-full border-2 border-indigo-400"
                            />
                        ) : (
                            <span className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-200 text-indigo-700 font-bold text-xl">
                                {getInitials(user?.email)}
                            </span>
                        )}
                        <span className="font-semibold">{user?.displayName || user?.email}</span>
                    </button>
                    {dropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg p-4 z-50 border">
                            <button
                                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded"
                                onClick={() => { setDropdown(false); navigate('/profile'); }}
                            >
                                View Profile
                            </button>
                            <button
                                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded"
                                onClick={() => { setDropdown(false); navigate('/settings'); }}
                            >
                                Settings
                            </button>
                            <button
                                className="w-full text-left py-2 px-3 text-red-600 hover:bg-gray-100 rounded"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
