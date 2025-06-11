import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Heart, Star, Zap, Sun, Moon, Palette, Volume2, VolumeX } from 'lucide-react';

const quotes = [
    { text: "Keep going, you're doing great!", category: "perseverance", mood: "encouraging" },
    { text: "Every day is a new beginning.", category: "renewal", mood: "hopeful" },
    { text: "Small steps lead to big changes.", category: "progress", mood: "motivating" },
    { text: "You are stronger than you think.", category: "strength", mood: "empowering" },
    { text: "Celebrate your progress!", category: "achievement", mood: "celebratory" },
    { text: "Your potential is limitless.", category: "growth", mood: "inspiring" },
    { text: "Embrace the journey, not just the destination.", category: "mindfulness", mood: "reflective" },
    { text: "Today's struggles are tomorrow's strengths.", category: "resilience", mood: "uplifting" },
    { text: "You're exactly where you need to be.", category: "acceptance", mood: "peaceful" },
    { text: "Dream big, start small, never give up.", category: "ambition", mood: "determined" },
    { text: "Your comeback is always stronger than your setback.", category: "resilience", mood: "powerful" },
    { text: "Progress over perfection, always.", category: "growth", mood: "encouraging" }
];

const themes = {
    sunrise: {
        bg: 'bg-gradient-to-br from-orange-300 via-pink-300 to-purple-400',
        card: 'bg-white/20 backdrop-blur-lg border-white/30',
        text: 'text-white',
        accent: 'text-orange-200'
    },
    ocean: {
        bg: 'bg-gradient-to-br from-blue-400 via-cyan-300 to-teal-400',
        card: 'bg-white/15 backdrop-blur-lg border-white/25',
        text: 'text-white',
        accent: 'text-blue-200'
    },
    forest: {
        bg: 'bg-gradient-to-br from-green-400 via-emerald-300 to-teal-500',
        card: 'bg-white/20 backdrop-blur-lg border-white/30',
        text: 'text-white',
        accent: 'text-green-200'
    },
    midnight: {
        bg: 'bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800',
        card: 'bg-white/10 backdrop-blur-lg border-white/20',
        text: 'text-white',
        accent: 'text-indigo-300'
    },
    golden: {
        bg: 'bg-gradient-to-br from-yellow-300 via-orange-300 to-red-400',
        card: 'bg-white/20 backdrop-blur-lg border-white/30',
        text: 'text-white',
        accent: 'text-yellow-200'
    }
};

const animations = [
    'animate-pulse',
    'animate-bounce',
    'animate-ping',
    'animate-spin'
];

export default function AdvancedMotivationalQuote() {
    const [currentQuote, setCurrentQuote] = useState(quotes[0]);
    const [theme, setTheme] = useState('sunrise');
    const [isAnimating, setIsAnimating] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [autoRotate, setAutoRotate] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [showStats, setShowStats] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [quotesViewed, setQuotesViewed] = useState(0);

    const filteredQuotes = filterCategory === 'all'
        ? quotes
        : quotes.filter(q => q.category === filterCategory);

    const categories = [...new Set(quotes.map(q => q.category))];

    const getRandomQuote = useCallback(() => {
        const availableQuotes = filteredQuotes.filter(q => q.text !== currentQuote.text);
        if (availableQuotes.length === 0) return filteredQuotes[0];
        return availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
    }, [filteredQuotes, currentQuote.text]);

    const generateNewQuote = () => {
        setIsAnimating(true);
        if (soundEnabled) {
            // Simple audio feedback simulation
            const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext() : null;
            if (audioContext) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            }
        }

        setTimeout(() => {
            setCurrentQuote(getRandomQuote());
            setQuotesViewed(prev => prev + 1);
            setIsAnimating(false);
        }, 300);
    };

    const toggleFavorite = () => {
        setFavorites(prev => {
            const isFavorited = prev.some(fav => fav.text === currentQuote.text);
            if (isFavorited) {
                return prev.filter(fav => fav.text !== currentQuote.text);
            } else {
                return [...prev, currentQuote];
            }
        });
    };

    const isFavorited = favorites.some(fav => fav.text === currentQuote.text);

    useEffect(() => {
        if (autoRotate) {
            const interval = setInterval(generateNewQuote, 5000);
            return () => clearInterval(interval);
        }
    }, [autoRotate, getRandomQuote]);

    const currentTheme = themes[theme];

    return (
        <div className={`min-h-screen ${currentTheme.bg} p-4 transition-all duration-1000 relative overflow-hidden`}>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-2 h-2 bg-white/20 rounded-full animate-pulse`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Controls */}
                <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                    <div className="flex gap-2 flex-wrap">
                        {Object.keys(themes).map((themeName) => (
                            <button
                                key={themeName}
                                onClick={() => setTheme(themeName)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${theme === themeName
                                        ? 'bg-white/30 text-white scale-105'
                                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                {themeName}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-2 rounded-full ${currentTheme.card} ${currentTheme.text} hover:scale-110 transition-all`}
                        >
                            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className={`p-2 rounded-full ${currentTheme.card} ${currentTheme.text} hover:scale-110 transition-all`}
                        >
                            <Star size={18} />
                        </button>
                    </div>
                </div>

                {/* Stats Panel */}
                {showStats && (
                    <div className={`${currentTheme.card} rounded-2xl p-6 mb-6 border animate-fadeIn`}>
                        <h3 className={`${currentTheme.text} text-lg font-semibold mb-4`}>Your Journey</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className={`${currentTheme.accent} text-2xl font-bold`}>{quotesViewed}</div>
                                <div className={`${currentTheme.text} text-sm opacity-80`}>Quotes Viewed</div>
                            </div>
                            <div className="text-center">
                                <div className={`${currentTheme.accent} text-2xl font-bold`}>{favorites.length}</div>
                                <div className={`${currentTheme.text} text-sm opacity-80`}>Favorites</div>
                            </div>
                            <div className="text-center">
                                <div className={`${currentTheme.accent} text-2xl font-bold`}>{categories.length}</div>
                                <div className={`${currentTheme.text} text-sm opacity-80`}>Categories</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Quote Card */}
                <div className={`${currentTheme.card} rounded-3xl p-8 md:p-12 border shadow-2xl transform hover:scale-[1.02] transition-all duration-500 ${isAnimating ? 'scale-95 opacity-70' : ''}`}>
                    <div className="text-cente">
                        <div className={`${currentTheme.accent} mb-6`}>
                            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                                {currentQuote.mood === 'encouraging' && <Sun size={32} />}
                                {currentQuote.mood === 'hopeful' && <Star size={32} />}
                                {currentQuote.mood === 'motivating' && <Zap size={32} />}
                                {currentQuote.mood === 'empowering' && <Heart size={32} />}
                                {currentQuote.mood === 'celebratory' && <Star size={32} />}
                                {currentQuote.mood === 'inspiring' && <Sun size={32} />}
                                {currentQuote.mood === 'reflective' && <Moon size={32} />}
                                {currentQuote.mood === 'uplifting' && <Zap size={32} />}
                                {currentQuote.mood === 'peaceful' && <Moon size={32} />}
                                {currentQuote.mood === 'determined' && <Zap size={32} />}
                                {currentQuote.mood === 'powerful' && <Heart size={32} />}
                            </div>
                        </div>

                        <blockquote className={`${currentTheme.text} text-2xl md:text-4xl font-light leading-relaxed mb-8 transition-all duration-500`}>
                            "{currentQuote.text}"
                        </blockquote>

                        <div className={`${currentTheme.accent} text-sm uppercase tracking-wider mb-8 opacity-80`}>
                            {currentQuote.category} • {currentQuote.mood}
                        </div>

                        <div className="flex justify-center gap-4 mb-6">
                            <button
                                onClick={generateNewQuote}
                                disabled={isAnimating}
                                className={`flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 ${currentTheme.text} rounded-full font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100`}
                            >
                                <RefreshCw size={20} className={isAnimating ? 'animate-spin' : ''} />
                                New Quote
                            </button>

                            <button
                                onClick={toggleFavorite}
                                className={`flex items-center gap-2 px-6 py-3 ${isFavorited ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-white/20 hover:bg-white/30'} ${currentTheme.text} rounded-full font-medium transition-all hover:scale-105`}
                            >
                                <Heart size={20} className={isFavorited ? 'fill-current text-red-400' : ''} />
                                {isFavorited ? 'Favorited' : 'Favorite'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                    <div className="flex items-center gap-2">
                        <label className={`${currentTheme.text} text-sm`}>Auto-rotate:</label>
                        <button
                            onClick={() => setAutoRotate(!autoRotate)}
                            className={`w-12 h-6 rounded-full transition-all ${autoRotate ? 'bg-white/30' : 'bg-white/10'} relative`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${autoRotate ? 'left-6' : 'left-0.5'}`} />
                        </button>
                    </div>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={`px-4 py-2 rounded-full ${currentTheme.card} ${currentTheme.text} border-0 outline-none text-bl`}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Favorites Section */}
                {favorites.length > 0 && (
                    <div className="mt-12">
                        <h3 className={`${currentTheme.text} text-xl font-semibold mb-4 text-center`}>Your Favorites</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {favorites.map((quote, index) => (
                                <div key={index} className={`${currentTheme.card} rounded-xl p-4 border`}>
                                    <p className={`${currentTheme.text} text-sm`}>"{quote.text}"</p>
                                    <span className={`${currentTheme.accent} text-xs opacity-70`}>{quote.category}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}