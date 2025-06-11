import React, { useEffect, useState } from "react";
import { FaCrown, FaMedal, FaUserCircle, FaTrophy, FaFire, FaStar, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [currentUserEmail, setCurrentUserEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('xp');
    const [animateRanks, setAnimateRanks] = useState(false);
    const [hoveredUser, setHoveredUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef, orderBy(sortBy, "desc"));
                const snapshot = await getDocs(q);
                const userList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(userList);
                setAnimateRanks(true);
                setTimeout(() => setAnimateRanks(false), 1000);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) setCurrentUserEmail(user.email);
        });

        fetchUsers();
        return () => unsubscribe();
    }, [sortBy]);

    const handleSort = (field) => {
        setSortBy(field);
        setLoading(true);
    };

    const getRankIcon = (idx) => {
        if (idx === 0) return <FaCrown className="text-yellow-500 text-lg drop-shadow-md" title="Champion" />;
        if (idx === 1) return <FaMedal className="text-gray-400 text-lg drop-shadow-md" title="Runner-up" />;
        if (idx === 2) return <FaMedal className="text-amber-600 text-lg drop-shadow-md" title="Third Place" />;
        return null;
    };

    const getProgressColor = (level) => {
        const colors = [
            'from-blue-400 to-purple-500',
            'from-green-400 to-blue-500',
            'from-yellow-400 to-orange-500',
            'from-pink-400 to-red-500',
            'from-purple-400 to-indigo-500',
        ];
        return colors[level % colors.length];
    };

    const formatXP = (xp) => {
        if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
        if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
        return xp.toString();
    };

    if (loading) {
        return (
            <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl shadow-2xl p-8 mt-8 border border-slate-200">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl w-1/3"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mt-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <FaTrophy className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Hall of Fame</h3>
                                <p className="text-white/80 text-sm">Top performers worldwide</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSort('xp')}
                                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                    sortBy === 'xp' 
                                        ? 'bg-white/30 backdrop-blur-sm' 
                                        : 'bg-white/10 hover:bg-white/20'
                                }`}
                            >
                                XP {sortBy === 'xp' && <FaChevronDown className="inline ml-1" />}
                            </button>
                            <button
                                onClick={() => handleSort('streak')}
                                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                    sortBy === 'streak' 
                                        ? 'bg-white/30 backdrop-blur-sm' 
                                        : 'bg-white/10 hover:bg-white/20'
                                }`}
                            >
                                Streak {sortBy === 'streak' && <FaChevronDown className="inline ml-1" />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Leaderboard Content */}
            <div className="p-6">
                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <FaTrophy className="text-slate-400 text-2xl" />
                        </div>
                        <p className="text-slate-500 font-medium">No champions yet</p>
                        <p className="text-slate-400 text-sm">Be the first to climb the leaderboard!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {users.map((user, idx) => {
                            const xp = user.xp || 0;
                            const level = Math.floor(xp / 200) + 1;
                            const xpInLevel = xp % 200;
                            const percent = Math.min(100, (xpInLevel / 200) * 100);
                            const isCurrent = currentUserEmail && user.email === currentUserEmail;
                            const isTopThree = idx < 3;

                            const avatar = user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="avatar"
                                    className={`object-cover rounded-full border-3 transition-all duration-300 ${
                                        isTopThree ? 'w-16 h-16 border-yellow-300 shadow-lg' : 'w-12 h-12 border-slate-300'
                                    } ${hoveredUser === user.id ? 'scale-110 shadow-xl' : ''}`}
                                />
                            ) : (
                                <div className={`flex items-center justify-center rounded-full border-3 transition-all duration-300 ${
                                    isTopThree ? 'w-16 h-16 border-yellow-300 bg-gradient-to-br from-indigo-100 to-purple-100 shadow-lg' : 'w-12 h-12 border-slate-300 bg-slate-100'
                                } ${hoveredUser === user.id ? 'scale-110 shadow-xl' : ''}`}>
                                    <FaUserCircle className={`text-slate-400 ${isTopThree ? 'text-3xl' : 'text-2xl'}`} />
                                </div>
                            );

                            return (
                                <div
                                    key={user.id}
                                    className={`relative group transition-all duration-500 ${
                                        animateRanks ? 'animate-bounce' : ''
                                    }`}
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                    onMouseEnter={() => setHoveredUser(user.id)}
                                    onMouseLeave={() => setHoveredUser(null)}
                                >
                                    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                        isTopThree 
                                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg hover:shadow-xl' 
                                            : isCurrent 
                                                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-md hover:shadow-lg'
                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                                    } ${hoveredUser === user.id ? 'transform scale-[1.02]' : ''}`}>
                                        
                                        <div className="flex items-center gap-4">
                                            {/* Rank */}
                                            <div className={`flex items-center justify-center rounded-full font-bold transition-all duration-300 ${
                                                isTopThree 
                                                    ? 'w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-lg shadow-lg' 
                                                    : 'w-10 h-10 bg-slate-100 text-slate-600'
                                            }`}>
                                                {getRankIcon(idx) || (idx + 1)}
                                            </div>

                                            {/* Avatar */}
                                            <div className="relative">
                                                {avatar}
                                                {isTopThree && (
                                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                        <FaStar className="text-white text-xs" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`font-bold truncate ${
                                                        isTopThree ? 'text-lg text-orange-800' : 'text-slate-800'
                                                    }`}>
                                                        {user.name}
                                                    </h4>
                                                    {isCurrent && (
                                                        <span className="px-3 py-1 text-xs bg-emerald-200 text-emerald-800 rounded-full font-bold">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* Progress Bar */}
                                                <div className="mb-2">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-medium text-slate-600">
                                                            Level {level}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {xpInLevel}/200 XP
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(level)} transition-all duration-700 shadow-sm`}
                                                            style={{ 
                                                                width: `${percent}%`,
                                                                transform: hoveredUser === user.id ? 'scale(1.05)' : 'scale(1)'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="text-right">
                                                <div className={`font-bold mb-1 ${
                                                    isTopThree ? 'text-xl text-orange-700' : 'text-lg text-slate-700'
                                                }`}>
                                                    {formatXP(xp)}
                                                    <span className="text-xs text-slate-500 ml-1">XP</span>
                                                </div>
                                                <div className="flex items-center justify-end gap-1 text-sm">
                                                    <FaFire className="text-orange-500" />
                                                    <span className="font-medium text-slate-600">
                                                        {user.streak || 0}d
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover Effect Overlay */}
                                        {hoveredUser === user.id && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
                <div className="bg-gradient-to-r from-slate-100 to-blue-100 rounded-2xl p-4 text-center">
                    <p className="text-slate-600 text-sm font-medium">
                        🎯 Keep learning to climb the ranks!
                    </p>
                </div>
            </div>
        </div>
    );
}