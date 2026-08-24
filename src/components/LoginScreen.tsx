import React from "react";
import {
  LogIn,
  Zap,
  ArrowRight,
  Shield,
  Clock,
  FileText,
  Factory,
  Flame,
  Mountain,
  FlaskConical,
  Wind,
  HardHat,
} from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
  onGuestAccess: () => void;
}

const industries = [
  { label: "Cement", icon: <Factory size={12} /> },
  { label: "Power", icon: <Zap size={12} /> },
  { label: "Oil & Gas", icon: <Flame size={12} /> },
  { label: "Metals & Mining", icon: <Mountain size={12} /> },
  { label: "Chemicals", icon: <FlaskConical size={12} /> },
  { label: "Renewable Energy", icon: <Wind size={12} /> },
  { label: "Infrastructure", icon: <HardHat size={12} /> },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onGuestAccess,
}) => {
  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col items-center p-8 space-y-16 relative overflow-hidden"
      role="main"
    >
      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1e3a5f 1px, transparent 1px), linear-gradient(to bottom, #1e3a5f 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Soft gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-amber-500/5 pointer-events-none" />

      {/* ========== 1. Welcome Section ========== */}
      <header
        className="max-w-3xl text-center space-y-6 relative z-10 pt-8"
        role="banner"
      >
        {/* Brand Name & Tagline */}
        <div className="mb-6">
          <h1
            className="text-slate-900 font-extrabold text-5xl md:text-6xl tracking-tight animate-fade-in-up"
            id="main-title"
          >
            CemtrAS <span className="text-blue-800">AI</span>
          </h1>
          <p className="text-amber-600 text-xl md:text-2xl font-semibold mt-3 animate-fade-in">
            AI-Driven Engineering for EPC Excellence
          </p>
        </div>

        {/* Welcome Message */}
        <h2
          className="text-4xl font-bold text-slate-800 leading-tight animate-fade-in-up delay-200"
          id="welcome-heading"
        >
          Welcome to CemtrAS AI
        </h2>
        <p className="text-slate-600 text-lg animate-fade-in delay-300 max-w-2xl mx-auto">
          <span className="text-blue-800">
            AI-powered EPC Project Operations, Safety & Efficiency Expert — your
            trusted partner across cement, power, oil & gas, metals & mining,
            chemicals, renewable energy, and infrastructure projects
          </span>
        </p>

        {/* Industry pill badges */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {industries.map((ind) => (
            <span
              key={ind.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-semibold shadow-sm hover:shadow-md transition-shadow"
            >
              {ind.icon}
              {ind.label}
            </span>
          ))}
        </div>
      </header>

      {/* ========== 2. Login & Guest Access Section ========== */}
      <section
        className="w-full max-w-2xl space-y-12 relative z-10"
        aria-labelledby="access-options-heading"
      >
        <h2 id="access-options-heading" className="sr-only">
          Access Options
        </h2>

        {/* Login/Register Card */}
        <div
          className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-slate-200 hover:border-blue-400 transition-all duration-300"
          role="region"
          aria-labelledby="login-card-title"
        >
          <div className="text-center">
            <div className="p-4 bg-gradient-to-br from-slate-700 to-blue-900 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <LogIn className="text-white w-8 h-8" />
            </div>
            <h3
              id="login-card-title"
              className="text-2xl font-bold text-slate-800 mb-4"
            >
              Login / Register
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Access advanced features and personalized experience
            </p>
            <ul
              className="space-y-3 mb-8 text-left"
              role="list"
              aria-label="Premium features"
            >
              <li className="flex items-center gap-3">
                <Shield className="text-blue-700 w-5 h-5" />
                <span className="text-slate-700 font-semibold">
                  Save chat history & detailed reports
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="text-emerald-600 w-5 h-5" />
                <span className="text-slate-700 font-semibold">
                  Extended session capabilities
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FileText className="text-violet-600 w-5 h-5" />
                <span className="text-slate-700 font-semibold">
                  Upload PDF & image files for analysis
                </span>
              </li>
            </ul>
            <button
              onClick={onLogin}
              className="w-full bg-gradient-to-r from-slate-700 to-blue-900 text-white font-bold py-4 px-6 rounded-xl
                       hover:from-slate-800 hover:to-blue-950 transition-all duration-300 shadow-lg hover:shadow-xl
                       flex items-center justify-center gap-3 text-lg"
              aria-label="Login or register for premium features"
            >
              <LogIn size={20} />
              Login / Register
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Guest Access Card */}
        <div
          className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-amber-200 hover:border-amber-400 transition-all duration-300"
          role="region"
          aria-labelledby="guest-card-title"
        >
          <div className="text-center">
            <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Zap className="text-white w-8 h-8" />
            </div>
            <h3
              id="guest-card-title"
              className="text-2xl font-bold text-slate-800 mb-4"
            >
              Quick Guest Access
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Continue without login for fast one-time queries
            </p>
            <ul
              className="space-y-3 mb-8 text-left"
              role="list"
              aria-label="Guest features"
            >
              <li className="flex items-center gap-3">
                <ArrowRight className="text-amber-600 w-5 h-5" />
                <span className="text-slate-700 font-semibold">
                  Instant access to AI assistant
                </span>
              </li>
              <li className="flex items-center gap-3">
                <ArrowRight className="text-amber-600 w-5 h-5" />
                <span className="text-slate-700 font-semibold">
                  No registration required
                </span>
              </li>
              <li className="flex items-center gap-3">
                <ArrowRight className="text-amber-600 w-5 h-5" />
                <span className="text-slate-700 font-semibold">
                  Perfect for quick consultations
                </span>
              </li>
            </ul>
            <button
              onClick={onGuestAccess}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-4 px-6 rounded-xl
                       hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl
                       flex items-center justify-center gap-3 text-lg"
              aria-label="Continue as guest user"
            >
              <Zap size={20} />
              Continue as Guest
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ========== 3. About Founder Section ========== */}
      <section
        className="max-w-3xl text-center space-y-6 relative z-10"
        aria-labelledby="founder-heading"
      >
        <div
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-300"
          role="region"
        >
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-amber-500 shadow-2xl mx-auto mb-6">
            <img
              src="/untitled (10).jpeg"
              alt="CemtrAS AI | AI-Driven Engineering for EPC Excellence by Vipul Sharma"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 id="founder-heading" className="text-2xl font-bold text-slate-800">
            Vipul Sharma
          </h2>
          <p className="text-amber-600 font-semibold text-lg mb-1">Founder</p>
          <p className="text-slate-600 text-base leading-relaxed">
            AI-powered EPC Project Operations, Safety & Efficiency Expert — your
            trusted partner across cement, power, oil & gas, metals & mining,
            chemicals, renewable energy, and infrastructure projects.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center mt-12 relative z-10" role="contentinfo">
        <p className="text-slate-500 text-sm">
          Powered by{" "}
          <span className="text-blue-800 font-bold">Advanced AI Technology</span>{" "}
          | © 2024 CemtrAS AI — EPC Project Expert
        </p>
      </footer>
    </div>
  );
};
