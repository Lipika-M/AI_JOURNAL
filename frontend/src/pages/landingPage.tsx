import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

type FeatureCard = {
  title: string;
  description: string;
  iconClassName: string;
};

const featureCards: FeatureCard[] = [
  {
    title: "AI Sentiment Analysis",
    description:
      "Advanced AI analyzes your entries to detect emotional patterns and provide real-time sentiment insights.",
    iconClassName: "from-[#ececec] to-[#cfcfcf]",
  },
  {
    title: "Mood Analytics",
    description:
      "Visualize emotional trends over time with interactive charts and detailed personal insights.",
    iconClassName: "from-[#e6e6e6] to-[#c7c7c7]",
  },
  {
    title: "Privacy First",
    description:
      "Your thoughts remain private with secure-by-design architecture and protected personal data.",
    iconClassName: "from-[#dddddd] to-[#bfbfbf]",
  },
  {
    title: "Smart Search",
    description:
      "Find past entries instantly with search across titles, content, tags, and sentiment patterns.",
    iconClassName: "from-[#f0f0f0] to-[#cdcdcd]",
  },
];

const bulletPointsOne = [
  "Interactive mood trend charts",
  "Sentiment distribution analytics",
  "Weekly and monthly insights",
];

const bulletPointsTwo = [
  "Real-time sentiment detection",
  "Emotion pattern recognition",
  "Thoughtful AI-generated reflections",
];

const HERO_VIDEO_URL =
  "https://res.cloudinary.com/lipika/video/upload/f_auto,q_auto/v1772887404/WhatsApp_Video_2026-03-07_at_6.11.03_PM_x6opbh.mp4";
const HERO_VIDEO_POSTER =
  "https://res.cloudinary.com/lipika/video/upload/so_1,f_jpg,q_auto,w_1600/v1772887404/WhatsApp_Video_2026-03-07_at_6.11.03_PM_x6opbh.jpg";

const featureIconByTitle: Record<string, ReactElement> = {
  "AI Sentiment Analysis": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  "Mood Analytics": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" aria-hidden="true">
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 16v-4M12 16V8M18 16v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  "Privacy First": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.5 2.9 8.6 7 10 4.1-1.4 7-5.5 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9.5 12.2 1.8 1.8 3.4-3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "Smart Search": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden scroll-smooth bg-[#f7f7f7] text-slate-900">

      <main>
        <section
          className="relative isolate min-h-[100svh] overflow-hidden bg-slate-100 md:min-h-[95vh]"
          style={{
            backgroundImage: `url(${HERO_VIDEO_POSTER})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster={HERO_VIDEO_POSTER}
            preload="auto"
            aria-hidden="true"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
          <div
            className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-slate-950/85 via-slate-950/58 to-slate-950/18 sm:w-[82%] sm:from-slate-950/82 sm:via-slate-950/48 sm:to-transparent md:w-[72%]"
            aria-hidden="true"
          />

          <header className="absolute inset-x-0 top-0 z-20">
            <nav className="mx-auto mt-3 flex w-[calc(100%-1rem)] max-w-7xl items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-md sm:mt-4 sm:w-[calc(100%-2rem)] sm:px-4 sm:py-3 md:mt-6 md:w-[calc(100%-3rem)] md:px-6 md:py-4">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-left sm:gap-3"
                aria-label="Go to homepage"
              >
                <img src="/solace.svg" alt="Solace logo" className="h-8 w-8 rounded-lg ring-1 ring-white/40 sm:h-10 sm:w-10 sm:rounded-xl" />
                <span className="text-lg font-semibold tracking-tight text-white sm:text-2xl">Solace</span>
              </button>

              <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 transition hover:text-white sm:gap-2 sm:text-base"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" aria-hidden="true">
                    <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 shadow-[0_12px_22px_-16px_rgba(0,0,0,0.65)] transition hover:bg-slate-200 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Get Started
                </button>
              </div>
            </nav>
          </header>

          <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-4 pb-12 pt-22 sm:px-6 sm:pb-16 sm:pt-28 md:min-h-[95vh] md:px-12 md:pb-24 md:pt-36">
            <div className="max-w-3xl text-left">
              <h1 className="text-2xl font-semibold leading-tight tracking-tight text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:text-4xl md:text-6xl">
                Find clarity through
                <span className="block">mindful reflection</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/92 drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)] sm:mt-6 sm:text-lg md:text-2xl">
                Capture your thoughts, understand your emotions, and gain insights with AI-powered
                journaling designed for mental clarity.
              </p>
              <div className="mt-8 sm:mt-10">
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-slate-300 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_20px_40px_-22px_rgba(0,0,0,0.85)] transition hover:bg-slate-200 sm:h-auto sm:w-auto sm:px-10 sm:py-4 sm:text-xl"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Start Journaling Free
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="relative z-20 mx-auto mt-8 w-full max-w-6xl rounded-t-[2rem] border border-slate-200/80 bg-white px-4 pt-16 pb-16 sm:px-6 md:mt-12 md:px-10 md:pt-20 md:pb-20"
        >
          <h2 className="text-center text-xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-5xl lg:text-6xl">
            Everything you need for meaningful journaling
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-sm text-slate-600 sm:mt-4 sm:text-base md:text-lg">
            Powerful features designed to support your mental wellness journey.
          </p>

          <div className="mt-10 grid gap-5 sm:mt-12 sm:gap-7 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.25)] sm:p-7"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-xs font-bold text-[#1f2937] sm:h-14 sm:w-14 sm:text-sm ${feature.iconClassName}`}
                >
                  {featureIconByTitle[feature.title]}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900 sm:mt-6 sm:text-xl">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:mt-4">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="insights"
          className="mx-auto mt-8 w-full max-w-6xl space-y-14 border-t border-slate-200 px-4 pt-16 pb-16 sm:px-6 md:mt-12 md:space-y-20 md:px-10 md:pt-20 md:pb-20"
        >
          <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 sm:px-5 sm:text-sm">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Track Your Progress
              </span>
              <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:mt-5 sm:text-4xl md:text-5xl">
                Understand your emotional patterns
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:mt-6 sm:text-base md:text-lg">
                Beautiful visualizations help you identify trends, recognize patterns, and gain
                deeper insights into your mental wellness journey.
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-700 sm:mt-7 sm:text-base md:text-lg">
                {bulletPointsOne.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-700 sm:h-6 sm:w-6">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" aria-hidden="true">
                        <path d="m5 12 5 5 9-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_18px_34px_-20px_rgba(15,23,42,0.25)] sm:p-5">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
                alt="Analytics dashboard preview"
                className="h-[240px] w-full rounded-2xl object-cover sm:h-[300px] md:h-[380px] lg:h-[420px]"
              />
            </div>
          </div>

          <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="order-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_18px_34px_-20px_rgba(15,23,42,0.25)] sm:p-5 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80"
                alt="Calming stones representing mindful reflection"
                className="h-[240px] w-full rounded-2xl object-cover sm:h-[300px] md:h-[380px] lg:h-[420px]"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 sm:px-5 sm:text-sm">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M12 3a9 9 0 1 0 9 9h-9V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                AI-Powered Insights
              </span>
              <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:mt-5 sm:text-4xl md:text-5xl">
                Get personalized reflections
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:mt-6 sm:text-base md:text-lg">
                Our AI analyzes your writing to provide thoughtful guidance that helps you
                understand your thoughts and emotions more deeply.
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-700 sm:mt-7 sm:text-base md:text-lg">
                {bulletPointsTwo.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-700 sm:h-6 sm:w-6">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" aria-hidden="true">
                        <path d="m5 12 5 5 9-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          id="start"
          className="mx-auto mt-8 w-full max-w-6xl border-t border-slate-200 px-4 pt-16 pb-16 sm:px-6 md:mt-12 md:px-10 md:pt-20 md:pb-20"
        >
          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-white to-slate-100 px-5 py-12 text-center shadow-[0_28px_55px_-32px_rgba(15,23,42,0.2)] sm:px-8 sm:py-14 md:px-14 md:py-16">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-5xl">
              Start your journaling journey today
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base md:text-lg">
              Join thousands of people finding clarity and peace through mindful reflection.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-slate-800 bg-slate-900 px-10 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:mt-9 sm:w-auto sm:px-12"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Get Started Free
            </button>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 bg-white md:mt-12">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-slate-600 sm:gap-3 sm:px-6 md:flex-row md:px-10 md:text-left">
            <p className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-600" fill="none" aria-hidden="true">
                <path d="M12 20.3c-.3 0-.6-.1-.8-.3-2.8-2.3-4.9-4.2-6.3-5.9C3.4 12.3 2.7 10.7 2.7 8.9c0-3.1 2.4-5.4 5.5-5.4 1.7 0 3.2.7 4.2 1.9 1-1.2 2.5-1.9 4.2-1.9 3.1 0 5.5 2.3 5.5 5.4 0 1.8-.7 3.4-2.2 5.2-1.4 1.7-3.5 3.6-6.3 5.9-.2.2-.5.3-.8.3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Solace
            </p>
            <p className="text-sm">Copyright 2026 Solace. Your thoughts, your sanctuary.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
