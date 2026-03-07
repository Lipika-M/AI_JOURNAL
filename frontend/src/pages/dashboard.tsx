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
    } catch (err: any) {
      setError(err?.message || "Logout failed. Please try again.");
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
    const x = 70 + (index / Math.max(1, totalPoints - 1)) * 900;
    const value = Math.max(0, Math.min(1, point?.averageScore || 0));
    const y = 300 - value * 260;
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
      const x = 70 + (index / Math.max(1, totalPoints - 1)) * 900;
      const value = Math.max(0, Math.min(1, point.averageScore || 0));
      const y = 300 - value * 260;
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

  const handleMoodChartMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!moodTrends.length) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * 1000;
    const svgY = ((event.clientY - rect.top) / rect.height) * 350;
    const clampedX = Math.min(915, Math.max(85, svgX));
    const clampedY = Math.min(280, Math.max(50, svgY));

    setMoodTooltipPosition({ x: clampedX, y: clampedY });

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < moodTrends.length; index += 1) {
      const pointX = 70 + (index / Math.max(1, moodTrends.length - 1)) * 900;
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

  const handleSentimentChartMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!sentimentDistribution.length) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = Math.min(
      rect.width,
      Math.max(0, event.clientX - rect.left)
    );
    const relativeY = Math.min(
      rect.height,
      Math.max(0, event.clientY - rect.top)
    );

    const horizontalPadding = 24;
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/solace.svg" alt="Solace logo" className="h-9 w-9 rounded-lg ring-1 ring-slate-700" />
              <h1 className="text-2xl font-semibold text-white">Solace</h1>
            </div>
            <div className="flex items-center gap-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200">
                <svg className="h-4 w-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {journals.length} {journals.length === 1 ? 'entry' : 'entries'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-4 py-1.5 text-sm font-medium text-slate-200 transition-all duration-300 hover:bg-slate-800 hover:text-white"
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
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Journals</h2>
              <p className="text-sm text-gray-500">Capture your thoughts, track your emotions, and reflect on your journey</p>
            </div>
            <button
              onClick={() => setShowEditorModal(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-medium text-white shadow-sm transition-all duration-300 hover:bg-slate-800"
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
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 pr-14 text-sm shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400"
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
        {!isSearching && !isAnalyticsLoading && (moodTrends.length > 0 || sentimentDistribution.length > 0) && (
          <section className="mb-12">
            {/* Mood Trends Chart - Full Width */}
            {moodTrends.length > 0 && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Mood Trends</h3>
                </div>
                <div className="h-80 px-2 relative">
                  <svg
                    viewBox="0 0 1000 350"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                    onMouseMove={handleMoodChartMouseMove}
                    onMouseLeave={() => {
                      setHoveredMoodPoint(null);
                      setMoodTooltipPosition(null);
                    }}
                  >
                      {/* Y-Axis */}
                      <line x1="70" y1="30" x2="70" y2="300" stroke="#d1d5db" strokeWidth="1.5" />
                      
                      {/* X-Axis */}
                      <line x1="70" y1="300" x2="970" y2="300" stroke="#d1d5db" strokeWidth="1.5" />
                      
                      {/* Y-Axis Grid Lines and Labels */}
                      {[0, 25, 50, 75, 100].map((value) => {
                        const y = 300 - (value / 100) * 260;
                        return (
                          <g key={`grid-${value}`}>
                            <line x1="75" y1={y} x2="970" y2={y} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.2" />
                            <text x="55" y={y + 4} fontSize="12" fill="#64748b" textAnchor="end">
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
                          <text key={`label-${index}`} x={x} y="330" fontSize="12" fill="#64748b" textAnchor="middle">
                            {label}
                          </text>
                        );
                      })}
                      
                      {/* Line Chart */}
                      <path
                        d={buildSmoothMoodPath(moodChartPoints)}
                        fill="none"
                        stroke="#334155"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {hoveredMoodPoint && (
                        <line
                          x1={hoveredMoodPoint.x}
                          y1="30"
                          x2={hoveredMoodPoint.x}
                          y2="300"
                          stroke="#334155"
                          strokeWidth="1.5"
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
                              r={hoveredMoodPoint?.index === index ? "6" : "4"}
                              fill="#475569"
                              stroke="white"
                              strokeWidth="2"
                              className="transition-all duration-200"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {hoveredMoodPoint && (
                      <div
                        className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-[120%] bg-white/95 border border-slate-300/30 rounded-xl px-3 py-2 shadow-sm transition-all duration-300 ease-out"
                        style={{
                          left: `${((moodTooltipPosition?.x ?? hoveredMoodPoint.x) / 1000) * 100}%`,
                          top: `${((moodTooltipPosition?.y ?? hoveredMoodPoint.y) / 350) * 100}%`,
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
            <div className="grid gap-6 md:grid-cols-2 mb-6">

              {/* Sentiments */}
              {sentimentDistribution.length > 0 && (
                <div className="flex h-full min-h-[520px] flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
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
                        {sentimentYAxisTicks.map((val) => (
                          <div key={val} className="text-right pr-3">
                            {Number.isInteger(val) ? val : val.toFixed(2)}
                          </div>
                        ))}
                      </div>
                      
                      {/* Chart area with axes */}
                      <div
                        className="flex-1 border-l-2 border-b-2 border-gray-300 relative"
                        style={{ height: '220px' }}
                        onMouseMove={handleSentimentChartMouseMove}
                        onMouseLeave={() => {
                          setHoveredSentiment(null);
                          setSentimentTooltipPosition(null);
                        }}
                      >
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          {sentimentYAxisTicks.map((_, i) => (
                            <div key={i} className="border-t border-slate-400/20 border-dashed"></div>
                          ))}
                        </div>

                        {hoveredSentiment && (
                          <div
                            className="absolute top-0 bottom-0 bg-slate-400/30 pointer-events-none z-[1]"
                            style={{
                              left: `calc(24px + ${hoveredSentiment.index} * ((100% - 48px) / ${Math.max(1, sentimentDistribution.length)}))`,
                              width: `calc((100% - 48px) / ${Math.max(1, sentimentDistribution.length)})`,
                            }}
                          />
                        )}

                        {hoveredSentiment && sentimentTooltipPosition && (
                          <div
                            className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-[130%] bg-white/95 border border-slate-300/30 rounded-xl px-3 py-2 shadow-sm transition-all duration-500 ease-out whitespace-nowrap"
                            style={{
                              left: `${sentimentTooltipPosition.x}%`,
                              top: `${sentimentTooltipPosition.y}%`,
                            }}
                          >
                            <div className="text-slate-700 font-medium text-sm capitalize">
                              {hoveredSentiment.sentiment}
                            </div>
                            <div className="text-slate-600 text-xs">
                              {hoveredSentiment.count} entries ({hoveredSentiment.percent}%)
                            </div>
                          </div>
                        )}
                        
                        {/* Bars */}
                        <div
                          className="relative h-full grid px-6"
                          style={{
                            gridTemplateColumns: `repeat(${Math.max(1, sentimentDistribution.length)}, minmax(0, 1fr))`,
                          }}
                        >
                          {sentimentDistribution.map((item, index) => {
                            const heightPercent = maxSentimentCount > 0 ? (item.count / maxSentimentCount) * 100 : 0;
                            const isActive = hoveredSentiment?.index === index;
                            
                            return (
                              <div key={item.sentiment} className="flex flex-col items-center">
                                {/* Bar */}
                                <div
                                  className="w-full h-full relative rounded-md transition-none px-2"
                                >
                                  <div 
                                    className={`absolute bottom-0 left-2 right-2 rounded-t-[8px] ${getSentimentBarColor(item.sentiment)} transition-all duration-500 ease-out ${isActive ? 'opacity-100 brightness-110' : 'opacity-90'}`}
                                    style={{ height: `${heightPercent}%` }}
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
                    <div className="grid grid-cols-3 gap-5 px-6 pt-8">
                      {sentimentDistribution.map((item) => {
                        const totalPercent = sentimentTotal ? Math.round((item.count / sentimentTotal) * 100) : 0;
                        const isActive = hoveredSentiment?.sentiment === item.sentiment;
                        return (
                          <div
                            key={item.sentiment}
                            className={`mx-auto w-full max-w-[150px] rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center transition-all duration-300 ${isActive ? 'shadow-sm ring-1 ring-slate-300/70' : ''}`}
                          >
                            <div className="text-2xl font-bold text-slate-800 leading-none">{totalPercent}%</div>
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
                <div className="flex h-full min-h-[520px] flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Tags</h3>
                  </div>
                  <div className="space-y-2 flex-1">
                    {tagsDistribution.slice(0, 5).map((tag, index) => (
                      <div key={tag.tag} className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
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
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Best Moods</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {topTagsByMood.map((tag) => (
                    <div key={tag.tag} className="bg-white/70 rounded-xl p-4 border border-white/60">
                      <div className="mb-3 inline-flex h-14 min-w-24 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 shadow-sm">
                        <span className="text-2xl font-bold text-slate-800">
                          {Math.round(tag.averageMood * 100)}%
                        </span>
                      </div>
                      <div className="text-sm text-slate-700 font-medium truncate">
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
        {!isSearching && !isLoading && journals.length === 0 && (
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
              className="rounded-xl bg-slate-900 px-6 py-2.5 font-medium text-white transition-all duration-300 hover:bg-slate-800"
            >
              Create Your First Entry
            </button>
          </div>
        )}

        {/* No Search Results */}
        {isSearching && !isLoading && journals.length > 0 && filteredJournals.length === 0 && (
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
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-6H5m14 12H5m14 6H5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {isSearching ? "Search Results" : "Recent Entries"}
              </h3>
            </div>
            <div className="relative">
              {/* Timeline items */}
              <div className="space-y-6">
                {filteredJournals.map((journal, index) => {
                  const date = journal.createdAt ? new Date(journal.createdAt) : new Date();
                  const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
                  const day = date.getDate();
                  
                  return (
                    <div key={journal._id} className="relative flex gap-6">
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
             transition-all duration-300 rounded-2xl p-8 cursor-pointer"
                        onClick={() => navigate(`/journals/${journal._id}`)}
                      >

                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-semibold text-gray-900">{journal.title}</h3>
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
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingJournal(journal);
                                setShowEditorModal(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 px-5 py-2 text-sm font-semibold transition border border-slate-200 bg-white"
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
                              className="inline-flex items-center gap-1.5 rounded-full text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 px-5 py-2 text-sm font-semibold transition border border-slate-200 bg-white"
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
                          <div className="mb-5 flex items-center gap-2">
                             <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${getSentimentColor(journal.sentiment)}`}>
                              {getSentimentIcon(journal.sentiment)}
                              {journal.moodScore !== undefined && (
                                <span>{(journal.moodScore * 100).toFixed(0)}% {getSentimentLabel(journal.sentiment)}</span>
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
                                className="inline-flex items-center gap-1.5 text-sm px-4 py-1 rounded-full bg-slate-50 text-slate-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="mb-2 inline-flex items-center gap-2 text-lg font-semibold text-gray-900">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14A1 1 0 003 19h18a1 1 0 00.89-1.47l-8.18-14a1 1 0 00-1.72 0z" />
              </svg>
              Delete Entry?
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              This action cannot be undone. The journal entry will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-slate-900"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={() => handleDeleteJournal(deleteConfirm)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition-all duration-300 hover:bg-red-700"
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
            setEditingJournal(null);
          }}
          journal={editingJournal}
        />
      )}
    </div>
  );
};

export default Dashboard;
