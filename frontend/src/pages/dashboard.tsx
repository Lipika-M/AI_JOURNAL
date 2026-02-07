import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import journalApi from "../api/journal.api";
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

  useEffect(() => {
    fetchJournals();
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
                      onClick={() => navigate(`/journals/${journal._id}/edit`)}
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
                          Score: {Math.round(journal.moodScore * 100)}
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
          onClose={() => setShowEditorModal(false)}
          onSuccess={fetchJournals}
        />
      )}
    </div>
  );
};

export default Dashboard;
