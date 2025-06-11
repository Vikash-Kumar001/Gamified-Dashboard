import React, { useState, useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

const MOOD_CONFIG = {
    "😊": { name: "Happy", color: "#10b981", emoji: "😊", description: "Feeling great and positive" },
    "😐": { name: "Neutral", color: "#6b7280", emoji: "😐", description: "Balanced and calm" },
    "😢": { name: "Sad", color: "#ef4444", emoji: "😢", description: "Feeling down or melancholy" },
    "😤": { name: "Angry", color: "#f59e0b", emoji: "😤", description: "Frustrated or irritated" },
    "😴": { name: "Tired", color: "#8b5cf6", emoji: "😴", description: "Low energy or exhausted" },
    "😰": { name: "Anxious", color: "#ec4899", emoji: "😰", description: "Worried or stressed" },
    "🤗": { name: "Excited", color: "#06b6d4", emoji: "🤗", description: "Energetic and enthusiastic" },
    "🤔": { name: "Thoughtful", color: "#84cc16", emoji: "🤔", description: "Reflective and contemplative" },
};

const VISUALIZATION_TYPES = {
    pie: "Pie Chart",
    donut: "Donut Chart",
    radial: "Radial Bars",
    horizontal: "Horizontal Bars"
};

const TIME_FILTERS = {
    all: "All Time",
    week: "Past Week",
    month: "Past Month",
    quarter: "Past 3 Months"
};

export default function MoodDistributionAnalytics({ moodHistory = [] }) {
    const [visualizationType, setVisualizationType] = useState("donut");
    const [timeFilter, setTimeFilter] = useState("all");
    const [selectedMood, setSelectedMood] = useState(null);
    const [showPercentages, setShowPercentages] = useState(true);

    // Process and filter mood data
    const processedData = useMemo(() => {
        if (!moodHistory.length) return { data: [], total: 0, insights: {} };

        // Apply time filter
        let filteredHistory = moodHistory;
        if (timeFilter !== "all") {
            const now = new Date();
            const filterDate = new Date();
            
            switch (timeFilter) {
                case "week":
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case "month":
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                case "quarter":
                    filterDate.setMonth(now.getMonth() - 3);
                    break;
            }
            
            filteredHistory = moodHistory.filter(entry => 
                new Date(entry.date) >= filterDate
            );
        }

        // Count moods
        const counts = {};
        filteredHistory.forEach((entry) => {
            counts[entry.mood] = (counts[entry.mood] || 0) + 1;
        });

        const total = filteredHistory.length;

        // Prepare chart data
        const data = Object.entries(counts)
            .map(([mood, count]) => {
                const config = MOOD_CONFIG[mood] || { 
                    name: mood, 
                    color: "#6b7280", 
                    emoji: mood,
                    description: "Unknown mood"
                };
                
                return {
                    name: config.name,
                    value: count,
                    percentage: ((count / total) * 100).toFixed(1),
                    mood: mood,
                    color: config.color,
                    emoji: config.emoji,
                    description: config.description
                };
            })
            .sort((a, b) => b.value - a.value);

        // Calculate insights
        const insights = {
            mostCommon: data[0],
            leastCommon: data[data.length - 1],
            diversity: data.length,
            dominantMood: data[0]?.percentage > 50,
            positiveRatio: calculatePositiveRatio(data),
            moodBalance: calculateMoodBalance(data)
        };

        return { data, total, insights, filteredCount: filteredHistory.length };
    }, [moodHistory, timeFilter]);

    function calculatePositiveRatio(data) {
        const positiveMoods = ["😊", "🤗", "🤔"];
        const positiveCount = data
            .filter(item => positiveMoods.includes(item.mood))
            .reduce((sum, item) => sum + item.value, 0);
        
        return data.length > 0 ? ((positiveCount / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1) : 0;
    }

    function calculateMoodBalance(data) {
        if (data.length === 0) return "N/A";
        
        const maxPercentage = Math.max(...data.map(d => parseFloat(d.percentage)));
        
        if (maxPercentage > 60) return "Concentrated";
        if (maxPercentage < 25) return "Very Balanced";
        return "Balanced";
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{data.emoji}</span>
                        <span className="font-semibold text-gray-800">{data.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{data.description}</p>
                    <div className="space-y-1">
                        <p className="text-sm"><span className="font-medium">Count:</span> {data.value}</p>
                        <p className="text-sm"><span className="font-medium">Percentage:</span> {data.percentage}%</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percentage, name, emoji }) => {
        if (!showPercentages) return null;
        
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (parseFloat(percentage) < 5) return null; // Hide labels for small slices

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                className="text-xs font-semibold"
            >
                {`${percentage}%`}
            </text>
        );
    };

    const renderVisualization = () => {
        const { data } = processedData;

        switch (visualizationType) {
            case "pie":
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            labelLine={false}
                            label={CustomLabel}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color}
                                    stroke={selectedMood === entry.mood ? "#374151" : "transparent"}
                                    strokeWidth={selectedMood === entry.mood ? 3 : 0}
                                    style={{ cursor: "pointer" }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                );

            case "donut":
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            labelLine={false}
                            label={CustomLabel}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color}
                                    stroke={selectedMood === entry.mood ? "#374151" : "transparent"}
                                    strokeWidth={selectedMood === entry.mood ? 3 : 0}
                                    style={{ cursor: "pointer" }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                );

            case "radial":
                return (
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={data}>
                        <RadialBar
                            minAngle={15}
                            label={{ position: 'insideStart', fill: '#fff' }}
                            background
                            clockWise
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </RadialBar>
                        <Tooltip content={<CustomTooltip />} />
                    </RadialBarChart>
                );

            case "horizontal":
                return (
                    <BarChart layout="horizontal" data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6b7280" />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{ fontSize: 12 }} 
                            stroke="#6b7280"
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                );

            default:
                return null;
        }
    };

    const { data, total, insights } = processedData;

    if (!moodHistory.length) {
        return (
            <div className="w-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl p-8 mt-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-bold text-purple-700 mb-2">No Mood Data Available</h3>
                    <p className="text-gray-600">Start tracking your moods to see distribution patterns!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl p-6 mt-8 border border-purple-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-2xl font-bold text-purple-700 flex items-center gap-2 mb-4 sm:mb-0">
                    <span className="animate-pulse">🥧</span> 
                    Mood Distribution Analytics
                </h3>
                
                {/* Controls */}
                <div className="flex flex-wrap gap-2">
                    <select 
                        value={timeFilter} 
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="px-3 py-1 rounded-lg border border-purple-200 bg-white text-sm font-medium focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    >
                        {Object.entries(TIME_FILTERS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    
                    <select 
                        value={visualizationType} 
                        onChange={(e) => setVisualizationType(e.target.value)}
                        className="px-3 py-1 rounded-lg border border-purple-200 bg-white text-sm font-medium focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    >
                        {Object.entries(VISUALIZATION_TYPES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Insights Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">{total}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Total Entries</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-100">
                    <div className="text-2xl font-bold text-green-600">{insights.positiveRatio}%</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Positive Ratio</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-100">
                    <div className="text-2xl">{insights.mostCommon?.emoji || "—"}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Most Common</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-100">
                    <div className="text-2xl font-bold text-indigo-600">{insights.moodBalance}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Balance</div>
                </div>
            </div>

            {/* Visualization */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-purple-700">Distribution View</h4>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={showPercentages}
                            onChange={(e) => setShowPercentages(e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                        />
                        Show Percentages
                    </label>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    {renderVisualization()}
                </ResponsiveContainer>
            </div>

            {/* Detailed Breakdown */}
            <div>
                <h4 className="text-lg font-semibold text-purple-700 mb-4 flex items-center gap-2">
                    <span>📈</span> Detailed Breakdown
                </h4>
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div
                            key={item.mood}
                            className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border transition-all duration-200 cursor-pointer hover:shadow-md ${
                                selectedMood === item.mood 
                                    ? 'border-purple-300 ring-2 ring-purple-100' 
                                    : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedMood(selectedMood === item.mood ? null : item.mood)}
                        >
                            <div className="flex items-center gap-4">
                                <div 
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-2xl">{item.emoji}</span>
                                <div>
                                    <div className="font-semibold text-gray-800">{item.name}</div>
                                    <div className="text-sm text-gray-600">{item.description}</div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="font-bold text-lg text-gray-800">{item.value}</div>
                                <div className="text-sm text-gray-500">{item.percentage}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Insights */}
            {insights.mostCommon && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border border-purple-200">
                    <h4 className="text-lg font-semibold text-purple-700 mb-2 flex items-center gap-2">
                        <span>💡</span> Key Insights
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                        <p>
                            Your most common mood is <strong>{insights.mostCommon.name}</strong> ({insights.mostCommon.emoji}) 
                            at <strong>{insights.mostCommon.percentage}%</strong> of entries.
                        </p>
                        <p>
                            You have a <strong>{insights.positiveRatio}%</strong> positive mood ratio with 
                            a <strong>{insights.moodBalance.toLowerCase()}</strong> mood distribution.
                        </p>
                        {insights.diversity < 3 && (
                            <p className="text-amber-700">
                                💭 Consider exploring a wider range of mood expressions for better insights.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}