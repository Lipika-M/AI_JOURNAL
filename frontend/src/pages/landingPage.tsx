import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-neutral-50 to-stone-100 relative overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      >
        <source
          src="https://res.cloudinary.com/lipika/video/upload/v1770456726/7318024-hd_1920_1080_30fps_whxbqu.mp4"
          type="video/mp4"
        />
      </video>
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-end items-center px-8 py-6 gap-4">
        <button
          onClick={() => navigate("/login")}
          className="rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 px-8 py-3 font-medium transition-all duration-300"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg shadow-blue-200/50 rounded-xl px-8 py-3 font-medium transition-all duration-300"
        >
          Sign Up
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Title */}
          <h1 className="text-8xl md:text-9xl font-serif text-gray-800 mb-4">
            Solace
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 font-light italic mb-8">
            "Your AI companion for mindful journaling and self-reflection"
          </p>

          {/* Description */}
          <div className="mt-12 max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Solace is your personal AI journal designed to help you capture thoughts, track
              moods, and gain insights into your emotional journey. Our AI gently guides you,
              making reflection simple and meaningful. Your privacy is our top priority –
              everything you write is fully confidential.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
