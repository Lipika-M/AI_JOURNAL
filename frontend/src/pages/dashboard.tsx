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
  const { user, logout } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
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
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      case "neutral":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const moodTrendPoints = moodTrends
    .map((point, index) => {
      const x = moodTrends.length > 1 ? (index / (moodTrends.length - 1)) * 100 : 50;
      const y = 100 - Math.max(0, Math.min(1, point.averageScore)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const sentimentTotal = sentimentDistribution.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const topTagsByMood = [...averageMoodByTag]
    .sort((a, b) => b.averageMood - a.averageMood)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">AI Journal</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                Welcome, <span className="font-medium">{user?.fullName}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Journals</h2>
              <p className="mt-2 text-gray-600">
                {journals.length} {journals.length === 1 ? "entry" : "entries"} total
              </p>
            </div>
            <button
              onClick={() => setShowEditorModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Journal
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
                className="ml-auto text-red-400 hover:text-red-600"
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
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <p className="text-sm text-gray-600">Your mood patterns at a glance</p>
            </div>
          </div>

          {isAnalyticsLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Mood Trends */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Mood Trends</h3>
                  <span className="text-xs text-gray-500">Last entries</span>
                </div>
                {moodTrends.length === 0 ? (
                  <p className="text-sm text-gray-500">No mood data yet.</p>
                ) : (
                  <div className="h-36">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <defs>
                        <linearGradient id="moodLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#2563eb" />
                          <stop offset="100%" stopColor="#60a5fa" />
                        </linearGradient>
                      </defs>
                      <polyline
                        fill="none"
                        stroke="url(#moodLine)"
                        strokeWidth="2"
                        points={moodTrendPoints}
                      />
                      {moodTrends.map((point, index) => {
                        const x =
                          moodTrends.length > 1
                            ? (index / (moodTrends.length - 1)) * 100
                            : 50;
                        const y = 100 - Math.max(0, Math.min(1, point.averageScore)) * 100;
                        return (
                          <circle key={point.date} cx={x} cy={y} r="1.8" fill="#2563eb" />
                        );
                      })}
                    </svg>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>{moodTrends[0]?.date}</span>
                      <span>{moodTrends[moodTrends.length - 1]?.date}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sentiment Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sentiment Split</h3>
                  <span className="text-xs text-gray-500">Share of entries</span>
                </div>
                {sentimentDistribution.length === 0 ? (
                  <p className="text-sm text-gray-500">No sentiment data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sentimentDistribution.map((item) => {
                      const percent = sentimentTotal
                        ? Math.round((item.count / sentimentTotal) * 100)
                        : 0;
                      return (
                        <div key={item.sentiment}>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span className="capitalize">{item.sentiment}</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100">
                            <div
                              className={`h-2 rounded-full ${getSentimentBarColor(
                                item.sentiment
                              )}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tags Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tags Distribution</h3>
                  <span className="text-xs text-gray-500">Top tags</span>
                </div>
                {tagsDistribution.length === 0 ? (
                  <p className="text-sm text-gray-500">No tags data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {tagsDistribution.slice(0, 6).map((tag) => (
                      <div key={tag.tag} className="flex items-center gap-3">
                        <span className="text-sm text-gray-700 w-24 truncate">#{tag.tag}</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{
                              width: `${Math.min(100, tag.count * 10)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">
                          {tag.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Tags by Mood */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Tags by Mood</h3>
                  <span className="text-xs text-gray-500">Avg mood</span>
                </div>
                {topTagsByMood.length === 0 ? (
                  <p className="text-sm text-gray-500">No mood by tag data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topTagsByMood.map((tag) => (
                      <div key={tag.tag} className="flex items-center gap-3">
                        <span className="text-sm text-gray-700 w-24 truncate">#{tag.tag}</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.max(0, Math.min(100, tag.averageMood * 100))}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">
                          {Math.round(tag.averageMood * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && journals.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No journals yet</h3>
            <p className="mt-1 text-gray-500">Get started by creating your first journal entry.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowEditorModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Create Journal
              </button>
            </div>
          </div>
        )}

        {/* Journals Grid */}
        {!isLoading && journals.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {journals.map((journal) => (
              <div
                key={journal._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 border border-gray-200"
              >
                {/* Journal Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3
                    className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 flex-1"
                    onClick={() => navigate(`/journals/${journal._id}`)}
                  >
                    {journal.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingJournal(journal);
                        setShowEditorModal(true);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition"
                      title="Edit"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(journal._id)}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Delete"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Journal Content Preview */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {journal.content}
                </p>

                {/* Journal Meta */}
                <div className="space-y-2">
                  {journal.aiStatus === "pending" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-50 text-yellow-700 flex items-center gap-1">
                        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Analyzing…
                      </span>
                    </div>
                  )}

                  {journal.aiStatus === "failed" && (
                    <div className="text-xs px-2 py-1 rounded-full font-medium bg-red-50 text-red-700">
                      Analysis Failed
                    </div>
                  )}

                  {journal.sentiment && journal.aiStatus !== "pending" && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getSentimentColor(
                          journal.sentiment
                        )}`}
                      >
                        {journal.sentiment}
                      </span>
                      {journal.moodScore !== undefined && (
                        <span className="text-xs text-gray-500">
                          Score: {(journal.moodScore * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  )}

                  {journal.tags && journal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {journal.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 text-xs text-gray-500">
                    <span>{formatDate(journal.createdAt)}</span>
                    <button
                      onClick={() => navigate(`/journals/${journal._id}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read more →
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm === journal._id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Delete Journal?
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Are you sure you want to delete "{journal.title}"? This action cannot
                        be undone.
                      </p>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteJournal(journal._id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
