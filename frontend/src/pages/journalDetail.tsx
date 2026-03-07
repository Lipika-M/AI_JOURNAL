import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import journalApi from "../api/journal.api";
import type { Journal } from "../types/journal.type";
import JournalEditorModal from "../components/journalEditorModal";

const JournalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [imageUploadSuccess, setImageUploadSuccess] = useState<string | null>(null);
  const [selectedImagePublicIds, setSelectedImagePublicIds] = useState<string[]>([]);
  const [isDeletingImages, setIsDeletingImages] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const handleAddImagesClick = () => {
    setImageUploadError(null);
    setImageUploadSuccess(null);
    imageInputRef.current?.click();
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length || !journal) return;

    if (files.length > 2) {
      setImageUploadError("You can upload a maximum of 2 images");
      return;
    }

    try {
      setIsUploadingImages(true);
      setImageUploadError(null);
      setImageUploadSuccess(null);

      await journalApi.updateJournal(journal._id, {
        images: files,
        appendImages: true,
      });
      await fetchJournal();
      setImageUploadSuccess("Images uploaded successfully");
    } catch (err: any) {
      setImageUploadError(err.response?.data?.message || "Failed to upload images");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const toggleImageSelection = (publicId: string) => {
    setSelectedImagePublicIds((prev) =>
      prev.includes(publicId)
        ? prev.filter((id) => id !== publicId)
        : [...prev, publicId]
    );
  };

  const handleDeleteSelectedImages = async () => {
    if (!journal || selectedImagePublicIds.length === 0) return;

    try {
      setIsDeletingImages(true);
      setImageUploadError(null);
      setImageUploadSuccess(null);

      await journalApi.updateJournal(journal._id, {
        removeImagePublicIds: selectedImagePublicIds,
      });

      setSelectedImagePublicIds([]);
      await fetchJournal();
      setImageUploadSuccess("Selected images deleted successfully");
    } catch (err: any) {
      setImageUploadError(err.response?.data?.message || "Failed to delete selected images");
    } finally {
      setIsDeletingImages(false);
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

  const getSentimentLabel = (sentiment?: string) => {
    if (!sentiment) return "Neutral";
    return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
  };

  const getAiStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    if (sentiment === "positive") {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    if (sentiment === "negative") {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 15.172a4 4 0 00-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15h8M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
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
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] text-slate-900">
        <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
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
              className="rounded-xl bg-slate-900 px-6 py-2 font-medium text-white transition hover:bg-slate-800"
            >
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
              Back to Dashboard
                </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const wordCount = journal.content.trim().split(/\s+/).filter(Boolean).length;
  const characterCount = journal.content.length;
  const imageCount = journal.images?.length || 0;
  const tagCount = journal.tags?.length || 0;
  const moodPercent =
    typeof journal.moodScore === "number"
      ? Math.max(0, Math.min(100, journal.moodScore * 100))
      : null;

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-slate-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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
                onClick={handleAddImagesClick}
                disabled={isUploadingImages}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M12 4v8m4-4H8" />
                </svg>
                {isUploadingImages ? "Uploading..." : "Add Images"}
              </button>
              {selectedImagePublicIds.length > 0 && (
                <button
                  onClick={handleDeleteSelectedImages}
                  disabled={isDeletingImages}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2 font-medium text-red-700 shadow-sm transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v12a2 2 0 002 2h4a2 2 0 002-2V7" />
                  </svg>
                  {isDeletingImages ? "Deleting..." : `Delete Selected (${selectedImagePublicIds.length})`}
                </button>
              )}
              <button
                onClick={() => setShowEditorModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-slate-800"
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
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-red-700"
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
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
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

        {imageUploadError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{imageUploadError}</p>
          </div>
        )}

        {imageUploadSuccess && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-800">{imageUploadSuccess}</p>
          </div>
        )}

        {/* Journal Header */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-4xl font-semibold text-slate-900">{journal.title}</h1>

          {/* Meta Information */}
          <div className="mb-6 flex flex-wrap gap-4 border-b border-slate-200 pb-6 text-sm text-slate-600">
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

          {/* Uploaded Images */}
          {journal.images && journal.images.length > 0 && (
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Images
                </p>
                {selectedImagePublicIds.length > 0 && (
                  <p className="text-xs font-medium text-slate-600">
                    {selectedImagePublicIds.length} selected
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {journal.images.map((image) => (
                  <button
                    key={image.publicId}
                    type="button"
                    onClick={() => toggleImageSelection(image.publicId)}
                    className={`relative overflow-hidden rounded-xl border text-left transition ${
                      selectedImagePublicIds.includes(image.publicId)
                        ? "border-red-400 ring-2 ring-red-200"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt="Journal attachment"
                      className="h-56 w-full object-cover"
                    />
                    <span
                      className={`absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                        selectedImagePublicIds.includes(image.publicId)
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-white bg-white/90 text-slate-700"
                      }`}
                    >
                      {selectedImagePublicIds.includes(image.publicId) ? "-" : "+"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Journal Content */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
              {journal.content}
            </p>
          </div>
        </div>

        {/* Detailed Analysis */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 shadow-sm">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h3v6m3 0V7h3v10M3 17V9h3v8" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">Detailed Analysis</h2>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className={`rounded-xl border p-4 ${getSentimentColor(journal.sentiment)}`}>
              <p className="mb-2 text-sm font-medium text-slate-600">Sentiment</p>
              <p className={`inline-flex items-center gap-2 text-base font-semibold ${getSentimentTextColor(journal.sentiment)}`}>
                {getSentimentIcon(journal.sentiment)}
                {getSentimentLabel(journal.sentiment)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-medium text-slate-600">Mood Score</p>
              <p className="text-2xl font-bold text-slate-900">{moodPercent !== null ? `${Math.round(moodPercent)}%` : "N/A"}</p>
              {moodPercent !== null && (
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-slate-700" style={{ width: `${moodPercent}%` }}></div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-medium text-slate-600">AI Status</p>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold capitalize ${getAiStatusColor(journal.aiStatus)}`}>
                {journal.aiStatus || "pending"}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-medium text-slate-600">Content Stats</p>
              <p className="text-sm font-medium text-slate-800">{wordCount} words</p>
              <p className="text-sm text-slate-600">{characterCount} characters</p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-medium text-slate-600">Media and Labels</p>
              <p className="text-sm text-slate-700">Images: <span className="font-semibold text-slate-900">{imageCount}</span></p>
              <p className="text-sm text-slate-700">Tags: <span className="font-semibold text-slate-900">{tagCount}</span></p>
              {journal.tags && journal.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {journal.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-medium text-slate-600">Timeline</p>
              <p className="text-sm text-slate-700">
                Created: <span className="font-medium text-slate-900">{formatDate(journal.createdAt)}</span>
              </p>
              <p className="text-sm text-slate-700">
                Updated: <span className="font-medium text-slate-900">{formatDate(journal.updatedAt || journal.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="mb-2 text-base font-semibold text-slate-900">AI Summary</h3>
            <p className="leading-relaxed text-slate-700">
              {journal.summary || "Summary is not available yet. Analysis may still be processing."}
            </p>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14A1 1 0 003 19h18a1 1 0 00.89-1.47l-8.18-14a1 1 0 00-1.72 0z" />
              </svg>
              Delete Journal?
            </h3>
            <p className="mb-6 text-slate-600">
              Are you sure you want to delete "{journal.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                disabled={isDeleting}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v12a2 2 0 002 2h4a2 2 0 002-2V7" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journal Editor Modal */}
      {showEditorModal && journal && (
        <JournalEditorModal
          onClose={() => setShowEditorModal(false)}
          onSuccess={() => {
            fetchJournal();
            setShowEditorModal(false);
          }}
          journal={journal}
        />
      )}
    </div>
  );
};

export default JournalDetail;
