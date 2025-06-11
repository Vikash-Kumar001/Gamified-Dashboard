import React from "react";
import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { debounce } from 'lodash';
import Header from '../components/Header';
import MoodCheckin from '../components/MoodCheckin';
import ProgressBar from '../components/ProgressBar';
import RewardMessage from '../components/RewardMessage';
import MoodHistoryChart from '../components/MoodHistoryChart';
import MoodTrendsChart from '../components/MoodTrendsChart';
import MoodPieChart from '../components/MoodPieChart';
import MotivationalQuote from '../components/MotivationalQuote';
import Challenges from '../components/Challenges';
import Leaderboard from '../components/Leaderboard';
import JournalSentiment from '../components/JournalSentiment';
import { FaMedal, FaFire, FaStar, FaUserCircle } from "react-icons/fa";

const badges = [
    {
        icon: <FaMedal className="text-yellow-400" />,
        label: "First Login",
        unlocked: (xp, level, streak) => xp > 0 || level > 1 || streak > 0,
        description: "Log in for the first time."
    },
    {
        icon: <FaFire className="text-red-500" />,
        label: "7-Day Streak",
        unlocked: (xp, level, streak) => streak >= 7,
        description: "Check in for 7 days in a row."
    },
    {
        icon: <FaStar className="text-blue-400" />,
        label: "Level 5",
        unlocked: (xp, level, streak) => level >= 5,
        description: "Reach level 5."
    },
];

function getToday() {
    return new Date().toISOString().slice(0, 10);
}
function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}

export default function Dashboard() {
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [streak, setStreak] = useState(0);
    const [mood, setMood] = useState('🙂');
    const [journal, setJournal] = useState('');
    const [journalEntries, setJournalEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [lastCheckIn, setLastCheckIn] = useState(null);
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [moodHistory, setMoodHistory] = useState([]);
    const [users, setUsers] = useState([]);
    const [authError, setAuthError] = useState(null);
    const [leaderboardError, setLeaderboardError] = useState(null);

    const xpForNextLevel = 200;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const uid = user.uid;
                setUserId(uid);
                
                try {
                    const userRef = doc(db, 'users', uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        setXp(data.xp || 0);
                        setLevel(data.level || 1);
                        setStreak(data.streak || 0);
                        setMood(data.mood || '🙂');
                        setJournal(data.journal || '');
                        setLastCheckIn(data.lastCheckIn || null);
                        setMoodHistory(data.moodHistory || []);
                        setJournalEntries(data.journalEntries || []);
                    } else {
                        // Create new user document
                        await setDoc(userRef, {
                            xp: 0,
                            level: 1,
                            streak: 0,
                            mood: '🙂',
                            journal: '',
                            lastCheckIn: null,
                            moodHistory: [],
                            journalEntries: [],
                        });
                    }
                    setAuthError(null);
                } catch (error) {
                    console.error("Error loading user data:", error);
                    setAuthError("Failed to load user data. Please check your permissions.");
                }
                
                setLoading(false);
            } else {
                setLoading(false);
            }
        });

        // Fetch leaderboard data with better error handling
        const fetchUsers = async () => {
            try {
                // Wait for auth to be ready
                if (!auth.currentUser) {
                    console.log("No authenticated user, skipping leaderboard fetch");
                    return;
                }

                const leaderboardCollectionRef = collection(db, 'leaderboard');
                const snapshot = await getDocs(leaderboardCollectionRef);
                const usersArr = snapshot.docs.map(doc => ({
                    name: doc.data().displayName || doc.data().email || doc.id,
                    xp: doc.data().xp || 0,
                    streak: doc.data().streak || 0,
                }));
                usersArr.sort((a, b) => b.xp - a.xp);
                setUsers(usersArr);
                setLeaderboardError(null);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
                setLeaderboardError("Unable to load leaderboard. Check your permissions.");
                setUsers([]);
            }
        };

        // Add a delay to ensure auth is ready
        const timeoutId = setTimeout(fetchUsers, 1000);

        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    const handleMoodChange = async (e) => {
        const newMood = e.target.value;
        setMood(newMood);

        const today = getToday();
        let updatedHistory = moodHistory.filter(entry => entry.date !== today);
        updatedHistory.push({ date: today, mood: newMood });
        updatedHistory = updatedHistory
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-7);

        setMoodHistory(updatedHistory);

        if (userId) {
            try {
                await updateDoc(doc(db, 'users', userId), {
                    mood: newMood,
                    moodHistory: updatedHistory,
                });
            } catch (error) {
                console.error("Error updating mood:", error);
            }
        }
    };

    const handleJournalChange = (e) => {
        setJournal(e.target.value);
    };

    const handleJournalSubmit = async () => {
        const today = getToday();
        if (!journal.trim()) return;

        const updatedEntries = journalEntries.filter(entry => entry.date !== today);
        updatedEntries.push({ date: today, text: journal });
        setJournalEntries(updatedEntries);

        if (userId) {
            try {
                await updateDoc(doc(db, 'users', userId), {
                    journalEntries: updatedEntries,
                    journal: '',
                });
            } catch (error) {
                console.error("Error updating journal:", error);
            }
        }
        setJournal('');
    };

    const syncStatsToFirestore = debounce(async (newXp, newLevel, newStreak) => {
        if (!userId) return;
        try {
            // Update user document
            await updateDoc(doc(db, 'users', userId), {
                xp: newXp,
                level: newLevel,
                streak: newStreak,
            });
            
            // Update leaderboard entry
            await setDoc(doc(db, 'leaderboard', userId), {
                displayName: auth.currentUser?.displayName || auth.currentUser?.email || 'Anonymous',
                email: auth.currentUser?.email,
                xp: newXp,
                streak: newStreak,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
        } catch (err) {
            console.error("Error syncing stats:", err);
        }
    }, 1000);

    useEffect(() => {
        if (!loading && userId) {
            syncStatsToFirestore(xp, level, streak);
        }
    }, [xp, level, streak, loading, userId]);

    const handleAddXp = () => {
        const newXp = xp + 50;
        const didLevelUp = newXp >= xpForNextLevel;
        const newLevel = didLevelUp ? level + 1 : level;
        const adjustedXp = didLevelUp ? newXp - xpForNextLevel : newXp;

        setXp(adjustedXp);
        setLevel(newLevel);
        setStreak(streak + 1);

        if (didLevelUp) {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 2500);
        }
    };

    const handleDailyCheckIn = async () => {
        const today = getToday();
        if (lastCheckIn === today) return;

        const newStreak = lastCheckIn === getYesterday() ? streak + 1 : 1;
        const bonusXp = 20;
        const newXp = xp + bonusXp;
        
        setStreak(newStreak);
        setXp(newXp);
        setLastCheckIn(today);

        if (userId) {
            try {
                await updateDoc(doc(db, 'users', userId), {
                    streak: newStreak,
                    xp: newXp,
                    lastCheckIn: today,
                });
                
                await setDoc(doc(db, 'leaderboard', userId), {
                    displayName: auth.currentUser?.displayName || auth.currentUser?.email || 'Anonymous',
                    email: auth.currentUser?.email,
                    xp: newXp,
                    streak: newStreak,
                    lastUpdated: new Date().toISOString()
                }, { merge: true });
            } catch (error) {
                console.error("Error updating check-in:", error);
            }
        }
        if (newStreak % 7 === 0) setShowStreakModal(true);
    };

    const xpLeft = xpForNextLevel - xp;
    const showAlmostThere = xpLeft > 0 && xpLeft <= 50;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Show error message if there are authentication issues
    if (authError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow-lg">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-red-800 mb-4">Authentication Error</h2>
                        <p className="text-red-600 mb-6 text-lg">{authError}</p>
                        <p className="text-gray-600">
                            Please check your Firestore security rules and ensure you're properly authenticated.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
            <Header />
            
            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
                        Welcome to Your Dashboard 
                        <span className="inline-block animate-bounce ml-2">🚀</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
                        "Small steps lead to big changes."
                    </p>
                    
                    {/* Motivational Quote */}
                    <div className="mb-6">
                        <MotivationalQuote />
                    </div>
                    
                    {/* Almost There Alert */}
                    {showAlmostThere && (
                        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-yellow-800 px-6 py-3 rounded-full font-semibold shadow-sm">
                            <span className="text-2xl animate-pulse">⚡</span>
                            <span>Almost there! Just {xpLeft} more XP to level up!</span>
                        </div>
                    )}
                </div>
                
                {/* Main Dashboard Grid */}
                <div className="space-y-8">
                    
                    {/* Top Row - Progress & Mood */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Progress Card */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-indigo-700 mb-2 flex items-center justify-center gap-3">
                                    <span className="text-4xl animate-pulse">🏆</span>
                                    Your Progress
                                </h2>
                            </div>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="text-center">
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-4 mb-2">
                                        <span className="text-sm font-medium block">XP</span>
                                        <span className="text-3xl font-bold">{xp}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-4 mb-2">
                                        <span className="text-sm font-medium block">Level</span>
                                        <span className="text-3xl font-bold">{level}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-gradient-to-br from-pink-500 to-red-500 text-white rounded-2xl p-4 mb-2">
                                        <span className="text-sm font-medium block">Streak</span>
                                        <span className="text-3xl font-bold">{streak}d</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mb-8">
                                <ProgressBar xp={xp} xpForNextLevel={xpForNextLevel} />
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    onClick={handleAddXp}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Add 50 XP <span className="text-lg">🎯</span>
                                    </span>
                                </button>
                                <button
                                    className={`flex-1 px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 ${
                                        lastCheckIn === getToday()
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:scale-105'
                                    }`}
                                    onClick={handleDailyCheckIn}
                                    disabled={lastCheckIn === getToday()}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {lastCheckIn === getToday() ? 'Checked In Today ✅' : 'Daily Check-In 🎯'}
                                    </span>
                                </button>
                            </div>
                            
                            {/* Badges Section */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-bold text-indigo-700 mb-4 text-center">Achievements</h3>
                                <div className="flex justify-center gap-4">
                                    {badges.map((badge, idx) => {
                                        const isUnlocked = badge.unlocked(xp, level, streak);
                                        return (
                                            <div
                                                key={badge.label}
                                                className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-200 ${
                                                    isUnlocked 
                                                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200 shadow-md transform hover:scale-105' 
                                                        : 'bg-gray-100 opacity-50 border-2 border-gray-200'
                                                }`}
                                                title={isUnlocked ? badge.description : `Locked: ${badge.description}`}
                                            >
                                                <span className="text-3xl mb-2">{badge.icon}</span>
                                                <span className="text-xs font-semibold text-center">{badge.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        {/* Mood Check-In Card */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-pink-600 flex items-center justify-center gap-3">
                                    <span className="text-4xl animate-pulse">📝</span>
                                    Mood Check-In
                                </h2>
                            </div>
                            
                            <div className="space-y-6">
                                <MoodCheckin
                                    mood={mood}
                                    onMoodChange={handleMoodChange}
                                    journal={journal}
                                    onJournalChange={handleJournalChange}
                                    onJournalSubmit={handleJournalSubmit}
                                    journalEntries={journalEntries}
                                />
                                <JournalSentiment journal={journal} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                            <MoodHistoryChart moodHistory={moodHistory} />
                        </div>
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                            <MoodTrendsChart moodHistory={moodHistory} />
                        </div>
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                            <MoodPieChart moodHistory={moodHistory} />
                        </div>
                    </div>
                    
                    {/* Bottom Row - Challenges & Leaderboard */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                            <Challenges userId={userId} />
                        </div>
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                            {leaderboardError ? (
                                <div className="text-center p-8">
                                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                                    <h3 className="text-xl font-bold text-red-600 mb-2">Leaderboard Unavailable</h3>
                                    <p className="text-red-600 mb-4">{leaderboardError}</p>
                                    <p className="text-sm text-gray-500">The leaderboard will appear once permissions are configured.</p>
                                </div>
                            ) : (
                                <Leaderboard users={users} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Level Up Toast */}
            {showLevelUp && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-2xl text-xl font-bold flex items-center gap-3 animate-bounce">
                    <span className="text-3xl animate-pulse">🚀</span>
                    <span>Level Up! You reached Level {level}!</span>
                </div>
            )}
            
            {/* Streak Celebration Modal */}
            {showStreakModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 text-center transform animate-bounce">
                        <div className="text-6xl mb-6 animate-pulse">🎉</div>
                        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            {streak} Day Streak!
                        </h2>
                        <p className="text-lg text-gray-700 mb-8">
                            Amazing consistency! Keep your streak going for more rewards!
                        </p>
                        <button
                            onClick={() => setShowStreakModal(false)}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}