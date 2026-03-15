import { useState, useEffect, useRef } from "react";
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
import { getSafeErrorMessage } from "../utils/safeErrorMessage";

const Dashboard = () => {
  const isMobileViewport =
    typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;

  const MOOD_CHART = isMobileViewport
    ? {
        width: 360,
        height: 220,
        paddingLeft: 44,
        paddingRight: 16,
        paddingTop: 18,
        paddingBottom: 34,
      }
    : {
        width: 1000,
        height: 350,
        paddingLeft: 70,
        paddingRight: 30,
        paddingTop: 30,
        paddingBottom: 50,
      };
  const moodPlotWidth =
    MOOD_CHART.width - MOOD_CHART.paddingLeft - MOOD_CHART.paddingRight;
  const moodPlotHeight =
    MOOD_CHART.height - MOOD_CHART.paddingTop - MOOD_CHART.paddingBottom;
  const SENTIMENT_CHART_HEIGHT = isMobileViewport ? 184 : 220;

  const navigate = useNavigate();
  const { logout } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedTitleId, setExpandedTitleId] = useState<string | null>(null);
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
  const [hoveredMoodPoint, setHoveredMoodPoint] = useState<{
    index: number;
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);
  const [moodTooltipPosition, setMoodTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [hoveredSentiment, setHoveredSentiment] = useState<{
    index: number;
    sentiment: string;
    count: number;
    percent: number;
  } | null>(null);
  const [sentimentTooltipPosition, setSentimentTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
        let shouldRefreshAnalytics = false;

        for (const journal of pendingJournals) {
          const response = await journalApi.getJournalById(journal._id);
          if (response.data?.aiStatus === "completed") {
            shouldRefreshAnalytics = true;
          }

          setJournals((prev) =>
            prev.map((j) =>
              j._id === journal._id ? { ...j, ...response.data } : j
            )
          );
        }

        if (shouldRefreshAnalytics) {
          fetchAnalytics();
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
      setError(getSafeErrorMessage(err, "Failed to fetch journals"));
      console.error("Error fetching journals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsAnalyticsLoading(true);
      const [moodRes, sentimentRes, tagsRes, avgMoodRes] = await Promise.allSettled([
        analyticsApi.getMoodTrends(),
        analyticsApi.getSentimentDistribution(),
        analyticsApi.getTagsDistribution(),
        analyticsApi.getAverageMoodByTag(),
      ]);

      setMoodTrends(
        moodRes.status === "fulfilled" ? moodRes.value.data || [] : []
      );
      setSentimentDistribution(
        sentimentRes.status === "fulfilled" ? sentimentRes.value.data || [] : []
      );
      setTagsDistribution(
        tagsRes.status === "fulfilled" ? tagsRes.value.data || [] : []
      );
      setAverageMoodByTag(
        avgMoodRes.status === "fulfilled" ? avgMoodRes.value.data || [] : []
      );

      const hasAnyFailure =
        moodRes.status === "rejected" ||
        sentimentRes.status === "rejected" ||
        tagsRes.status === "rejected" ||
        avgMoodRes.status === "rejected";

      if (hasAnyFailure) {
        console.warn("One or more analytics widgets failed to load.");
      }
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
      fetchAnalytics();
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(getSafeErrorMessage(err, "Failed to delete journal"));
      console.error("Error deleting journal:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err: any) {
      setError(getSafeErrorMessage(err, "Logout failed. Please try again."));
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

const getSentimentLabel = (sentiment?: string) => {
  if (!sentiment) return "Neutral";
  return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
};

const getSentimentIcon = (sentiment?: string) => {
  if (sentiment === "positive") {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  if (sentiment === "negative") {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 15.172a4 4 0 00-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15h8M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
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
  const maxSentimentCount = Math.max(
    1,
    ...sentimentDistribution.map((item) => item.count)
  );
  const sentimentYAxisTicks = Array.from({ length: 5 }, (_, index) =>
    (maxSentimentCount / 4) * index
  );

  const topTagsByMood = [...averageMoodByTag]
    .sort((a, b) => b.averageMood - a.averageMood)
    .slice(0, 5);

  const filteredJournals = journals.filter((journal) =>
    journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (journal.tags || []).some((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const isSearching = searchQuery.trim().length > 0;

  const getMoodPointMeta = (index: number) => {
    const totalPoints = moodTrends.length;
    const point = moodTrends[index];
    const x =
      MOOD_CHART.paddingLeft +
      (index / Math.max(1, totalPoints - 1)) * moodPlotWidth;
    const value = Math.max(0, Math.min(1, point?.averageScore || 0));
    const y = MOOD_CHART.paddingTop + (1 - value) * moodPlotHeight;
    const date = point?.date ? new Date(point.date) : null;
    const label =
      date && !isNaN(date.getTime())
        ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : point?.date || `Day ${index + 1}`;

    return {
      index,
      x,
      y,
      label,
      value: Math.round(value * 100),
    };
  };

  const getMoodChartPoints = () =>
    moodTrends.map((point, index) => {
      const totalPoints = moodTrends.length;
      const x =
        MOOD_CHART.paddingLeft +
        (index / Math.max(1, totalPoints - 1)) * moodPlotWidth;
      const value = Math.max(0, Math.min(1, point.averageScore || 0));
      const y = MOOD_CHART.paddingTop + (1 - value) * moodPlotHeight;
      return { x, y };
    });

  const buildSmoothMoodPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      const controlX = (previous.x + current.x) / 2;

      path += ` C ${controlX} ${previous.y}, ${controlX} ${current.y}, ${current.x} ${current.y}`;
    }

    return path;
  };

  const handleMoodChartPointerMove = (
    event:
      | React.MouseEvent<SVGSVGElement>
      | React.TouchEvent<SVGSVGElement>
  ) => {
    if (!moodTrends.length) return;

    const point =
      "touches" in event
        ? (event.touches[0] || event.changedTouches[0])
        : event;

    if (!point) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((point.clientX - rect.left) / rect.width) * MOOD_CHART.width;
    const svgY =
      ((point.clientY - rect.top) / rect.height) * MOOD_CHART.height;
    const clampedX = Math.min(
      MOOD_CHART.width - MOOD_CHART.paddingRight,
      Math.max(MOOD_CHART.paddingLeft, svgX)
    );
    const clampedY = Math.min(
      MOOD_CHART.height - MOOD_CHART.paddingBottom,
      Math.max(MOOD_CHART.paddingTop, svgY)
    );

    setMoodTooltipPosition({ x: clampedX, y: clampedY });

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < moodTrends.length; index += 1) {
      const pointX =
        MOOD_CHART.paddingLeft +
        (index / Math.max(1, moodTrends.length - 1)) * moodPlotWidth;
      const distance = Math.abs(svgX - pointX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    }

    const nextPoint = getMoodPointMeta(closestIndex);
    setHoveredMoodPoint((prev) =>
      prev?.index === nextPoint.index ? prev : nextPoint
    );
  };

  const handleSentimentChartPointerMove = (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!sentimentDistribution.length) return;

    const point =
      "touches" in event
        ? (event.touches[0] || event.changedTouches[0])
        : event;

    if (!point) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = Math.min(
      rect.width,
      Math.max(0, point.clientX - rect.left)
    );
    const relativeY = Math.min(
      rect.height,
      Math.max(0, point.clientY - rect.top)
    );

    const horizontalPadding = isMobileViewport ? 10 : 24;
    const usableWidth = Math.max(1, rect.width - horizontalPadding * 2);
    const innerX = Math.min(
      usableWidth,
      Math.max(0, relativeX - horizontalPadding)
    );
    const bucketWidth = usableWidth / Math.max(1, sentimentDistribution.length);
    const index = Math.min(
      sentimentDistribution.length - 1,
      Math.max(0, Math.floor(innerX / Math.max(1, bucketWidth)))
    );

    const item = sentimentDistribution[index];
    const percent = sentimentTotal
      ? Math.round((item.count / sentimentTotal) * 100)
      : 0;

    setHoveredSentiment((prev) =>
      prev?.index === index
        ? prev
        : {
            index,
            sentiment: item.sentiment,
            count: item.count,
            percent,
          }
    );

    setSentimentTooltipPosition({
      x: Math.min(94, Math.max(6, (relativeX / Math.max(1, rect.width)) * 100)),
      y: Math.min(80, Math.max(20, (relativeY / Math.max(1, rect.height)) * 100)),
    });
  };

  const moodChartPoints = getMoodChartPoints();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f7f7] text-slate-900">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300/35 blur-3xl" />
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between sm:h-16">
            <div className="flex items-center gap-3">
              <img src="/solace.svg" alt="Solace logo" className="h-8 w-8 rounded-lg ring-1 ring-slate-700 sm:h-9 sm:w-9" />
              <h1 className="text-xl font-semibold text-white sm:text-2xl">Solace</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200 sm:inline-flex">
                <svg className="h-4 w-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {journals.length} {journals.length === 1 ? 'entry' : 'entries'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-200 transition-all duration-300 hover:bg-slate-800 hover:text-white sm:px-4 sm:text-sm"
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
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Your Journals</h2>
              <p className="text-sm text-gray-500">Capture your thoughts, track your emotions, and reflect on your journey</p>
            </div>
            <button
              onClick={() => setShowEditorModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-slate-800 sm:w-auto sm:text-base"
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
              ref={searchInputRef}
              type="text"
              placeholder="Search journals by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-14 text-sm shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400 sm:px-5 sm:py-3.5"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <button
                type="button"
                aria-label="Focus search input"
                onClick={() => searchInputRef.current?.focus()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-all duration-300 hover:bg-slate-800"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              </button>
            </div>
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
                className="ml-auto rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
        {!isSearching && !isAnalyticsLoading && (
          <section className="mb-10 sm:mb-12">
            {/* Mood Trends Chart - Full Width */}
            {moodTrends.length > 0 && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
                <div className="mb-5 flex items-center gap-3 sm:mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Mood Trends</h3>
                </div>
                <div className="relative h-56 px-1 sm:h-80 sm:px-2">
                  <svg
                    viewBox={`0 0 ${MOOD_CHART.width} ${MOOD_CHART.height}`}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                    onMouseMove={handleMoodChartPointerMove}
                    onTouchStart={handleMoodChartPointerMove}
                    onTouchMove={handleMoodChartPointerMove}
                    onMouseLeave={() => {
                      setHoveredMoodPoint(null);
                      setMoodTooltipPosition(null);
                    }}
                  >
                      {/* Y-Axis */}
                      <line
                        x1={MOOD_CHART.paddingLeft}
                        y1={MOOD_CHART.paddingTop}
                        x2={MOOD_CHART.paddingLeft}
                        y2={MOOD_CHART.height - MOOD_CHART.paddingBottom}
                        stroke="#d1d5db"
                        strokeWidth="1.2"
                      />
                      
                      {/* X-Axis */}
                      <line
                        x1={MOOD_CHART.paddingLeft}
                        y1={MOOD_CHART.height - MOOD_CHART.paddingBottom}
                        x2={MOOD_CHART.width - MOOD_CHART.paddingRight}
                        y2={MOOD_CHART.height - MOOD_CHART.paddingBottom}
                        stroke="#d1d5db"
                        strokeWidth="1.2"
                      />
                      
                      {/* Y-Axis Grid Lines and Labels */}
                      {[0, 25, 50, 75, 100].map((value) => {
                        const y =
                          MOOD_CHART.paddingTop +
                          (1 - value / 100) * moodPlotHeight;
                        return (
                          <g key={`grid-${value}`}>
                            <line
                              x1={MOOD_CHART.paddingLeft + 2}
                              y1={y}
                              x2={MOOD_CHART.width - MOOD_CHART.paddingRight}
                              y2={y}
                              stroke="#94a3b8"
                              strokeWidth={isMobileViewport ? "0.8" : "1"}
                              strokeDasharray="3,3"
                              strokeOpacity="0.2"
                            />
                            <text
                              x={MOOD_CHART.paddingLeft - 8}
                              y={y + 3}
                              fontSize={isMobileViewport ? "9" : "12"}
                              fill="#64748b"
                              textAnchor="end"
                            >
                              {value}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* X-Axis Labels */}
                      {moodTrends.map((point, index) => {
                        const totalPoints = moodTrends.length;
                        const x =
                          MOOD_CHART.paddingLeft +
                          (index / Math.max(1, totalPoints - 1)) * moodPlotWidth;
                        
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

                        const renderEvery = Math.max(
                          1,
                          Math.ceil(totalPoints / 4)
                        );
                        const shouldRenderLabel = isMobileViewport
                          ? index === 0 ||
                            index === totalPoints - 1 ||
                            index % renderEvery === 0
                          : true;

                        if (!shouldRenderLabel) {
                          return null;
                        }
                        
                        return (
                          <text
                            key={`label-${index}`}
                            x={x}
                            y={MOOD_CHART.height - 8}
                            fontSize={isMobileViewport ? "8.5" : "12"}
                            fill="#64748b"
                            textAnchor="middle"
                          >
                            {label}
                          </text>
                        );
                      })}
                      
                      {/* Line Chart */}
                      <path
                        d={buildSmoothMoodPath(moodChartPoints)}
                        fill="none"
                        stroke="#334155"
                        strokeWidth={isMobileViewport ? "2.2" : "3"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {hoveredMoodPoint && (
                        <line
                          x1={hoveredMoodPoint.x}
                          y1={MOOD_CHART.paddingTop}
                          x2={hoveredMoodPoint.x}
                          y2={MOOD_CHART.height - MOOD_CHART.paddingBottom}
                          stroke="#334155"
                          strokeWidth={isMobileViewport ? "1.2" : "1.5"}
                          strokeDasharray="4,4"
                          opacity="0.75"
                          style={{ transition: "all 180ms ease-out" }}
                        />
                      )}
                      
                      {/* Data Points */}
                      {moodTrends.map((_, index) => {
                        const { x, y } = getMoodPointMeta(index);
                        return (
                          <g key={`point-${index}`}>
                            <circle
                              cx={x}
                              cy={y}
                              r={
                                hoveredMoodPoint?.index === index
                                  ? isMobileViewport
                                    ? "4.4"
                                    : "6"
                                  : isMobileViewport
                                  ? "3.2"
                                  : "4"
                              }
                              fill="#475569"
                              stroke="white"
                              strokeWidth={isMobileViewport ? "1.6" : "2"}
                              className="transition-all duration-200"
                            />
                            <circle
                              cx={x}
                              cy={y}
                              r="12"
                              fill="transparent"
                              className="sm:hidden"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {hoveredMoodPoint && (
                      <div
                        className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-[120%] bg-white/95 border border-slate-300/30 rounded-xl px-3 py-2 shadow-sm transition-all duration-300 ease-out"
                        style={{
                          left: `${(((moodTooltipPosition?.x ?? hoveredMoodPoint.x) / MOOD_CHART.width) * 100).toFixed(2)}%`,
                          top: `${(((moodTooltipPosition?.y ?? hoveredMoodPoint.y) / MOOD_CHART.height) * 100).toFixed(2)}%`,
                        }}
                      >
                        <div className="text-slate-700 font-medium text-sm whitespace-nowrap">
                          {hoveredMoodPoint.label}
                        </div>
                        <div className="text-slate-600 font-medium text-xs whitespace-nowrap">
                          Mood: {hoveredMoodPoint.value}%
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Two Column Layout for Sentiment and Tags */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">

              {/* Sentiments */}
              {sentimentDistribution.length > 0 && (
                <div className="flex h-full min-h-[460px] flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:min-h-[520px] sm:p-8">
                  <div className="mb-5 flex items-center gap-3 sm:mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Sentiment Distribution</h3>
                  </div>
                  
                  {/* Bar Chart Visualization */}
                  <div className="flex-1 space-y-5 sm:space-y-6">
                    {/* Chart with Y-axis */}
                    <div className="flex gap-2 sm:gap-4">
                      {/* Y-axis labels */}
                      <div
                        className="flex w-[28px] flex-col-reverse justify-between text-[10px] text-gray-500 sm:w-[40px] sm:text-xs"
                        style={{ height: `${SENTIMENT_CHART_HEIGHT}px` }}
                      >
                        {sentimentYAxisTicks.map((val) => (
                          <div key={val} className="pr-1 text-right sm:pr-3">
                            {Number.isInteger(val) ? val : val.toFixed(2)}
                          </div>
                        ))}
                      </div>
                      
                      {/* Chart area with axes */}
                      <div className="min-w-0 flex-1">
                        <div
                          className="relative border-b-2 border-l-2 border-gray-300"
                          style={{ height: `${SENTIMENT_CHART_HEIGHT}px` }}
                          onMouseMove={handleSentimentChartPointerMove}
                          onTouchStart={handleSentimentChartPointerMove}
                          onTouchMove={handleSentimentChartPointerMove}
                          onMouseLeave={() => {
                            setHoveredSentiment(null);
                            setSentimentTooltipPosition(null);
                          }}
                        >
                          {/* Grid lines */}
                          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                            {sentimentYAxisTicks.map((_, i) => (
                              <div key={i} className="border-t border-dashed border-slate-400/20" />
                            ))}
                          </div>

                          {hoveredSentiment && (
                            <div
                              className="pointer-events-none absolute top-0 bottom-0 z-[1] bg-slate-400/20"
                              style={{
                                left: `calc(10px + ${hoveredSentiment.index} * ((100% - 20px) / ${Math.max(1, sentimentDistribution.length)}))`,
                                width: `calc((100% - 20px) / ${Math.max(1, sentimentDistribution.length)})`,
                              }}
                            />
                          )}

                          {hoveredSentiment && sentimentTooltipPosition && (
                            <div
                              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[125%] whitespace-nowrap rounded-xl border border-slate-300/30 bg-white/95 px-2.5 py-1.5 shadow-sm transition-all duration-300 ease-out sm:px-3 sm:py-2"
                              style={{
                                left: `${sentimentTooltipPosition.x}%`,
                                top: `${sentimentTooltipPosition.y}%`,
                              }}
                            >
                              <div className="text-xs font-medium capitalize text-slate-700 sm:text-sm">
                                {hoveredSentiment.sentiment}
                              </div>
                              <div className="text-[11px] text-slate-600 sm:text-xs">
                                {hoveredSentiment.count} entries ({hoveredSentiment.percent}%)
                              </div>
                            </div>
                          )}

                          {/* Bars */}
                          <div
                            className="relative grid h-full px-2.5 sm:px-6"
                            style={{
                              gridTemplateColumns: `repeat(${Math.max(1, sentimentDistribution.length)}, minmax(0, 1fr))`,
                            }}
                          >
                            {sentimentDistribution.map((item, index) => {
                              const heightPercent =
                                maxSentimentCount > 0
                                  ? (item.count / maxSentimentCount) * 100
                                  : 0;
                              const isActive = hoveredSentiment?.index === index;

                              return (
                                <div key={item.sentiment} className="relative h-full px-1.5 sm:px-2">
                                  <div
                                    className={`absolute bottom-0 left-1.5 right-1.5 rounded-t-md ${getSentimentBarColor(item.sentiment)} transition-all duration-300 ${isActive ? 'opacity-100 brightness-110' : 'opacity-90'}`}
                                    style={{ height: `${heightPercent}%` }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* X-axis labels */}
                        <div
                          className="mt-2 grid px-2 text-[11px] text-gray-600 sm:px-6 sm:text-sm"
                          style={{
                            gridTemplateColumns: `repeat(${Math.max(1, sentimentDistribution.length)}, minmax(0, 1fr))`,
                          }}
                        >
                          {sentimentDistribution.map((item) => (
                            <div key={item.sentiment} className="text-center capitalize">
                              {item.sentiment}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Percentage labels below chart */}
                    <div
                      className="grid gap-3 px-2 pt-4 sm:gap-4 sm:px-6 sm:pt-6"
                      style={{
                        gridTemplateColumns:
                          isMobileViewport && sentimentDistribution.length <= 2
                            ? `repeat(${Math.max(1, sentimentDistribution.length)}, minmax(0, 1fr))`
                            : "repeat(3, minmax(0, 1fr))",
                      }}
                    >
                      {sentimentDistribution.map((item) => {
                        const totalPercent = sentimentTotal ? Math.round((item.count / sentimentTotal) * 100) : 0;
                        const isActive = hoveredSentiment?.sentiment === item.sentiment;
                        return (
                          <div
                            key={item.sentiment}
                            className={`mx-auto w-full max-w-[150px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center transition-all duration-300 sm:px-5 sm:py-4 ${isActive ? 'shadow-sm ring-1 ring-slate-300/70' : ''}`}
                          >
                            <div className="text-xl font-bold leading-none text-slate-800 sm:text-2xl">{totalPercent}%</div>
                            <div className="text-[11px] text-slate-600 mt-2 capitalize">{item.sentiment}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {/* Top Tags */}
              {tagsDistribution.length > 0 && (
                <div className="flex h-full min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:min-h-[520px] sm:p-8">
                  <div className="mb-5 flex items-center gap-3 sm:mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Top Tags</h3>
                  </div>
                  <div className="flex-1 space-y-1.5 sm:space-y-2">
                    {tagsDistribution.slice(0, 5).map((tag, index) => (
                      <div key={tag.tag} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 transition-colors hover:bg-slate-100 sm:gap-4 sm:px-4 sm:py-3">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs">
                          {index + 1}
                        </div>
                        <span className="flex-1 truncate text-sm font-medium text-gray-800">{tag.tag}</span>
                        <span className="whitespace-nowrap text-xs text-gray-500 sm:text-sm">
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
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
                <div className="mb-5 flex items-center gap-3 sm:mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 sm:text-lg">Best Moods</h3>
                </div>
                <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:grid-cols-5">
                  {topTagsByMood.map((tag) => (
                    <div key={tag.tag} className="min-w-[140px] shrink-0 snap-start rounded-xl border border-white/60 bg-white/70 p-3 sm:min-w-0 sm:p-4">
                      <div className="mb-2 inline-flex h-12 min-w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 shadow-sm sm:mb-3 sm:h-14 sm:min-w-24">
                        <span className="text-xl font-bold text-slate-800 sm:text-2xl">
                          {Math.round(tag.averageMood * 100)}%
                        </span>
                      </div>
                      <div className="truncate text-xs font-medium text-slate-700 sm:text-sm">
                        {tag.tag}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500 sm:hidden">
                  swipe for more -&gt;
                </p>
              </div>
            )}

            {moodTrends.length === 0 && sentimentDistribution.length === 0 && tagsDistribution.length === 0 && topTagsByMood.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8">
                Analytics will appear after entries include mood/sentiment data.
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
        {!isSearching && !isLoading && journals.length === 0 && (
          <div className="py-10 text-center sm:py-16">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-stone-200 sm:mb-4 sm:h-16 sm:w-16">
              <svg
                className="h-7 w-7 text-stone-400 sm:h-8 sm:w-8"
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
            <h3 className="mb-2 text-lg font-serif text-gray-800 sm:text-xl">Start Your Journey</h3>
            <p className="mb-5 text-sm text-gray-600 sm:mb-6 sm:text-base">Create your first journal entry to begin tracking your thoughts and moods.</p>
            <button
              onClick={() => setShowEditorModal(true)}
              className="h-11 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-800 sm:h-auto sm:text-base"
            >
              Create Your First Entry
            </button>
          </div>
        )}

        {/* No Search Results */}
        {isSearching && !isLoading && journals.length > 0 && filteredJournals.length === 0 && (
          <div className="py-10 text-center sm:py-16">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-stone-200 sm:mb-4 sm:h-16 sm:w-16">
              <svg
                className="h-7 w-7 text-stone-400 sm:h-8 sm:w-8"
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
            <h3 className="mb-2 text-lg font-serif text-gray-800 sm:text-xl">No Results Found</h3>
            <p className="text-sm text-gray-600 sm:text-base">Try adjusting your search terms.</p>
          </div>
        )}

        {/* Journals Timeline */}
        {!isLoading && filteredJournals.length > 0 && (
          <>
            <div className="mb-6 flex items-center gap-3 sm:mb-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-6H5m14 12H5m14 6H5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                {isSearching ? "Search Results" : "Recent Entries"}
              </h3>
            </div>
            <div className="relative">
              {/* Timeline items */}
              <div className="space-y-4 sm:space-y-6">
                {filteredJournals.map((journal, index) => {
                  const date = journal.createdAt ? new Date(journal.createdAt) : new Date();
                  const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
                  const day = date.getDate();
                  
                  return (
                    <div key={journal._id} className="relative flex gap-4 sm:gap-6">
                      {/* Timeline Connector */}
                      {index !== filteredJournals.length - 1 && (
                        <div className="absolute bottom-0 left-8 top-20 hidden w-0.5 bg-gradient-to-b from-slate-300 via-slate-300/70 to-transparent md:block" />
                      )}

                      {/* Date Circle */}
                      <div className="hidden md:flex flex-col items-center flex-shrink-0">
                        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 shadow-sm">
                          <div className="text-center text-white">
                            <div className="text-xs font-light opacity-90">{monthShort}</div>
                            <div className="text-lg font-semibold leading-tight">{day}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Card */}
                      <div
                        className="flex-1 border border-slate-200 bg-white 
             hover:shadow-md hover:shadow-slate-200/70 
             transition-all duration-300 rounded-2xl p-4 sm:p-8 cursor-pointer"
                        onClick={() => navigate(`/journals/${journal._id}`)}
                      >

                        {/* Mobile Date */}
                        <div className="mb-3 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 md:hidden">
                          {monthShort} {day}
                        </div>

                        {/* Header */}
                        <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                              <div className="relative w-full sm:w-auto sm:max-w-[34rem]">
                                <h3
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.matchMedia("(max-width: 639px)").matches) {
                                      setExpandedTitleId((prev) =>
                                        prev === journal._id ? null : journal._id
                                      );
                                    }
                                  }}
                                  className="line-clamp-1 break-words text-xl font-semibold text-gray-900 sm:line-clamp-2 sm:text-2xl"
                                  title={journal.title}
                                >
                                  {journal.title}
                                </h3>
                                {expandedTitleId === journal._id && (
                                  <div className="absolute left-0 top-full z-20 mt-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 shadow-md sm:hidden">
                                    {journal.title}
                                  </div>
                                )}
                              </div>
                              {journal.aiStatus !== "pending" && (
                                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Success
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex w-full gap-2 sm:w-auto" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingJournal(journal);
                                setShowEditorModal(true);
                              }}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 sm:flex-none sm:px-5 sm:py-2 sm:text-sm"
                              title="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(journal._id);
                              }}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:flex-none sm:px-5 sm:py-2 sm:text-sm"
                              title="Delete"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v12a2 2 0 002 2h4a2 2 0 002-2V7" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Sentiment Badge */}
                        {journal.sentiment && journal.aiStatus !== "pending" && (
                          <div className="mb-4 flex items-center gap-2 sm:mb-5">
                             <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${getSentimentColor(journal.sentiment)}`}>
                              {getSentimentIcon(journal.sentiment)}
                              {journal.moodScore !== undefined && (
                                <span>{(journal.moodScore * 100).toFixed(0)}% {getSentimentLabel(journal.sentiment)}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-gray-600 sm:mb-5 sm:text-base">
                          {journal.content}
                        </p>

                        {/* Tags */}
                        {journal.tags && journal.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {journal.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600 sm:px-4 sm:text-sm"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6">
            <h3 className="mb-2 inline-flex items-center gap-2 text-base font-semibold text-gray-900 sm:text-lg">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14A1 1 0 003 19h18a1 1 0 00.89-1.47l-8.18-14a1 1 0 00-1.72 0z" />
              </svg>
              Delete Entry?
            </h3>
            <p className="mb-5 text-sm text-gray-600 sm:mb-6">
              This action cannot be undone. The journal entry will be permanently deleted.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex h-11 w-full flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-slate-900 sm:h-auto sm:text-base"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={() => handleDeleteJournal(deleteConfirm)}
                className="flex h-11 w-full flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-red-700 sm:h-auto sm:text-base"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v12a2 2 0 002 2h4a2 2 0 002-2V7" />
                </svg>
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
            fetchAnalytics();
            setEditingJournal(null);
          }}
          journal={editingJournal}
        />
      )}
    </div>
  );
};

export default Dashboard;
