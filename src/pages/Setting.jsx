import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import Header from '../components/Header';

export default function Settings() {
    const [user] = useAuthState(auth);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-900">
            <Header />
            <div className="max-w-2xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-extrabold mb-8">Settings</h1>

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-xl font-bold text-indigo-700 mb-4">Account</h2>

                    <div className="space-y-3 mb-6 text-sm">
                        <div>
                            <span className="font-semibold">Email:</span>
                            <span className="ml-2 text-gray-600">{user?.email || "Not available"}</span>
                        </div>
                        <div>
                            <span className="font-semibold">User ID:</span>
                            <span className="ml-2 text-gray-600 break-all">{user?.uid || "N/A"}</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-indigo-700 mb-4">Preferences</h2>

                    <div className="mb-6">
                        <label className="block mb-2 font-semibold">Theme</label>
                        <select
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            disabled
                        >
                            <option>Light</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Theme selection is currently disabled.</p>
                    </div>

                    <button
                        className="w-full mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow transition"
                        onClick={() => alert('Account deletion coming soon!')}
                        type="button"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
