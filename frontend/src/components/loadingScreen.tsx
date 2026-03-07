const LoadingScreen = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f7] px-4">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300/35 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
        <img src="/solace.svg" alt="Solace logo" className="h-12 w-12 rounded-xl ring-1 ring-slate-200" />

        <div className="flex items-center gap-2" aria-label="Loading animation" role="status">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-700 [animation-delay:-0.3s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-600 [animation-delay:-0.15s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-500" />
        </div>

        <p className="text-sm font-medium text-slate-600">Loading your space...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
