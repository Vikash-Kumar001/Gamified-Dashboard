import React, { useState, useEffect, useCallback } from "react";
import {
    Trophy, Target, Star, Clock, Flame, CheckCircle2,
    Calendar, Zap, Gift, Medal, Crown, Sparkles,
    TrendingUp, Award, Timer, Plus, RotateCcw,
    Volume2, VolumeX, Settings
} from "lucide-react";

// Challenge categories and difficulties
const challengeCategories = {
    daily: { icon: Calendar, color: 'blue', label: 'Daily' },
    weekly: { icon: Target, color: 'green', label: 'Weekly' },
    streak: { icon: Flame, color: 'orange', label: 'Streak' },
    milestone: { icon: Trophy, color: 'purple', label: 'Milestone' }
};

const difficultyLevels = {
    easy: { color: 'green', xp: 10, icon: Star },
    medium: { color: 'yellow', xp: 25, icon: Zap },
    hard: { color: 'red', xp: 50, icon: Crown }
};

const defaultChallenges = [
    {
        id: 1,
        text: "Check in 5 days this week",
        completed: false,
        category: 'weekly',
        difficulty: 'easy',
        progress: 0,
        maxProgress: 5,
        xpReward: 25,
        streak: 0,
        lastCompleted: null,
        completedDates: [],
        description: "Build consistency by checking in regularly"
    },
    {
        id: 2,
        text: "Write a journal entry 3 days in a row",
        completed: false,
        category: 'streak',
        difficulty: 'medium',
        progress: 0,
        maxProgress: 3,
        xpReward: 35,
        streak: 0,
        lastCompleted: null,
        completedDates: [],
        description: "Develop a writing habit through daily reflection"
    },
    {
        id: 3,
        text: "Complete 10 daily check-ins",
        completed: false,
        category: 'milestone',
        difficulty: 'medium',
        progress: 0,
        maxProgress: 10,
        xpReward: 50,
        streak: 0,
        lastCompleted: null,
        completedDates: [],
        description: "Reach a significant milestone in your journey"
    },
    {
        id: 4,
        text: "Maintain a 7-day activity streak",
        completed: false,
        category: 'streak',
        difficulty: 'hard',
        progress: 0,
        maxProgress: 7,
        xpReward: 75,
        streak: 0,
        lastCompleted: null,
        completedDates: [],
        description: "Show dedication with a week-long streak"
    }
];

export default function AdvancedChallenges() {
    const [challenges, setChallenges] = useState(defaultChallenges);
    const [userId, setUserId] = useState("demo-user");
    const [totalXP, setTotalXP] = useState(0);
    const [completedChallenges, setCompletedChallenges] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showRewards, setShowRewards] = useState(false);
    const [recentReward, setRecentReward] = useState(null);
    const [animations, setAnimations] = useState({});
    const [showStats, setShowStats] = useState(true);

    // Calculate stats
    const completionRate = challenges.length > 0
        ? Math.round((challenges.filter(c => c.completed).length / challenges.length) * 100)
        : 0;
    const weeklyProgress = challenges.filter(c => c.category === 'weekly')
        .reduce((acc, c) => acc + (c.progress / c.maxProgress) * 100, 0)
        / challenges.filter(c => c.category === 'weekly').length || 0;

    // Sound effects
    const playSound = useCallback((frequency, duration = 100) => {
        if (!soundEnabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.log('Audio not supported');
        }
    }, [soundEnabled]);

    // Animation helper
    const triggerAnimation = (challengeId, type) => {
        setAnimations(prev => ({ ...prev, [challengeId]: type }));
        setTimeout(() => {
            setAnimations(prev => ({ ...prev, [challengeId]: null }));
        }, 1000);
    };

    const toggle2 = async (id) => {
        const challenge = challenges.find(c => c.id === id);
        const wasCompleted = challenge.completed;

        const updated = challenges.map((ch) => {
            if (ch.id === id) {
                const newCompleted = !ch.completed;
                const newProgress = newCompleted ? ch.maxProgress : Math.max(0, ch.progress - 1);

                return {
                    ...ch,
                    completed: newCompleted,
                    progress: newProgress,
                    lastCompleted: newCompleted ? new Date().toISOString() : ch.lastCompleted,
                    completedDates: newCompleted
                        ? [...ch.completedDates, new Date().toISOString()]
                        : ch.completedDates.slice(0, -1)
                };
            }
            return ch;
        });

        setChallenges(updated);

        // Handle rewards and sounds
        if (!wasCompleted && challenge) {
            setTotalXP(prev => prev + challenge.xpReward);
            setCompletedChallenges(prev => prev + 1);
            playSound(800, 200);
            triggerAnimation(id, 'complete');

            // Show reward notification
            setRecentReward({
                xp: challenge.xpReward,
                challenge: challenge.text
            });
            setShowRewards(true);
            setTimeout(() => setShowRewards(false), 3000);
        } else if (wasCompleted && challenge) {
            setTotalXP(prev => Math.max(0, prev - challenge.xpReward));
            setCompletedChallenges(prev => Math.max(0, prev - 1));
            playSound(400, 100);
            triggerAnimation(id, 'uncomplete');
        }
    };

    const incrementProgress = (id) => {
        const updated = challenges.map((ch) => {
            if (ch.id === id && ch.progress < ch.maxProgress) {
                const newProgress = ch.progress + 1;
                const newCompleted = newProgress >= ch.maxProgress;

                if (newCompleted && !ch.completed) {
                    setTotalXP(prev => prev + ch.xpReward);
                    setCompletedChallenges(prev => prev + 1);
                    playSound(800, 200);
                    triggerAnimation(id, 'complete');

                    setRecentReward({
                        xp: ch.xpReward,
                        challenge: ch.text
                    });
                    setShowRewards(true);
                    setTimeout(() => setShowRewards(false), 3000);
                } else {
                    playSound(600, 100);
                    triggerAnimation(id, 'progress');
                }

                return {
                    ...ch,
                    progress: newProgress,
                    completed: newCompleted,
                    lastCompleted: new Date().toISOString()
                };
            }
            return ch;
        });
        setChallenges(updated);
    };

    const resetChallenge = (id) => {
        const updated = challenges.map((ch) => {
            if (ch.id === id) {
                if (ch.completed) {
                    setTotalXP(prev => Math.max(0, prev - ch.xpReward));
                    setCompletedChallenges(prev => Math.max(0, prev - 1));
                }
                return {
                    ...ch,
                    progress: 0,
                    completed: false,
                    completedDates: []
                };
            }
            return ch;
        });
        setChallenges(updated);
        playSound(300, 100);
        triggerAnimation(id, 'reset');
    };

    const filteredChallenges = selectedCategory === 'all'
        ? challenges
        : challenges.filter(c => c.category === selectedCategory);

    const getCategoryIcon = (category) => {
        const categoryData = challengeCategories[category];
        const Icon = categoryData?.icon || Target;
        return Icon;
    };

    const get2 = (difficulty) => {
        return difficultyLevels[difficulty]?.color || 'gray';
    };

    return (
        <div className="w-full space-y-6">
            {/* Header with Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                <Trophy className="text-white" size={24} />
                            </div>
                            Challenges
                        </h2>
                        <p className="text-gray-600 mt-1">Complete challenges to earn XP and unlock achievements</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                        >
                            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total XP</p>
                                <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
                            </div>
                            <Zap className="text-blue-200" size={24} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Completed</p>
                                <p className="text-2xl font-bold">{completedChallenges}</p>
                            </div>
                            <CheckCircle2 className="text-green-200" size={24} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Success Rate</p>
                                <p className="text-2xl font-bold">{completionRate}%</p>
                            </div>
                            <TrendingUp className="text-orange-200" size={24} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Current Streak</p>
                                <p className="text-2xl font-bold">{currentStreak}</p>
                            </div>
                            <Flame className="text-purple-200" size={24} />
                        </div>
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedCategory === 'all'
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All Challenges
                    </button>
                    {Object.entries(challengeCategories).map(([key, category]) => {
                        const Icon = category.icon;
                        const count = challenges.filter(c => c.category === key).length;
                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${selectedCategory === key
                                        ? `bg-${category.color}-500 text-white`
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Icon size={16} />
                                {category.label} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Reward Notification */}
            {showRewards && recentReward && (
                <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-xl animate-bounce">
                    <div className="flex items-center gap-2">
                        <Gift size={20} />
                        <div>
                            <p className="font-bold">Challenge Complete!</p>
                            <p className="text-sm">+{recentReward.xp} XP earned</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Challenges List */}
            <div className="space-y-4">
                {filteredChallenges.map((challenge) => {
                    const CategoryIcon = getCategoryIcon(challenge.category);
                    const DifficultyIcon = difficultyLevels[challenge.difficulty].icon;
                    const progressPercent = (challenge.progress / challenge.maxProgress) * 100;
                    const isAnimating = animations[challenge.id];

                    return (
                        <div
                            key={challenge.id}
                            className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg ${challenge.completed ? 'ring-2 ring-green-200 bg-green-50' : ''
                                } ${isAnimating === 'complete' ? 'animate-pulse bg-green-100' :
                                    isAnimating === 'progress' ? 'animate-bounce' :
                                        isAnimating === 'reset' ? 'animate-spin' :
                                            isAnimating === 'uncomplete' ? 'animate-shake' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg bg-${challengeCategories[challenge.category]?.color || 'gray'}-100`}>
                                            <CategoryIcon
                                                size={20}
                                                className={`text-${challengeCategories[challenge.category]?.color || 'gray'}-600`}
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className={`font-semibold text-lg ${challenge.completed ? 'line-through text-gray-500' : 'text-gray-800'
                                                }`}>
                                                {challenge.text}
                                            </h3>
                                            <p className="text-gray-600 text-sm">{challenge.description}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${get2(challenge.difficulty)}-100 text-${get2(challenge.difficulty)}-700 flex items-center gap-1`}>
                                                <DifficultyIcon size={12} />
                                                {challenge.difficulty}
                                            </div>
                                            <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                                                <Star size={12} />
                                                {challenge.xpReward} XP
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {challenge.maxProgress > 1 && (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Progress: {challenge.progress}/{challenge.maxProgress}</span>
                                                <span>{Math.round(progressPercent)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full bg-gradient-to-r from-${challengeCategories[challenge.category]?.color || 'blue'}-400 to-${challengeCategories[challenge.category]?.color || 'blue'}-600 transition-all duration-500`}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 mt-4">
                                        {challenge.maxProgress === 1 ? (
                                            <button
                                                onClick={() => toggle2(challenge.id)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${challenge.completed
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                                    }`}
                                            >
                                                <CheckCircle2 size={16} />
                                                {challenge.completed ? 'Completed' : 'Mark Complete'}
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => incrementProgress(challenge.id)}
                                                    disabled={challenge.completed}
                                                    className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                                >
                                                    <Plus size={16} />
                                                    Add Progress
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => resetChallenge(challenge.id)}
                                            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-2"
                                            title="Reset Challenge"
                                        >
                                            <RotateCcw size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Completion Badge */}
                                {challenge.completed && (
                                    <div className="ml-4">
                                        <div className="p-3 bg-green-100 rounded-full">
                                            <Medal className="text-green-600" size={24} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Last Completed */}
                            {challenge.lastCompleted && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock size={12} />
                                        Last activity: {new Date(challenge.lastCompleted).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredChallenges.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Target className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Challenges Found</h3>
                    <p className="text-gray-600">Try selecting a different category or add new challenges.</p>
                </div>
            )}

            {/* Achievement Summary */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Crown size={24} />
                    Your Achievement Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="text-yellow-300" size={20} />
                            <span className="font-semibold">Total Achievements</span>
                        </div>
                        <p className="text-2xl font-bold">{completedChallenges}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-cyan-300" size={20} />
                            <span className="font-semibold">Experience Points</span>
                        </div>
                        <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="text-green-300" size={20} />
                            <span className="font-semibold">Success Rate</span>
                        </div>
                        <p className="text-2xl font-bold">{completionRate}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
