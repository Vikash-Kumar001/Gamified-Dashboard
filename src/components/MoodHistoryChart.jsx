import React, { useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
} from "recharts";

const MOOD_CONFIG = {
    "😊": { name: "Happy", color: "#10b981", value: 5 },
    "😐": { name: "Neutral", color: "#6b7280", value: 3 },
    "😢": { name: "Sad", color: "#ef4444", value: 1 },
    "😤": { name: "Angry", color: "#f59e0b", value: 2 },
    "😴": { name: "Tired", color: "#8b5cf6", value: 2 },
    "😰": { name: "Anxious", color: "#ec4899", value: 1 },
    "🤗": { name: "Excited", color: "#06b6d4", value: 4 },
};

const CHART_TYPES = {
    bar: "Bar Chart",
    line: "Line Chart",
    area: "Area Chart",
    pie: "Distribution"
};

export default function MoodHistoryChart({ moodHistory = [] }) {
    const [chartType, setChartType] = useState("bar");
    const [timeRange, setTimeRange] = useState("week");
    const [showTrend, setShowTrend] = useState(true);

    // Process mood data
    const processedData = useMemo(() => {
        if (!moodHistory.length) return { chartData: [], moodCounts: {}, stats: {} };

        // Filter by time range
        const now = new Date();
        const filterDate = new Date();
        if (timeRange === "week") filterDate.setDate(now.getDate() - 7);
        else if (timeRange === "month") filterDate.setMonth(now.getMonth() - 1);
        else filterDate.setMonth(now.getMonth() - 3);

        const filteredHistory = moodHistory.filter(entry => 
            new Date(entry.date) >= filterDate
        );

        // Calculate mood counts and stats
        const moodCounts = filteredHistory.reduce((acc, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
            return acc;
        }, {});

        // Calculate average mood score
        const avgMood = filteredHistory.reduce((sum, entry) => 
            sum + (MOOD_CONFIG[entry.mood]?.value || 3), 0
        ) / filteredHistory.length;

        // Prepare chart data
        const chartData = filteredHistory.map((entry, index) => ({
            date: entry.date.slice(5),
            fullDate: entry.date,
            mood: entry.mood,
            moodName: MOOD_CONFIG[entry.mood]?.name || "Unknown",
            moodValue: MOOD_CONFIG[entry.mood]?.value || 3,
            color: MOOD_CONFIG[entry.mood]?.color || "#6b7280",
            index
        }));

        // Prepare pie chart data
        const pieData = Object.entries(moodCounts).map(([mood, count]) => ({
            name: MOOD_CONFIG[mood]?.name || mood,
            value: count,
            mood,
            color: MOOD_CONFIG[mood]?.color || "#6b7280"
        }));

        const stats = {
            totalEntries: filteredHistory.length,
            avgMood: avgMood.toFixed(1),
            mostCommon: Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0],
            streak: calculateStreak(filteredHistory)
        };

        return { chartData, moodCounts, pieData, stats };
    }, [moodHistory, timeRange]);

    function calculateStreak(history) {
        if (!history.length) return 0;
        
        let streak = 1;
        for (let i = history.length - 2; i >= 0; i--) {
            const current = MOOD_CONFIG[history[i + 1].mood]?.value || 3;
            const prev = MOOD_CONFIG[history[i].mood]?.value || 3;
            if (current >= prev) streak++;
            else break;
        }
        return streak;
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">{data.fullDate}</p>
                    <p className="text-lg">{data.mood} {data.moodName}</p>
                    {chartType !== "pie" && (
                        <p className="text-sm text-gray-600">Score: {data.moodValue}/5</p>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const { chartData, pieData } = processedData;

        switch (chartType) {
            case "line":
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <YAxis 
                            domain={[0, 5]} 
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                            type="monotone" 
                            dataKey="moodValue" 
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, stroke: "#8b5cf6", strokeWidth: 2 }}
                        />
                    </LineChart>
                );

            case "area":
                return (
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <YAxis 
                            domain={[0, 5]} 
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="moodValue" 
                            stroke="#8b5cf6" 
                            fill="url(#moodGradient)"
                            strokeWidth={2}
                        />
                        <defs>
                            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                    </AreaChart>
                );

            case "pie":
                return (
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                );

            default: // bar
                return (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <YAxis 
                            domain={[0, 5]} 
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                            dataKey="moodValue" 
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                );
        }
    };

    const { moodCounts, stats } = processedData;

    if (!moodHistory.length) {
        return (
            <div className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-8 mt-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-bold text-indigo-700 mb-2">No Mood Data Yet</h3>
                    <p className="text-gray-600">Start logging your moods to see your patterns!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-xl p-6 mt-8 border border-indigo-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-2xl font-bold text-indigo-700 flex items-center gap-2 mb-4 sm:mb-0">
                    <span className="animate-pulse">📊</span> 
                    Mood Analytics
                </h3>
                
                {/* Controls */}
                <div className="flex flex-wrap gap-2">
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-1 rounded-lg border border-indigo-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                    >
                        <option value="week">Past Week</option>
                        <option value="month">Past Month</option>
                        <option value="quarter">Past 3 Months</option>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-100">
                    <div className="text-2xl font-bold text-indigo-600">{stats.totalEntries}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Total Entries</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-100">
                    <div className="text-2xl font-bold text-green-600">{stats.avgMood}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Avg Score</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-100">
                    <div className="text-2xl">{stats.mostCommon?.[0] || "—"}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Most Common</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-100">
                    <div className="text-2xl font-bold text-purple-600">{stats.streak}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Current Streak</div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 mb-6">
                <ResponsiveContainer width="100%" height={280}>
                    {renderChart()}
                </ResponsiveContainer>
            </div>

            {/* Mood Distribution */}
            {Object.keys(moodCounts).length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                        <span>🎯</span> Mood Distribution
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(moodCounts)
                            .sort((a, b) => b[1] - a[1])
                            .map(([mood, count]) => {
                                const config = MOOD_CONFIG[mood];
                                const percentage = ((count / stats.totalEntries) * 100).toFixed(1);
                                
                                return (
                                    <div
                                        key={mood}
                                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                        style={{ borderLeftColor: config?.color, borderLeftWidth: '4px' }}
                                    >
                                        <span className="text-lg">{mood}</span>
                                        <div className="text-sm">
                                            <span className="font-semibold text-gray-800">{count}x</span>
                                            <span className="text-gray-500 ml-1">({percentage}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}