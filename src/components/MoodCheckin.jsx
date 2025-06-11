import React, { useState, useEffect } from 'react';
import { FaHeart, FaCalendarAlt, FaChartLine, FaMoon, FaSun, FaCloud, FaRainbow } from 'react-icons/fa';

const moodData = {
    '😄': { 
        label: 'Ecstatic', 
        description: 'On top of the world!',
        color: 'from-yellow-400 to-orange-500',
        bgColor: 'from-yellow-50 to-orange-50',
        icon: FaSun,
        energy: 100
    },
    '🙂': { 
        label: 'Happy', 
        description: 'Feeling great today!',
        color: 'from-green-400 to-emerald-500',
        bgColor: 'from-green-50 to-emerald-50',
        icon: FaRainbow,
        energy: 80
    },
    '😐': { 
        label: 'Neutral', 
        description: 'Just another day.',
        color: 'from-gray-400 to-slate-500',
        bgColor: 'from-gray-50 to-slate-50',
        icon: FaCloud,
        energy: 50
    },
    '😢': { 
        label: 'Sad', 
        description: 'Having a tough time.',
        color: 'from-blue-400 to-indigo-500',
        bgColor: 'from-blue-50 to-indigo-50',
        icon: FaCloud,
        energy: 30
    },
    '😠': { 
        label: 'Frustrated', 
        description: 'Need to work through this.',
        color: 'from-red-400 to-pink-500',
        bgColor: 'from-red-50 to-pink-50',
        icon: FaMoon,
        energy: 40
    },
};

export default function MoodCheckin({
    mood,
    onMoodChange,
    journalEntries = [],
}) {
    const [showHistory, setShowHistory] = useState(false);
    const [selectedMood, setSelectedMood] = useState(mood);
    const [isAnimating, setIsAnimating] = useState(false);

    const currentMoodData = moodData[selectedMood] || moodData['😐'];
    const IconComponent = currentMoodData.icon;

    const handleMoodSelect = (newMood) => {
        if (newMood !== selectedMood) {
            setIsAnimating(true);
            setSelectedMood(newMood);
            onMoodChange({ target: { value: newMood } });
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    const getMoodStats = () => {
        if (journalEntries.length === 0) return null;
        
        const moodCounts = {};
        journalEntries.forEach(entry => {
            const mood = entry.mood || '😐';
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
        
        const totalEntries = journalEntries.length;
        const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
            moodCounts[a] > moodCounts[b] ? a : b
        );
        
        return { moodCounts, totalEntries, dominantMood };
    };

    const stats = getMoodStats();

    return (
        <div className={`relative overflow-hidden rounded-3xl shadow-2xl border border-white/20 w-full max-w-4xl mx-auto transition-all duration-700 bg-gradient-to-br ${currentMoodData.bgColor}`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]"></div>
            </div>

            {/* Header Section */}
            <div className={`relative z-10 p-8 bg-gradient-to-r ${currentMoodData.color} text-white`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <FaHeart className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">Mood Check-in</h2>
                            <p className="text-white/80">How are you feeling right now?</p>
                        </div>
                    </div>
                    <div className={`transition-all duration-500 ${isAnimating ? 'scale-125 rotate-12' : 'scale-100'}`}>
                        <IconComponent className="text-4xl drop-shadow-lg" />
                    </div>
                </div>
            </div>

            <div className="relative z-10 p-8">
                {/* Mood Selection */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"></span>
                        Select Your Mood
                    </h3>
                    
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        {Object.entries(moodData).map(([emoji, data]) => {
                            const isSelected = selectedMood === emoji;
                            return (
                                <button
                                    key={emoji}
                                    onClick={() => handleMoodSelect(emoji)}
                                    className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 ${
                                        isSelected 
                                            ? `border-transparent bg-gradient-to-br ${data.color} text-white shadow-lg scale-105` 
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-105'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className={`text-3xl mb-2 transition-transform duration-300 ${
                                            isSelected ? 'scale-110' : 'group-hover:scale-110'
                                        }`}>
                                            {emoji}
                                        </div>
                                        <div className={`text-xs font-medium ${
                                            isSelected ? 'text-white' : 'text-gray-600'
                                        }`}>
                                            {data.label}
                                        </div>
                                    </div>
                                    
                                    {/* Energy Level Indicator */}
                                    <div className="absolute bottom-1 left-1 right-1">
                                        <div className={`h-1 rounded-full ${
                                            isSelected ? 'bg-white/30' : 'bg-gray-200'
                                        }`}>
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    isSelected ? 'bg-white' : 'bg-gray-400'
                                                }`}
                                                style={{ width: `${data.energy}%` }}
                                            />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Current Mood Display */}
                    <div className={`p-6 rounded-2xl bg-gradient-to-r ${currentMoodData.color} text-white shadow-lg`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-5xl">{selectedMood}</div>
                                <div>
                                    <h4 className="text-xl font-bold">{currentMoodData.label}</h4>
                                    <p className="text-white/80">{currentMoodData.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-white/80 mb-1">Energy Level</div>
                                <div className="text-2xl font-bold">{currentMoodData.energy}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                {stats && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FaChartLine className="text-green-500" />
                            Your Mood Insights
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
                                <div className="text-2xl font-bold text-gray-800">{stats.totalEntries}</div>
                                <div className="text-sm text-gray-600">Total Entries</div>
                            </div>
                            
                            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
                                <div className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    {stats.dominantMood}
                                    <span className="text-sm font-normal text-gray-600">
                                        {moodData[stats.dominantMood]?.label}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">Most Common Mood</div>
                            </div>
                            
                            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
                                <div className="text-2xl font-bold text-gray-800">
                                    {Math.round(journalEntries.reduce((sum, entry) => sum + (entry.content?.length || 0), 0) / stats.totalEntries)}
                                </div>
                                <div className="text-sm text-gray-600">Avg. Entry Length</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Journal History Toggle */}
                <div className="flex items-center justify-center">
                    <button
                        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-100"
                        onClick={() => setShowHistory(!showHistory)}
                        type="button"
                    >
                        <FaCalendarAlt />
                        {showHistory ? 'Hide' : 'View'} Mood History
                    </button>
                </div>

                {/* Journal History */}
                {showHistory && (
                    <div className="animate-fadeIn mt-8">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-500" />
                            Mood History
                        </h3>
                        
                        <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                            {journalEntries.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <FaHeart className="text-gray-400 text-2xl" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No mood entries yet</p>
                                    <p className="text-gray-400 text-sm">Start tracking your mood to see patterns!</p>
                                </div>
                            ) : (
                                journalEntries
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .map((entry, index) => {
                                        const entryMoodData = moodData[entry.mood] || moodData['😐'];
                                        return (
                                            <div 
                                                key={entry.date || entry.id} 
                                                className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]`}
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-2xl">{entry.mood}</div>
                                                        <div>
                                                            <div className="font-semibold text-gray-800">
                                                                {entryMoodData.label}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {new Date(entry.date).toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${entryMoodData.color} text-white`}>
                                                        Energy: {entryMoodData.energy}%
                                                    </div>
                                                </div>
                                                
                                                {entry.title && (
                                                    <h4 className="font-medium text-gray-800 mb-2">{entry.title}</h4>
                                                )}
                                                
                                                {entry.content && (
                                                    <p className="text-gray-700 leading-relaxed text-sm">
                                                        {entry.content.length > 150 
                                                            ? `${entry.content.substring(0, 150)}...` 
                                                            : entry.content
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}