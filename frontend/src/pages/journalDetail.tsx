import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import journalApi from "../api/journal.api";
import type { Journal } from "../types/journal.type";

const JournalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJournal();
    }
  }, [id]);

  const fetchJournal = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await journalApi.getJournalById(id!);
      setJournal(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch journal");
      console.error("Error fetching journal:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await journalApi.deleteJournal(id!);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete journal");
      console.error("Error deleting journal:", err);
      setIsDeleting(false);
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-50 border-green-200";
      case "negative":
        return "bg-red-50 border-red-200";
      case "neutral":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getSentimentTextColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-700";
      case "negative":
        return "text-red-700";
      case "neutral":
        return "text-gray-700";
      default:
        return "text-gray-700";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 4v2M6.228 6.228a9 9 0 1012.544 12.544M6.228 6.228L4.5 4.5m11.272 11.272l1.728 1.728"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Journal Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || "The journal you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/journals/${id}/edit`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
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
                Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center gap-2"
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
                Delete
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            </div>
          </div>
        )}

        {/* Journal Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{journal.title}</h1>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(journal.createdAt)}
            </div>
            {journal.updatedAt && journal.updatedAt !== journal.createdAt && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Updated {formatDate(journal.updatedAt)}
              </div>
            )}
          </div>

          {/* AI Analysis Section */}
          {(journal.sentiment || journal.moodScore || journal.summary) && (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {/* Sentiment */}
              {journal.sentiment && (
                <div
                  className={`p-4 rounded-lg border ${getSentimentColor(journal.sentiment)}`}
                >
                  <p className="text-sm text-gray-600 font-medium mb-1">Mood Sentiment</p>
                  <p
                    className={`text-lg font-semibold capitalize ${getSentimentTextColor(
                      journal.sentiment
                    )}`}
                  >
                    {journal.sentiment}
                  </p>
                </div>
              )}

              {/* Mood Score */}
              {journal.moodScore !== undefined && (
                <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                  <p className="text-sm text-gray-600 font-medium mb-1">Mood Score</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-blue-700">
                      {journal.moodScore}
                    </span>
                    <span className="text-gray-600 mb-1">/10</span>
                  </div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(journal.moodScore / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {journal.summary && (
                <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
                  <p className="text-sm text-gray-600 font-medium mb-2">AI Summary</p>
                  <p className="text-sm text-purple-900 line-clamp-3">{journal.summary}</p>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {journal.tags && journal.tags.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {journal.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Journal Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {journal.content}
            </p>
          </div>
        </div>

        {/* AI Summary Card (if available) */}
        {journal.summary && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">AI Generated Summary</h3>
                <p className="text-purple-800 leading-relaxed">{journal.summary}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Journal?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{journal.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalDetail;
