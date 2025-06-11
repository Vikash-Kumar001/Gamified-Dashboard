import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';

export default function ProtectedRoute({ children }) {
    const [user, loading, error] = useAuthState(auth);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg text-gray-600 font-semibold">Authenticating...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <p className="text-red-600 font-semibold text-lg">Authentication Error</p>
                <p className="text-gray-500">{error.message}</p>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    return children;
}