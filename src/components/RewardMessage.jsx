import React, { useState } from 'react';

export default function RewardMessage({ xp, xpForNextLevel, level }) {
    const [showModal, setShowModal] = useState(true);
    const percent = Math.min((xp % xpForNextLevel) / xpForNextLevel * 100, 100);

    // Advanced: Show a modal when level up is achieved
    if (percent === 100 && showModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center animate-pop">
                    <div className="text-5xl mb-4 animate-bounce">🏆</div>
                    <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 mb-2">
                        Level Up!
                    </h2>
                    <p className="text-lg text-gray-700 mb-4 text-center">
                        🎉 Congratulations! You've reached <span className="font-bold text-green-700">Level {level + 1}</span>!<br />
                        Claim your reward and keep progressing!
                    </p>
                    <button
                        onClick={() => setShowModal(false)}
                        className="mt-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-pink-400 text-white rounded-xl font-bold shadow-lg hover:from-indigo-600 hover:to-pink-500 transition transform hover:scale-105"
                    >
                        Claim Reward
                    </button>
                </div>
            </div>
        );
    }

    if (percent >= 80) {
        return (
            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 via-yellow-50 to-white rounded-xl text-yellow-800 text-center font-semibold flex items-center justify-center gap-2 animate-pulse">
                <span className="text-xl">⚡</span>
                Almost there! Just a little more XP to level up!
            </div>
        );
    }

    if (percent === 0 && level === 1) {
        return (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-100 via-blue-50 to-white rounded-xl text-blue-800 text-center font-medium flex items-center gap-2">
                <span className="text-xl">✨</span>
                Start earning XP to unlock rewards!
            </div>
        );
    }

    // Motivational message for mid-progress
    if (percent > 0 && percent < 80) {
        return (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 via-pink-50 to-white rounded-xl text-purple-800 text-center font-medium flex items-center gap-2">
                <span className="text-xl">🔥</span>
                Great progress! Keep going to reach the next level!
            </div>
        );
    }

    return null;
}