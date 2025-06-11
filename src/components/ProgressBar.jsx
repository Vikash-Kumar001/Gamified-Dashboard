import React, { useEffect, useRef, useState, useCallback } from "react";
import { Zap, Star, Trophy, Target, Flame, Crown, Sparkles, Volume2, VolumeX } from "lucide-react";

const themes = {
    cosmic: {
        bg: 'bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100',
        progress: 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400',
        glow: 'shadow-purple-500/50',
        particle: 'bg-purple-400',
        text: 'text-purple-800',
        accent: 'text-cyan-700'
    },
    fire: {
        bg: 'bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100',
        progress: 'bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400',
        glow: 'shadow-orange-500/50',
        particle: 'bg-orange-400',
        text: 'text-orange-800',
        accent: 'text-yellow-700'
    },
    ocean: {
        bg: 'bg-gradient-to-r from-blue-100 via-cyan-100 to-teal-100',
        progress: 'bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400',
        glow: 'shadow-cyan-500/50',
        particle: 'bg-cyan-400',
        text: 'text-blue-800',
        accent: 'text-teal-700'
    },
    nature: {
        bg: 'bg-gradient-to-r from-green-100 via-emerald-100 to-lime-100',
        progress: 'bg-gradient-to-r from-green-500 via-emerald-400 to-lime-400',
        glow: 'shadow-emerald-500/50',
        particle: 'bg-emerald-400',
        text: 'text-green-800',
        accent: 'text-lime-700'
    },
    gold: {
        bg: 'bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100',
        progress: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400',
        glow: 'shadow-amber-500/50',
        particle: 'bg-amber-400',
        text: 'text-amber-800',
        accent: 'text-orange-700'
    }
};

const milestones = [
    { percent: 25, icon: Target, label: "Quarter Way", effect: "pulse" },
    { percent: 50, icon: Zap, label: "Halfway There", effect: "bounce" },
    { percent: 75, icon: Star, label: "Almost Done", effect: "spin" },
    { percent: 100, icon: Crown, label: "Level Complete!", effect: "celebration" }
];

export default function AdvancedProgressBar({
    xp = 160,
    xpForNextLevel = 200,
    level = 2,
    title = "Experience Points",
    showMilestones = true,
    showParticles = true,
    soundEnabled = true,
    theme = "cosmic",
    size = "large",
    showStats = true
}) {
    const [displayPercent, setDisplayPercent] = useState(0);
    const [displayXP, setDisplayXP] = useState(0);
    const [particles, setParticles] = useState([]);
    const [achievedMilestones, setAchievedMilestones] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [soundToggle, setSoundToggle] = useState(soundEnabled);
    const [selectedTheme, setSelectedTheme] = useState(theme);

    const percent = Math.min(((xp % xpForNextLevel) / xpForNextLevel) * 100, 100);
    const prevPercent = useRef(percent);
    const prevXP = useRef(xp);
    const animationId = useRef();
    const containerRef = useRef();

    const currentTheme = themes[selectedTheme];
    const heightClass = size === "small" ? "h-6" : size === "medium" ? "h-8" : "h-12";

    const createParticle = useCallback((x, y) => {
        const id = Math.random().toString(36).substr(2, 9);
        const particle = {
            id,
            x: x || Math.random() * 100,
            y: y || 50,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            decay: 0.02 + Math.random() * 0.02,
            size: 2 + Math.random() * 4
        };
        setParticles(prev => [...prev, particle]);

        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
        }, 2000);
    }, []);

    const playSound = useCallback((frequency, duration = 100) => {
        if (!soundToggle) return;

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
            // Fallback for browsers without AudioContext
            console.log('Audio not supported');
        }
    }, [soundToggle]);

    const checkMilestones = useCallback((currentPercent) => {
        milestones.forEach(milestone => {
            if (currentPercent >= milestone.percent && !achievedMilestones.includes(milestone.percent)) {
                setAchievedMilestones(prev => [...prev, milestone.percent]);
                playSound(800 + milestone.percent * 2, 200);

                // Create celebration particles
                if (showParticles) {
                    for (let i = 0; i < 10; i++) {
                        setTimeout(() => createParticle(milestone.percent, 50), i * 50);
                    }
                }
            }
        });
    }, [achievedMilestones, playSound, showParticles, createParticle]);

    useEffect(() => {
        const startPercent = prevPercent.current;
        const endPercent = percent;
        const startXP = prevXP.current;
        const endXP = xp;
        let startTime = null;
        setIsAnimating(true);

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / 1000, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);

            const currentPercent = startPercent + (endPercent - startPercent) * easeOut;
            const currentXP = Math.round(startXP + (endXP - startXP) * easeOut);

            setDisplayPercent(Math.round(currentPercent));
            setDisplayXP(currentXP);

            checkMilestones(currentPercent);

            // Create progress particles
            if (showParticles && Math.random() < 0.3) {
                createParticle(currentPercent, 50);
            }

            if (progress < 1) {
                animationId.current = requestAnimationFrame(animate);
            } else {
                prevPercent.current = percent;
                prevXP.current = xp;
                setIsAnimating(false);
            }
        }

        animationId.current = requestAnimationFrame(animate);
        return () => {
            if (animationId.current) {
                cancelAnimationFrame(animationId.current);
            }
        };
    }, [percent, xp, checkMilestones, showParticles, createParticle]);

    // Animate particles
    useEffect(() => {
        const interval = setInterval(() => {
            setParticles(prev => prev.map(particle => ({
                ...particle,
                x: particle.x + particle.vx,
                y: particle.y + particle.vy,
                life: particle.life - particle.decay,
                vy: particle.vy + 0.1 // gravity
            })).filter(particle => particle.life > 0));
        }, 16);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
            {/* Controls */}
            <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                    {Object.keys(themes).map((themeName) => (
                        <button
                            key={themeName}
                            onClick={() => setSelectedTheme(themeName)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${selectedTheme === themeName
                                    ? 'bg-gray-800 text-white scale-105 border-gray-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                                }`}
                        >
                            {themeName}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setSoundToggle(!soundToggle)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all border border-gray-300"
                >
                    {soundToggle ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
            </div>

            {/* Stats */}
            {showStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-200">
                        <div className={`${currentTheme.accent} text-lg font-bold`}>Level {level}</div>
                        <div className="text-gray-600 text-xs font-medium">Current Level</div>
                    </div>
                    <div className="bg-gray-50 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-200">
                        <div className={`${currentTheme.accent} text-lg font-bold`}>{displayXP.toLocaleString()}</div>
                        <div className="text-gray-600 text-xs font-medium">Total XP</div>
                    </div>
                    <div className="bg-gray-50 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-200">
                        <div className={`${currentTheme.accent} text-lg font-bold`}>{displayPercent}%</div>
                        <div className="text-gray-600 text-xs font-medium">Progress</div>
                    </div>
                    <div className="bg-gray-50 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-200">
                        <div className={`${currentTheme.accent} text-lg font-bold`}>{xpForNextLevel - (xp % xpForNextLevel)}</div>
                        <div className="text-gray-600 text-xs font-medium">XP Needed</div>
                    </div>
                </div>
            )}

            {/* Main Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className={`text-sm font-semibold text-gray-800 flex items-center gap-2`}>
                        <Sparkles size={16} className={`${currentTheme.accent} ${isAnimating ? 'animate-spin' : ''}`} />
                        {title}
                    </span>
                    <span className={`text-xs font-medium ${currentTheme.accent} bg-gray-100 px-2 py-1 rounded-full border border-gray-200`}>
                        {displayXP.toLocaleString()} / {((Math.floor(xp / xpForNextLevel) + 1) * xpForNextLevel).toLocaleString()} XP
                    </span>
                </div>

                <div
                    ref={containerRef}
                    className={`relative w-full ${heightClass} rounded-full ${currentTheme.bg} border border-gray-300 shadow-lg overflow-hidden`}
                >
                    {/* Progress Fill */}
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full ${currentTheme.progress} transition-all duration-1000 ease-out shadow-lg ${currentTheme.glow}`}
                        style={{
                            width: `${displayPercent}%`,
                            boxShadow: `0 0 20px ${currentTheme.glow.includes('purple') ? '#a855f7' :
                                currentTheme.glow.includes('orange') ? '#f97316' :
                                    currentTheme.glow.includes('cyan') ? '#06b6d4' :
                                        currentTheme.glow.includes('emerald') ? '#10b981' : '#f59e0b'}40`
                        }}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>

                    {/* Milestones */}
                    {showMilestones && milestones.map((milestone) => {
                        const Icon = milestone.icon;
                        const isAchieved = achievedMilestones.includes(milestone.percent);
                        return (
                            <div
                                key={milestone.percent}
                                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                                style={{ left: `${milestone.percent}%` }}
                            >
                                <div className={`w-4 h-4 rounded-full border-2 ${isAchieved ? 'bg-white border-gray-600' : 'bg-gray-200 border-gray-400'
                                    } flex items-center justify-center transition-all duration-300 ${isAchieved ? `animate-${milestone.effect}` : ''
                                    }`}>
                                    <Icon size={8} className={isAchieved ? 'text-gray-800' : 'text-gray-500'} />
                                </div>

                                {/* Milestone Label */}
                                {isAchieved && (
                                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                                        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg border border-gray-600">
                                            {milestone.label}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Particles */}
                    {showParticles && particles.map((particle) => (
                        <div
                            key={particle.id}
                            className={`absolute rounded-full ${currentTheme.particle} pointer-events-none`}
                            style={{
                                left: `${particle.x}%`,
                                top: `${particle.y}%`,
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                opacity: particle.life,
                                transform: 'translate(-50%, -50%)',
                                transition: 'all 0.016s linear'
                            }}
                        />
                    ))}

                    {/* Percentage Display */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full px-3 py-1 shadow-lg">
                            <span className="text-sm font-bold text-gray-800 flex items-center gap-1">
                                {displayPercent}%
                                {percent === 100 && <Trophy size={14} className="text-yellow-500" />}
                            </span>
                        </div>
                    </div>
                </div>

                {/* XP Range Display */}
                <div className={`flex justify-between text-xs text-gray-600 font-medium`}>
                    <span>{Math.floor(xp / xpForNextLevel) * xpForNextLevel} XP</span>
                    <span>{(Math.floor(xp / xpForNextLevel) + 1) * xpForNextLevel} XP</span>
                </div>
            </div>

            {/* Achievement Notifications */}
            {achievedMilestones.length > 0 && (
                <div className="space-y-2">
                    <h4 className={`text-sm font-semibold text-gray-800 flex items-center gap-2`}>
                        <Star size={16} className={currentTheme.accent} />
                        Recent Achievements
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                        {achievedMilestones.map((milestone) => {
                            const milestoneData = milestones.find(m => m.percent === milestone);
                            const Icon = milestoneData?.icon || Star;
                            return (
                                <div
                                    key={milestone}
                                    className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-2 text-xs text-gray-700 border border-gray-300"
                                >
                                    <Icon size={12} className={currentTheme.accent} />
                                    {milestoneData?.label}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Additional Features */}
            <div className="flex gap-4 justify-center pt-4">
                <button
                    onClick={() => {
                        // Simulate adding XP
                        const newXP = Math.min(xp + 50, xpForNextLevel);
                        // This would normally be handled by parent component
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                    Add 50 XP 🎯
                </button>
                <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                    Checked In Today ✅
                </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-500" />
                    Achievements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-green-600 font-medium">First Login</div>
                        <div className="text-gray-600 text-xs">Welcome aboard!</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-purple-600 font-medium">7-Day Streak</div>
                        <div className="text-gray-600 text-xs">Consistency pays off</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-orange-600 font-medium">Level {level}</div>
                        <div className="text-gray-600 text-xs">Keep climbing!</div>
                    </div>
                </div>
            </div>
        </div>
    );
}