import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import journalApi from "../api/journal.api";
import analyticsApi, {
  type MoodTrendPoint,
  type SentimentBucket,
  type TagBucket,
  type AverageMoodByTag,
} from "../api/analytics.api";
import type { Journal } from "../types/journal.type";
import JournalEditorModal from "../components/journalEditorModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [moodTrends, setMoodTrends] = useState<MoodTrendPoint[]>([]);
  const [sentimentDistribution, setSentimentDistribution] = useState<
    SentimentBucket[]
  >([]);
  const [tagsDistribution, setTagsDistribution] = useState<TagBucket[]>([]);
  const [averageMoodByTag, setAverageMoodByTag] = useState<AverageMoodByTag[]>(
    []
  );
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetchJournals();
    fetchAnalytics();
  }, []);

  // Poll for pending journals
  useEffect(() => {
    const pendingJournals = journals.filter((j) => j.aiStatus === "pending");
    if (pendingJournals.length === 0) return;

    const interval = setInterval(async () => {
      try {
        for (const journal of pendingJournals) {
          const response = await journalApi.getJournalById(journal._id);
          setJournals((prev) =>
            prev.map((j) =>
              j._id === journal._id ? { ...j, ...response.data } : j
            )
          );
        }
      } catch (err) {
        console.error("Error polling journals:", err);
      }
    }, 1500); // Poll every 1.5 seconds

    return () => clearInterval(interval);
  }, [journals]);

  const fetchJournals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await journalApi.getAllJournals();
      setJournals(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch journals");
      console.error("Error fetching journals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsAnalyticsLoading(true);
      const [moodRes, sentimentRes, tagsRes, avgMoodRes] = await Promise.all([
        analyticsApi.getMoodTrends(),
        analyticsApi.getSentimentDistribution(),
        analyticsApi.getTagsDistribution(),
        analyticsApi.getAverageMoodByTag(),
      ]);
      setMoodTrends(moodRes.data || []);
      setSentimentDistribution(sentimentRes.data || []);
      setTagsDistribution(tagsRes.data || []);
      setAverageMoodByTag(avgMoodRes.data || []);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  const handleDeleteJournal = async (id: string) => {
    try {
      await journalApi.deleteJournal(id);
      setJournals(journals.filter((j) => j._id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete journal");
      console.error("Error deleting journal:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

const getSentimentColor = (sentiment?: string) => {
  switch (sentiment) {
    case "positive":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "negative":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};


  const getSentimentBarColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500";
      case "negative":
        return "bg-red-500";
      case "neutral":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const sentimentTotal = sentimentDistribution.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const topTagsByMood = [...averageMoodByTag]
    .sort((a, b) => b.averageMood - a.averageMood)
    .slice(0, 5);

  const filteredJournals = journals.filter((journal) =>
    journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-green-50/30 to-amber-50/40">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-800">Solace</h1>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600">{journals.length} {journals.length === 1 ? 'entry' : 'entries'}</span>
              <button
                onClick={handleLogout}
                className="rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 px-4 py-1.5 text-sm font-medium transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Journals</h2>
              <p className="text-sm text-gray-500">Capture your thoughts, track your emotions, and reflect on your journey</p>
            </div>
            <button
              onClick={() => setShowEditorModal(true)}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg shadow-blue-200/50 rounded-xl px-5 py-2.5 font-medium transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Entry
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search journals by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-14 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white text-sm shadow-sm transition-all"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg shadow-blue-200/50 rounded-xl flex items-center justify-center transition-all duration-300">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {!isAnalyticsLoading && (moodTrends.length > 0 || sentimentDistribution.length > 0) && (
          <section className="mb-12">
            {/* Mood Trends Chart - Full Width */}
            {moodTrends.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Mood Trends</h3>
                </div>
                <div className="h-80 px-2">
                  <svg viewBox="0 0 1000 350" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                      {/* Y-Axis */}
                      <line x1="70" y1="30" x2="70" y2="300" stroke="#d1d5db" strokeWidth="1.5" />
                      
                      {/* X-Axis */}
                      <line x1="70" y1="300" x2="970" y2="300" stroke="#d1d5db" strokeWidth="1.5" />
                      
                      {/* Y-Axis Grid Lines and Labels */}
                      {[0, 25, 50, 75, 100].map((value) => {
                        const y = 300 - (value / 100) * 260;
                        return (
                          <g key={`grid-${value}`}>
                            <line x1="75" y1={y} x2="970" y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
                            <text x="55" y={y + 4} fontSize="12" fill="#9ca3af" textAnchor="end">
                              {value}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* X-Axis Labels */}
                      {moodTrends.map((point, index) => {
                        const totalPoints = moodTrends.length;
                        const x = 70 + (index / Math.max(1, totalPoints - 1)) * 900;
                        
                        // Format date
                        let label = '';
                        if (point.date) {
                          const date = new Date(point.date);
                          if (!isNaN(date.getTime())) {
                            label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          } else {
                            label = point.date.split('-').slice(1).join('/');
                          }
                        } else {
                          label = `Day ${index + 1}`;
                        }
                        
                        return (
                          <text key={`label-${index}`} x={x} y="330" fontSize="11" fill="#9ca3af" textAnchor="middle">
                            {label}
                          </text>
                        );
                      })}
                      
                      {/* Line Chart */}
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={
                          moodTrends
                            .map((point, index) => {
                              const totalPoints = moodTrends.length;
                              const x = 70 + (index / Math.max(1, totalPoints - 1)) * 900;
                              const value = Math.max(0, Math.min(1, point.averageScore || 0));
                              const y = 300 - value * 260;
                              return `${x},${y}`;
                            })
                            .join(" ")
                        }
                      />
                      
                      {/* Data Points */}
                      {moodTrends.map((point, index) => {
                        const totalPoints = moodTrends.length;
                        const x = 70 + (index / Math.max(1, totalPoints - 1)) * 900;
                        const value = Math.max(0, Math.min(1, point.averageScore || 0));
                        const y = 300 - value * 260;
                        return (
                          <g key={`point-${index}`}>
                            <circle cx={x} cy={y} r="4.5" fill="#3b82f6" stroke="white" strokeWidth="2" />
                          </g>
                        );
                      })}
                    </svg>
                </div>
              </div>
            )}

            {/* Two Column Layout for Sentiment and Tags */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">

              {/* Sentiments */}
              {sentimentDistribution.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-8 h-full min-h-[520px] flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Sentiment Distribution</h3>
                  </div>
                  
                  {/* Bar Chart Visualization */}
                  <div className="space-y-6 flex-1">
                    {/* Chart with Y-axis */}
                    <div className="flex gap-4">
                      {/* Y-axis labels */}
                      <div className="flex flex-col-reverse justify-between text-xs text-gray-500" style={{ height: '220px', width: '40px' }}>
                        {[0, 0.75, 1.5, 2.25, 3].map((val) => (
                          <div key={val} className="text-right pr-3">
                            {val}
                          </div>
                        ))}
                      </div>
                      
                      {/* Chart area with axes */}
                      <div className="flex-1 border-l-2 border-b-2 border-gray-300 relative" style={{ height: '220px' }}>
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="border-t border-gray-200"></div>
                          ))}
                        </div>
                        
                        {/* Bars */}
                        <div className="relative h-full flex items-end justify-around gap-8 px-6">
                          {sentimentDistribution.map((item) => {
                            const maxCount = Math.max(...sentimentDistribution.map(s => s.count));
                            const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            
                            return (
                              <div key={item.sentiment} className="flex-1 flex flex-col items-center max-w-[140px]">
                                {/* Bar */}
                                <div className="w-full relative" style={{ height: '200px' }}>
                                  <div 
                                    className={`absolute bottom-0 w-full rounded-t-md ${getSentimentBarColor(item.sentiment)} transition-all duration-500`}
                                    style={{ height: `${Math.max(heightPercent, heightPercent > 0 ? 10 : 0)}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* X-axis labels */}
                        <div className="absolute -bottom-8 left-0 right-0 flex justify-around px-6">
                          {sentimentDistribution.map((item) => (
                            <div key={item.sentiment} className="text-sm text-gray-600 capitalize">
                              {item.sentiment}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Percentage labels below chart */}
                    <div className="flex justify-around px-12 pt-8">
                      {sentimentDistribution.map((item) => {
                        const totalPercent = sentimentTotal ? Math.round((item.count / sentimentTotal) * 100) : 0;
                        return (
                          <div key={item.sentiment} className="text-center">
                            <div className="text-3xl font-bold text-gray-900 mb-1">{totalPercent}%</div>
                            <div className="text-sm text-gray-600 capitalize">{item.sentiment}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {/* Top Tags */}
              {tagsDistribution.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-8 h-full min-h-[520px] flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Tags</h3>
                  </div>
                  <div className="space-y-2 flex-1">
                    {tagsDistribution.slice(0, 5).map((tag, index) => (
                      <div key={tag.tag} className="flex items-center gap-4 bg-gray-50/70 hover:bg-gray-100/80 px-4 py-3 rounded-xl transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-800 font-medium flex-1">{tag.tag}</span>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {tag.count} {tag.count === 1 ? 'time' : 'times'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Best Moods - Horizontal Cards */}
            {topTagsByMood.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Best Moods</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {topTagsByMood.map((tag) => (
                    <div key={tag.tag} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <div className="text-3xl font-bold text-amber-600 mb-1">
                        {Math.round(tag.averageMood * 100)}%
                      </div>
                      <div className="text-sm text-gray-600 font-medium truncate">
                        {tag.tag}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && journals.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-200 mb-4">
              <svg
                className="w-8 h-8 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-gray-800 mb-2">Start Your Journey</h3>
            <p className="text-gray-600 mb-6">Create your first journal entry to begin tracking your thoughts and moods.</p>
            <button
              onClick={() => setShowEditorModal(true)}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg shadow-blue-200/50 rounded-xl px-6 py-2.5 font-medium transition-all duration-300"
            >
              Create Your First Entry
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && journals.length > 0 && filteredJournals.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-200 mb-4">
              <svg
                className="w-8 h-8 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-gray-800 mb-2">No Results Found</h3>
            <p className="text-gray-600">Try adjusting your search terms.</p>
          </div>
        )}

        {/* Journals Timeline */}
        {!isLoading && filteredJournals.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-gray-900 mb-8">Recent Entries</h3>
            <div className="relative">
              {/* Timeline line - faded gradient */}
              <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-green-200 to-transparent"></div>
              
              {/* Timeline items */}
              <div className="space-y-6">
                {filteredJournals.map((journal) => {
                  const date = journal.createdAt ? new Date(journal.createdAt) : new Date();
                  const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
                  const day = date.getDate();
                  
                  return (
                    <div key={journal._id} className="flex gap-6">
                      {/* Date Circle */}
                      <div className="flex flex-col items-center pt-1 relative z-10">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex flex-col items-center justify-center shadow-lg shadow-blue-200/50 relative z-10">
                          <div className="text-xs font-light text-white">{monthShort}</div>
                          <div className="text-lg font-semibold leading-tight text-white">{day}</div>

                        </div>
                      </div>
                      
                      {/* Card */}
                      <div
                        className="flex-1 bg-white border border-slate-100 
             hover:shadow-md hover:shadow-slate-200/60 
             transition-all duration-300 rounded-2xl p-8 cursor-pointer"
                        onClick={() => navigate(`/journals/${journal._id}`)}
                      >

                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-semibold text-gray-900">{journal.title}</h3>
                              {journal.aiStatus !== "pending" && (
                                <span className="text-xs px-3 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Success
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingJournal(journal);
                                setShowEditorModal(true);
                              }}
                              className="rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 px-5 py-2 text-sm font-semibold transition border border-slate-200 bg-white"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(journal._id);
                              }}
                              className="rounded-full text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 px-5 py-2 text-sm font-semibold transition border border-slate-200 bg-white"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Sentiment Badge */}
                        {journal.sentiment && journal.aiStatus !== "pending" && (
                          <div className="mb-5 flex items-center gap-2">
                             <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${getSentimentColor(journal.sentiment)}`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                                {journal.sentiment === 'positive' && <path d="M7 10a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zm-4 2a3 3 0 106 0" fill="none" stroke="currentColor" strokeWidth="1.5"/>}
                              </svg>
                              {journal.moodScore !== undefined && (
                                <span>{(journal.moodScore * 100).toFixed(0)}% {journal.sentiment}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <p className="text-gray-600 text-base leading-relaxed mb-5 line-clamp-4">
                          {journal.content}
                        </p>

                        {/* Tags */}
                        {journal.tags && journal.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {journal.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-sm px-4 py-1 rounded-full bg-slate-50 text-slate-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Entry?
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              This action cannot be undone. The journal entry will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 px-4 py-2.5 transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteJournal(deleteConfirm)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-red-600 hover:to-red-600 text-white shadow-lg shadow-blue-200/50 rounded-xl px-4 py-2.5 transition-all duration-300 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journal Editor Modal */}
      {showEditorModal && (
        <JournalEditorModal
          onClose={() => {
            setShowEditorModal(false);
            setEditingJournal(null);
          }}
          onSuccess={() => {
            fetchJournals();
            setEditingJournal(null);
          }}
          journal={editingJournal}
        />
      )}
    </div>
  );
};

export default Dashboard;
