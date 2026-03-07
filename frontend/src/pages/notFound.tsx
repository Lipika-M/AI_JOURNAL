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
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-block">
            <svg
              className="w-32 h-32 text-stone-400 mx-auto"
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
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* 404 Text */}
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>

          {/* Navigation Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-medium text-white transition hover:bg-slate-800"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Go Back
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>If you think this is a mistake, please contact support</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;