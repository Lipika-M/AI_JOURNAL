import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7] px-4 py-8 sm:py-10">
      <div className="w-full max-w-md text-center">
        {/* 404 Illustration */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-block">
            <svg
              className="mx-auto h-24 w-24 text-stone-400 sm:h-32 sm:w-32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {/* 404 Text */}
          <h1 className="mb-2 text-5xl font-bold text-gray-800 sm:text-6xl">404</h1>
          <h2 className="mb-3 text-xl font-semibold text-gray-800 sm:mb-4 sm:text-2xl">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="mb-6 text-sm text-gray-600 sm:mb-8 sm:text-base">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>

          {/* Navigation Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 sm:h-12 sm:text-base"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:h-12 sm:text-base"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Go Back
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 px-2 text-center text-xs text-slate-600 sm:mt-6 sm:text-sm">
          <p>If you think this is a mistake, please contact support</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;