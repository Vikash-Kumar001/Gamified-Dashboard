import React, { useState, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    AreaChart,
    Area,
    ComposedChart,
    Bar,
    ScatterChart,
    Scatter,
    ReferenceLine,
} from "recharts";

const MOOD_CONFIG = {
    "😊": { name: "Happy", score: 5, color: "#10b981", trend: "positive" },
    "🙂": { name: "Content", score: 4, color: "#06b6d4", trend: "positive" },
    "😐": { name: "Neutral", score: 3, color: "#6b7280", trend: "neutral" },
    "😔": { name: "Down", score: 2, color: "#f59e0b", trend: "negative" },
    "😢": { name: "Sad", score: 1, color: "#ef4444", trend: "negative" },
    "😤": { name: "Frustrated", score: 2, color: "#f97316", trend: "negative" },
    "😴": { name: "Tired", score: 2.5, color: "#8b5cf6", trend: "neutral" },
    "😰": { name: "Anxious", score: 1.5, color: "#ec4899", trend: "negative" },
    "🤗": { name: "Excited", score: 4.5, color: "#84cc16", trend: "positive" },
    "🤔": { name: "Thoughtful", score: 3.5, color: "#14b8a6", trend: "neutral" },
};

const CHART_TYPES = {
    line: "Line Chart",
    area: "Area Chart",
    scatter: "Scatter Plot",
    composed: "Trend + Volatility"
};

const TIME_RANGES = {
    week: { label: "Past Week", days: 7 },
    twoWeeks: { label: "Past 2 Weeks", days: 14 },
    month: { label: "Past Month", days: 30 },
    quarter: { label: "Past Quarter", days: 90 }
};

const TREND_INDICATORS = {
    improving: { emoji: "📈", color: "#10b981", label: "Improving" },
    declining: { emoji: "📉", color: "#ef4444", label: "Declining" },
    stable: { emoji: "➡️", color: "#6b7280", label: "Stable" },
    volatile: { emoji: "🎢", color: "#f59e0b", label: "Volatile" }
};

export default function MoodTrendsAnalytics({ moodHistory = [] }) {
    const [chartType, setChartType] = useState("area");
    const [timeRange, setTimeRange] = useState("twoWeeks");
    const [showTrendLine, setShowTrendLine] = useState(true);
    const [showVolatility, setShowVolatility] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    // Process mood data with advanced analytics
    const processedData = useMemo(() => {
        if (!moodHistory.length) return { chartData: [], analytics: {}, trends: {} };

        // Filter data by time range
        const now = new Date();
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - TIME_RANGES[timeRange].days);
        
        const filteredHistory = moodHistory
            .filter(entry => new Date(entry.date) >= cutoffDate)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (!filteredHistory.length) return { chartData: [], analytics: {}, trends: {} };

        // Prepare chart data with enhanced metrics
        const chartData = filteredHistory.map((entry, index) => {
            const config = MOOD_CONFIG[entry.mood] || { score: 3, color: "#6b7280", name: "Unknown" };
            const date = new Date(entry.date);
            
            return {
                date: entry.date.slice(5), // MM-DD format
                fullDate: entry.date,
                dayOfWeek: date.toLocaleDateString('en', { weekday: 'short' }),
                mood: entry.mood,
                moodName: config.name,
                moodScore: config.score,
                color: config.color,
                trend: config.trend,
                index,
                // Rolling averages
                ma3: index >= 2 ? calculateMovingAverage(filteredHistory.slice(index - 2, index + 1)) : config.score,
                ma7: index >= 6 ? calculateMovingAverage(filteredHistory.slice(index - 6, index + 1)) : config.score,
            };
        });

        // Calculate analytics
        const scores = chartData.map(d => d.moodScore);
        const analytics = {
            current: scores[scores.length - 1] || 3,
            average: scores.reduce((a, b) => a + b, 0) / scores.length,
            highest: Math.max(...scores),
            lowest: Math.min(...scores),
            volatility: calculateVolatility(scores),
            improvement: scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0,
            streak: calculateStreak(chartData),
            consistency: calculateConsistency(scores)
        };

        // Trend analysis
        const trends = {
            direction: getTrendDirection(scores),
            strength: getTrendStrength(scores),
            prediction: predictNextMood(scores),
            patterns: identifyPatterns(chartData)
        };

        // Add trend line data
        if (showTrendLine && scores.length > 1) {
            const trendLine = calculateLinearRegression(scores);
            chartData.forEach((point, index) => {
                point.trendLine = trendLine.slope * index + trendLine.intercept;
            });
        }

        return { chartData, analytics, trends };
    }, [moodHistory, timeRange, showTrendLine]);

    function calculateMovingAverage(entries) {
        const scores = entries.map(entry => MOOD_CONFIG[entry.mood]?.score || 3);
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    function calculateVolatility(scores) {
        if (scores.length < 2) return 0;
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        return Math.sqrt(variance);
    }

    function calculateStreak(data) {
        if (data.length < 2) return 0;
        
        let streak = 1;
        const lastTrend = data[data.length - 1].trend;
        
        for (let i = data.length - 2; i >= 0; i--) {
            if (data[i].trend === lastTrend) {
                streak++;
            } else {
                break;
            }
        }
        
        return { count: streak, type: lastTrend };
    }

    function calculateConsistency(scores) {
        if (scores.length < 3) return "N/A";
        const volatility = calculateVolatility(scores);
        if (volatility < 0.5) return "Very Consistent";
        if (volatility < 1) return "Consistent";
        if (volatility < 1.5) return "Moderate";
        return "Variable";
    }

    function getTrendDirection(scores) {
        if (scores.length < 3) return "stable";
        
        const recent = scores.slice(-7); // Last week
        const slope = calculateLinearRegression(recent).slope;
        
        if (slope > 0.1) return "improving";
        if (slope < -0.1) return "declining";
        if (calculateVolatility(recent) > 1) return "volatile";
        return "stable";
    }

    function getTrendStrength(scores) {
        if (scores.length < 3) return 0;
        const slope = Math.abs(calculateLinearRegression(scores).slope);
        return Math.min(slope * 10, 5); // Scale to 0-5
    }

    function calculateLinearRegression(values) {
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = values;
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    }

    function predictNextMood(scores) {
        if (scores.length < 3) return null;
        
        const { slope, intercept } = calculateLinearRegression(scores);
        const nextValue = slope * scores.length + intercept;
        
        return Math.max(1, Math.min(5, nextValue));
    }

    function identifyPatterns(data) {
        if (data.length < 7) return [];
        
        const patterns = [];
        
        // Weekend pattern
        const weekendData = data.filter(d => ['Sat', 'Sun'].includes(d.dayOfWeek));
        const weekdayData = data.filter(d => !['Sat', 'Sun'].includes(d.dayOfWeek));
        
        if (weekendData.length && weekdayData.length) {
            const weekendAvg = weekendData.reduce((sum, d) => sum + d.moodScore, 0) / weekendData.length;
            const weekdayAvg = weekdayData.reduce((sum, d) => sum + d.moodScore, 0) / weekdayData.length;
            
            if (Math.abs(weekendAvg - weekdayAvg) > 0.5) {
                patterns.push({
                    type: "weekend_effect",
                    description: weekendAvg > weekdayAvg ? "Happier on weekends" : "Lower mood on weekends",
                    strength: Math.abs(weekendAvg - weekdayAvg)
                });
            }
        }
        
        return patterns;
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{data.mood}</span>
                        <div>
                            <p className="font-semibold text-gray-800">{data.moodName}</p>
                            <p className="text-sm text-gray-600">{data.fullDate} ({data.dayOfWeek})</p>
                        </div>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Score:</span> {data.moodScore.toFixed(1)}/5</p>
                        {data.ma7 && <p><span className="font-medium">7-day Average:</span> {data.ma7.toFixed(1)}</p>}
                        {data.trendLine && <p><span className="font-medium">Trend:</span> {data.trendLine.toFixed(1)}</p>}
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const { chartData } = processedData;

        const commonProps = {
            data: chartData,
            margin: { top: 20, right: 30, left: 20, bottom: 20 }
        };

        switch (chartType) {
            case "line":
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <YAxis 
                            domain={[1, 5]} 
                            ticks={[1, 2, 3, 4, 5]}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={3} stroke="#6b7280" strokeDasharray="5 5" opacity={0.5} />
                        <Line 
                            type="monotone" 
                            dataKey="moodScore" 
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, stroke: "#8b5cf6", strokeWidth: 2 }}
                        />
                        {showTrendLine && (
                            <Line 
                                type="monotone" 
                                dataKey="trendLine" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                strokeDasharray="8 8"
                                dot={false}
                                activeDot={false}
                            />
                        )}
                    </LineChart>
                );

            case "area":
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <YAxis 
                            domain={[1, 5]} 
                            ticks={[1, 2, 3, 4, 5]}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={3} stroke="#6b7280" strokeDasharray="5 5" opacity={0.5} />
                        <Area 
                            type="monotone" 
                            dataKey="moodScore" 
                            stroke="#8b5cf6" 
                            fill="url(#moodGradient)"
                            strokeWidth={2}
                        />
                        {showTrendLine && (
                            <Line 
                                type="monotone" 
                                dataKey="trendLine" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                strokeDasharray="8 8"
                                dot={false}
                            />
                        )}
                        <defs>
                            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                    </AreaChart>
                );

            case "scatter":
                return (
                    <ScatterChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="index" 
                            type="number"
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <YAxis 
                            domain={[1, 5]} 
                            ticks={[1, 2, 3, 4, 5]}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={3} stroke="#6b7280" strokeDasharray="5 5" opacity={0.5} />
                        <Scatter 
                            dataKey="moodScore" 
                            fill="#8b5cf6"
                        />
                    </ScatterChart>
                );

            case "composed":
                return (
                    <ComposedChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <YAxis 
                            domain={[1, 5]} 
                            ticks={[1, 2, 3, 4, 5]}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={3} stroke="#6b7280" strokeDasharray="5 5" opacity={0.5} />
                        <Area 
                            type="monotone" 
                            dataKey="moodScore" 
                            stroke="#8b5cf6" 
                            fill="url(#moodGradient)"
                            strokeWidth={2}
                            fillOpacity={0.3}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="ma7" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={false}
                        />
                        <defs>
                            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                    </ComposedChart>
                );

            default:
                return null;
        }
    };

    const { chartData, analytics, trends } = processedData;

    if (!moodHistory.length) {
        return (
            <div className="w-full bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl shadow-xl p-8 mt-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">📈</div>
                    <h3 className="text-xl font-bold text-indigo-700 mb-2">No Trend Data Available</h3>
                    <p className="text-gray-600">Track your moods over time to see patterns and trends!</p>
                </div>
            </div>
        );
    }

    const trendIndicator = TREND_INDICATORS[trends.direction] || TREND_INDICATORS.stable;

    return (
        <div className="w-full bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-xl p-6 mt-8 border border-indigo-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-2xl font-bold text-indigo-700 flex items-center gap-2 mb-4 sm:mb-0">
                    <span className="animate-pulse">📈</span> 
                    Mood Trends & Analytics
                </h3>
                
                {/* Controls */}
                <div className="flex flex-wrap gap-2">
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-1 rounded-lg border border-indigo-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                    >
                        {Object.entries(TIME_RANGES).map(([key, range]) => (
                            <option key={key} value={key}>{range.label}</option>
                        ))}
                    </select>
                    
                    <select 
                        value={chartType} 
                        onChange={(e) => setChartType(e.target.value)}
                        className="px-3 py-1 rounded-lg border border-indigo-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                    >
                        {Object.entries(CHART_TYPES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-100">
                    <div className="text-2xl font-bold text-indigo-600">{analytics.current?.toFixed(1) || "—"}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Current Score</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-100">
                    <div className="text-2xl font-bold text-green-600">{analytics.average?.toFixed(1) || "—"}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Average</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-100">
                    <div className="text-2xl" style={{ color: trendIndicator.color }}>
                        {trendIndicator.emoji}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">{trendIndicator.label}</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-100">
                    <div className="text-2xl font-bold text-purple-600">{analytics.consistency}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Consistency</div>
                </div>
            </div>

            {/* Chart Options */}
            <div className="flex flex-wrap gap-4 mb-6">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={showTrendLine}
                        onChange={(e) => setShowTrendLine(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                    />
                    Show Trend Line
                </label>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 mb-6">
                <ResponsiveContainer width="100%" height={320}>
                    {renderChart()}
                </ResponsiveContainer>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Trend Analysis */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100">
                    <h4 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                        <span>📊</span> Trend Analysis
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Direction:</span>
                            <span className="font-semibold" style={{ color: trendIndicator.color }}>
                                {trendIndicator.emoji} {trendIndicator.label}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Volatility:</span>
                            <span className="font-semibold">{analytics.volatility?.toFixed(2) || "—"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Range:</span>
                            <span className="font-semibold">
                                {analytics.lowest?.toFixed(1)} - {analytics.highest?.toFixed(1)}
                            </span>
                        </div>
                        {trends.prediction && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Predicted Next:</span>
                                <span className="font-semibold text-indigo-600">
                                    {trends.prediction.toFixed(1)}/5
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Streak & Patterns */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100">
                    <h4 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                        <span>🔥</span> Patterns & Streaks
                    </h4>
                    <div className="space-y-3">
                        {analytics.streak && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Current Streak:</span>
                                <span className="font-semibold">
                                    {analytics.streak.count} days {analytics.streak.type}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Improvement:</span>
                            <span className={`font-semibold ${analytics.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {analytics.improvement > 0 ? '+' : ''}{analytics.improvement?.toFixed(1) || "0"}
                            </span>
                        </div>
                        {trends.patterns?.map((pattern, index) => (
                            <div key={index} className="text-sm">
                                <span className="text-gray-600">Pattern:</span>
                                <span className="ml-2 font-medium">{pattern.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Insights */}
            {(analytics.improvement !== 0 || trends.patterns?.length) && (
                <div className="p-4 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl border border-indigo-200">
                    <h4 className="text-lg font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                        <span>💡</span> Key Insights
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                        {analytics.improvement > 0.5 && (
                            <p>🎉 Your mood has improved by <strong>{analytics.improvement.toFixed(1)} points</strong> over this period!</p>
                        )}
                        {analytics.improvement < -0.5 && (
                            <p>📝 Your mood has declined by <strong>{Math.abs(analytics.improvement).toFixed(1)} points</strong>. Consider tracking what might be affecting your well-being.</p>
                        )}
                        {analytics.volatility > 1.5 && (
                            <p>🎢 Your mood shows high variability. Consider identifying triggers for mood swings.</p>
                        )}
                        {analytics.volatility < 0.5 && (
                            <p>✨ Your mood has been very consistent - great emotional stability!</p>
                        )}
                        {trends.patterns?.map((pattern, index) => (
                            <p key={index}>📈 {pattern.description}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}