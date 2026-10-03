import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Factory, Activity, History, UserCircle, LogOut, LayoutDashboard, 
  MessageSquare, Sparkles, ChevronRight, Cpu, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { applyIndustryTheme, getIndustryConfig } from '../config/industryMapping';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    applyIndustryTheme(user?.industry);
  }, [user?.industry]);

  const config = getIndustryConfig(user?.industry);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Predict', path: '/predict', icon: Activity },
    { name: 'History', path: '/history', icon: History },
    { name: 'Chatbot', path: '/chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* Ambient Mesh Glows (Subtle Light Orbs) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Floating Light Modern Header */}
      <header className="sticky top-0 z-50 px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl px-4 py-2.5 sm:px-6 flex items-center justify-between border border-slate-200/80 shadow-md shadow-slate-900/5">
            
            {/* Brand / Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 p-0.5 shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Factory className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                </div>
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5 font-heading">
                  <span>FactoryIQ</span>
                  <span className="text-indigo-600">AI</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SMART PLANT SUITE</span>
                </div>
              </div>
            </Link>

            {/* Navigation Links for Authenticated Users */}
            {user ? (
              <div className="flex items-center gap-4">
                <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
                  {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? 'text-indigo-700 bg-white shadow-sm border border-indigo-100 font-extrabold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="h-6 w-px bg-slate-200 hidden md:block" />

                {/* Active Sector Pill & User Badge */}
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 hover:border-indigo-300 transition-colors shadow-xs"
                  >
                    <span className="text-base">{config.emoji}</span>
                    <span className="font-bold text-slate-800">{config.name}</span>
                  </Link>

                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 p-1 sm:pr-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 transition-colors shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold hidden sm:inline max-w-[80px] truncate">{user.username}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-slate-700 font-bold hover:text-indigo-600 text-xs transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Floating Bottom Dock */}
      {user && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
          <div className="glass rounded-2xl border border-slate-200/90 shadow-xl p-2 flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Light Professional System Status Footer */}
      <footer className="border-t border-slate-200 py-6 px-4 sm:px-8 relative z-10 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 font-mono font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ACTIVE
            </span>
            <span className="text-slate-300">•</span>
            <span>ML Engine: Scikit-Learn</span>
            <span className="text-slate-300">•</span>
            <span>AI Advisor: Groq OSS-120B</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} FactoryIQ AI. Smart Factory Autonomous Analytics.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
