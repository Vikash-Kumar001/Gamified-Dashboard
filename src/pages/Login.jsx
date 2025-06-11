import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        if (isRegistering && password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/dashboard');
        } catch (err) {
            console.error('Firebase error:', err);
            setError(err.message);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            console.log('Google sign-in user:', result.user);
            navigate('/dashboard');
        } catch (err) {
            console.error('Google login error:', err);
            setError('Google sign-in failed. Try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-300 to-pink-200 relative overflow-hidden px-4">
            <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-pink-300 opacity-40 rounded-full blur-3xl z-0"></div>
            <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-blue-300 opacity-40 rounded-full blur-3xl z-0"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white px-8 py-10 rounded-3xl shadow-2xl border border-gray-100">
                    <div className="flex flex-col items-center mb-6">
                        <span className="text-4xl mb-2 animate-bounce">🎮</span>
                        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow">
                            {isRegistering ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1 text-center">
                            {isRegistering ? 'Join the gamified journey!' : 'Log in to your dashboard'}
                        </p>
                    </div>

                    {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3 pr-12 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                                required
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                                <svg width="20" height="20" fill="currentColor">
                                    <path d="M2 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4zm2 0v.01L10 9l6-4.99V4H4zm0 2.236V16h12V6.236l-6 4.99-6-4.99z" />
                                </svg>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3 pr-12 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                                required
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center text-gray-400 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 4.5C7.305 4.5 3.135 7.622 1.5 12c1.635 4.378 5.805 7.5 10.5 7.5s8.865-3.122 10.5-7.5C20.865 7.622 16.695 4.5 12 4.5zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M2 2l20 20-1.41 1.41-3.55-3.55A10.98 10.98 0 0 1 12 20C7.305 20 3.135 16.878 1.5 12a10.978 10.978 0 0 1 4.335-5.625L2 3.41 3.41 2 22 20zM12 4c4.695 0 8.865 3.122 10.5 7.5a10.973 10.973 0 0 1-3.524 4.772L16.94 15a5.5 5.5 0 0 0-7.94-7.94L7.475 6.94A10.954 10.954 0 0 1 12 4z" />
                                    </svg>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-pink-400 hover:from-blue-600 hover:to-pink-500 text-white rounded-xl font-bold text-lg shadow-md transition transform hover:scale-105"
                        >
                            {isRegistering ? 'Sign Up' : 'Log In'}
                        </button>
                    </form>

                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="mx-3 text-gray-400 text-xs font-medium">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full py-3 bg-white border border-gray-300 rounded-xl flex items-center justify-center gap-3 text-gray-700 hover:shadow-md transition font-medium"
                    >
                        <img src="googlelogo.png" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <p className="text-center text-base text-gray-700 mt-6">
                        {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="ml-2 px-3 py-1 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 transition font-semibold"
                        >
                            {isRegistering ? 'Login' : 'Register'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
