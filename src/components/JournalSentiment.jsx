import React, { useState, useEffect } from 'react';
import {
    FaCalendarAlt,
    FaSearch,
    FaFilter,
    FaHeart,
    FaStar,
    FaBook,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSave,
    FaTimes,
    FaSmile,
    FaMeh,
    FaFrown,
    FaTag
} from 'react-icons/fa';

// Mood mapping for sentiment analysis
const moodEmojis = {
    '😊': { label: 'Happy', sentiment: 'positive', color: 'text-green-500' },
    '😐': { label: 'Neutral', sentiment: 'neutral', color: 'text-yellow-500' },
    '😢': { label: 'Sad', sentiment: 'negative', color: 'text-red-500' },
    '😍': { label: 'Love', sentiment: 'positive', color: 'text-pink-500' },
    '😤': { label: 'Frustrated', sentiment: 'negative', color: 'text-orange-500' },
    '🤔': { label: 'Thinking', sentiment: 'neutral', color: 'text-blue-500' },
    '😴': { label: 'Tired', sentiment: 'neutral', color: 'text-gray-500' },
    '🎉': { label: 'Excited', sentiment: 'positive', color: 'text-purple-500' }
};

const categories = [
    { id: 'personal', label: 'Personal', color: 'bg-blue-100 text-blue-800' },
    { id: 'work', label: 'Work', color: 'bg-green-100 text-green-800' },
    { id: 'health', label: 'Health', color: 'bg-red-100 text-red-800' },
    { id: 'relationships', label: 'Relationships', color: 'bg-pink-100 text-pink-800' },
    { id: 'goals', label: 'Goals', color: 'bg-purple-100 text-purple-800' },
    { id: 'gratitude', label: 'Gratitude', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'reflection', label: 'Reflection', color: 'bg-indigo-100 text-indigo-800' }
];

// Simple sentiment analysis function
const analyzeSentiment = (text) => {
    const positiveWords = ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'good', 'love', 'blessed', 'grateful', 'awesome', 'fantastic'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'terrible', 'bad', 'awful', 'hate', 'disappointed', 'worried', 'stressed', 'upset'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
        if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
        if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
};

const Journal = ({ userId, onEntrySubmit }) => {
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState({
        title: '',
        content: '',
        mood: '😊',
        category: 'personal',
        tags: []
    });
    const [editingEntry, setEditingEntry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterMood, setFilterMood] = useState('all');
    const [showNewEntryForm, setShowNewEntryForm] = useState(false);
    const [currentTag, setCurrentTag] = useState('');

    // Load entries from localStorage on component mount
    useEffect(() => {
        const savedEntries = localStorage.getItem(`journal_entries_${userId}`);
        if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
        }
    }, [userId]);

    // Save entries to localStorage whenever entries change
    useEffect(() => {
        if (userId) {
            localStorage.setItem(`journal_entries_${userId}`, JSON.stringify(entries));
        }
    }, [entries, userId]);

    const handleSubmitEntry = () => {
        if (!newEntry.title.trim() || !newEntry.content.trim()) return;

        const entry = {
            id: Date.now(),
            ...newEntry,
            date: new Date().toISOString(),
            sentiment: analyzeSentiment(newEntry.content),
            wordCount: newEntry.content.trim().split(/\s+/).length
        };
        setEntries([entry, ...entries]);
        setNewEntry({
            title: '',
            content: '',
            mood: '😊',
            category: 'personal',
            tags: []
        });
        setShowNewEntryForm(false);

        // Call parent callback if provided
        if (onEntrySubmit) {
            onEntrySubmit(entry);
        }
    };

    const handleEditEntry = (entry) => {
        setEditingEntry({
            ...entry,
            tags: entry.tags || []
        });
    };

    const handleUpdateEntry = () => {
        if (!editingEntry.title.trim() || !editingEntry.content.trim()) return;

        const updatedEntry = {
            ...editingEntry,
            sentiment: analyzeSentiment(editingEntry.content),
            wordCount: editingEntry.content.trim().split(/\s+/).length,
            lastModified: new Date().toISOString()
        };

        setEntries(entries.map(entry =>
            entry.id === editingEntry.id ? updatedEntry : entry
        ));
        setEditingEntry(null);
    };

    const handleDeleteEntry = (entryId) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            setEntries(entries.filter(entry => entry.id !== entryId));
        }
    };

    const addTag = (entryType = 'new') => {
        if (!currentTag.trim()) return;

        if (entryType === 'new') {
            setNewEntry({
                ...newEntry,
                tags: [...(newEntry.tags || []), currentTag.trim()]
            });
        } else {
            setEditingEntry({
                ...editingEntry,
                tags: [...(editingEntry.tags || []), currentTag.trim()]
            });
        }
        setCurrentTag('');
    };

    const removeTag = (tagToRemove, entryType = 'new') => {
        if (entryType === 'new') {
            setNewEntry({
                ...newEntry,
                tags: newEntry.tags.filter(tag => tag !== tagToRemove)
            });
        } else {
            setEditingEntry({
                ...editingEntry,
                tags: editingEntry.tags.filter(tag => tag !== tagToRemove)
            });
        }
    };

    // Filter entries based on search term, category, and mood
    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesCategory = filterCategory === 'all' || entry.category === filterCategory;
        const matchesMood = filterMood === 'all' || entry.mood === filterMood;

        return matchesSearch && matchesCategory && matchesMood;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSentimentIcon = (sentiment) => {
        switch (sentiment) {
            case 'positive': return <FaSmile className="text-green-500" />;
            case 'negative': return <FaFrown className="text-red-500" />;
            default: return <FaMeh className="text-yellow-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <FaBook className="text-3xl text-indigo-600" />
                    <h1 className="text-3xl font-bold text-gray-900">My Journal</h1>
                </div>
                <button
                    onClick={() => setShowNewEntryForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                    <FaPlus /> New Entry
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-2xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <FaBook className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Total Entries</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">{entries.length}</span>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-2xl border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                        <FaSmile className="text-green-600" />
                        <span className="text-sm font-medium text-green-800">Positive Entries</span>
                    </div>
                    <span className="text-2xl font-bold text-green-900">
                        {entries.filter(e => e.sentiment === 'positive').length}
                    </span>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-4 rounded-2xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                        <FaHeart className="text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">This Month</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-900">
                        {entries.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length}
                    </span>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-yellow-100 p-4 rounded-2xl border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                        <FaStar className="text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Words Written</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-900">
                        {entries.reduce((total, entry) => total + (entry.wordCount || 0), 0)}
                    </span>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search entries, tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                </select>
                <select
                    value={filterMood}
                    onChange={(e) => setFilterMood(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="all">All Moods</option>
                    {Object.entries(moodEmojis).map(([emoji, data]) => (
                        <option key={emoji} value={emoji}>{emoji} {data.label}</option>
                    ))}
                </select>
            </div>

            {/* New Entry Form */}
            {showNewEntryForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">New Journal Entry</h2>
                            <button
                                onClick={() => setShowNewEntryForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <input
                                type="text"
                                placeholder="Entry title..."
                                value={newEntry.title}
                                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                                    <select
                                        value={newEntry.mood}
                                        onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        {Object.entries(moodEmojis).map(([emoji, data]) => (
                                            <option key={emoji} value={emoji}>{emoji} {data.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={newEntry.category}
                                        onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {newEntry.tags.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag, 'new')}
                                                className="text-indigo-800 hover:text-indigo-900"
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add tag..."
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addTag('new')}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                <textarea
                                    value={newEntry.content}
                                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[200px]"
                                />
                            </div>

                            <button
                                onClick={handleSubmitEntry}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700"
                            >
                                Save Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Entry Form */}
            {editingEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Edit Journal Entry</h2>
                            <button
                                onClick={() => setEditingEntry(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <input
                                type="text"
                                placeholder="Entry title..."
                                value={editingEntry.title}
                                onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                                    <select
                                        value={editingEntry.mood}
                                        onChange={(e) => setEditingEntry({ ...editingEntry, mood: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        {Object.entries(moodEmojis).map(([emoji, data]) => (
                                            <option key={emoji} value={emoji}>{emoji} {data.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={editingEntry.category}
                                        onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {editingEntry.tags.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag, 'edit')}
                                                className="text-indigo-800 hover:text-indigo-900"
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add tag..."
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addTag('edit')}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                <textarea
                                    value={editingEntry.content}
                                    onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[200px]"
                                />
                            </div>

                            <button
                                onClick={handleUpdateEntry}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700"
                            >
                                Update Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Entries List */}
            <div className="space-y-4">
                {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                        <div key={entry.id} className="p-6 bg-white rounded-2xl shadow-md border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{entry.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-gray-500">
                                            <FaCalendarAlt className="inline mr-1" />
                                            {formatDate(entry.date)}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categories.find(c => c.id === entry.category)?.color || ''}`}>
                                            {categories.find(c => c.id === entry.category)?.label || entry.category}
                                        </span>
                                        <span className="text-2xl">{entry.mood}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditEntry(entry)}
                                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                                        title="Edit"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteEntry(entry.id)}
                                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                        title="Delete"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {entry.tags?.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                                        <FaTag size={10} /> {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="mb-3 text-gray-700 whitespace-pre-line">{entry.content}</div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        {getSentimentIcon(entry.sentiment)}
                                        <span className="ml-1">{entry.sentiment}</span>
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        <span className="font-medium">{entry.wordCount}</span> words
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 bg-gray-50 rounded-2xl text-center">
                        <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Entries Found</h3>
                        <p className="text-gray-600">Try adjusting your filters or add a new entry.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Journal;
