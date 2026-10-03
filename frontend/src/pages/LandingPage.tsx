import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, Cpu, Factory, LineChart, ShieldCheck, Zap, ArrowRight, 
  Activity, CheckCircle2, Sparkles, Sliders, TrendingUp, Gauge, 
  Layers, ArrowUpRight, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INDUSTRY_MAPPINGS } from '../config/industryMapping';

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState('🚗 Automotive');

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 font-semibold text-sm">Initializing FactoryIQ AI...</span>
        </div>
      </div>
    );
  }

  const activeSector = INDUSTRY_MAPPINGS[selectedIndustry] || INDUSTRY_MAPPINGS['🚗 Automotive'];

  const stats = [
    { label: 'Prediction Precision', value: '99.4%', trend: 'Trained on 10k+ Telemetry Cycles' },
    { label: 'Inference Latency', value: '< 25ms', trend: 'Instant Edge ML Evaluation' },
    { label: 'Changeover Recovery', value: '3.4x', trend: 'Via Guided SMED Optimization' },
    { label: 'Industry Blueprints', value: '6 Sectors', trend: 'Automotive, Tech, Pharma & More' },
  ];

  const capabilities = [
    {
      title: 'Real-Time Scikit-Learn Inference',
      description: 'Instant multi-factor efficiency scoring evaluating machine utilization, scrap rate, and downtime with mathematical certainty.',
      icon: LineChart,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Groq Cloud AI Operations Advisor',
      description: 'Llama/GPT-OSS ultra-fast LLMs translate telemetry into direct engineering fixes, SMED changeover steps, and root-cause fixes.',
      icon: Bot,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      title: 'Automated Parameter Calibration',
      description: 'Instant mathematical gap analysis comparing your current line metrics against optimal benchmarks to deliver targeted engineering fixes.',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Multi-Industry Dynamic Adaptation',
      description: 'One platform automatically reshapes schemas, terminology, SVGs, and PDF exports for Automotive, Electronics, Pharma, and Food.',
      icon: Factory,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      title: 'Automated Formal PDF Reports',
      description: 'Single-click generation of audit-ready operational reports with executive summaries, risk breakdowns, and parameter targets.',
      icon: Layers,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    {
      title: 'Enterprise RBAC & Security',
      description: 'Encrypted token authentication, audit-trail logging, and secure state management preserving proprietary factory data.',
      icon: ShieldCheck,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  return (
    <div className="flex flex-col gap-16 pb-16">
      
      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 text-slate-900 p-8 md:p-14 border border-slate-200 shadow-xl shadow-slate-100/80">
        
        {/* Soft Ambient decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>FACTORYIQ AI 2.0 • AUTONOMOUS PLANT INTELLIGENCE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] font-heading text-slate-900">
              Autonomous Intelligence for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-teal-600">
                Next-Gen Manufacturing
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
              Predict factory throughput bottlenecks, simulate operational adjustments with live ML models, and generate expert engineering directives in milliseconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link 
                to={user ? "/predict" : "/register"}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group text-sm transform hover:-translate-y-0.5"
              >
                <span>{user ? "Launch Predictor" : "Deploy Free Trial"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to={user ? "/dashboard" : "/login"}
                className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all text-sm flex items-center justify-center gap-2 hover:border-slate-300"
              >
                <span>{user ? "View Dashboard" : "Sign In to Platform"}</span>
              </Link>
            </div>

            {/* Micro checklist */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600 font-bold" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600 font-bold" /> 6 Industry Templates</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600 font-bold" /> Instant PDF generation</span>
            </div>

          </div>

          {/* Right Column: Interactive Live Plant Preview Widget */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl shadow-indigo-100/50 relative">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Live Telemetry Stream</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold tracking-wide">
                  OPTIMAL (94.2%)
                </span>
              </div>

              {/* Gauge & Metrics preview */}
              <div className="py-5 space-y-4">
                
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-600">{activeSector.labels.machine_utilization}</span>
                    <span className="text-indigo-600 font-mono font-bold">92.5% (Target: ≥90%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full w-[92.5%] rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-600">{activeSector.labels.downtime}</span>
                    <span className="text-emerald-600 font-mono font-bold">0.6h (Target: ≤0.8h)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[25%] rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-600">{activeSector.labels.defect_rate}</span>
                    <span className="text-teal-600 font-mono font-bold">0.85% (Target: ≤1.2%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full w-[18%] rounded-full" />
                  </div>
                </div>

              </div>

              {/* AI Directive Card Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>FactoryIQ AI Plant Directive</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  "Line balance optimal. SMED fast-changeover protocol maintaining cycle takt time under 45s with zero feeder starvation."
                </p>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* STATS RIBBON */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{s.label}</span>
            <div className="text-3xl font-black text-slate-900 font-heading mt-2 mb-1">{s.value}</div>
            <span className="text-xs text-indigo-600 font-semibold">{s.trend}</span>
          </div>
        ))}
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE INDUSTRY BLUEPRINTS PREVIEW */}
      {/* ========================================================================= */}
      <section className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-md space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest font-mono block mb-2">Adaptive Architecture</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-heading">
              Tailored for Every Manufacturing Vertical
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Select an industry below to see how FactoryIQ AI automatically customizes parameters, terminology, and operational logic.
            </p>
          </div>
        </div>

        {/* Sector Selector Chips */}
        <div className="flex flex-wrap gap-2.5">
          {Object.keys(INDUSTRY_MAPPINGS).map((key) => {
            const isSelected = selectedIndustry === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedIndustry(key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{key}</span>
              </button>
            );
          })}
        </div>

        {/* Active Sector Blueprint Details Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-200 grid md:grid-cols-3 gap-6">
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">Production Line Term</span>
            <p className="text-lg font-bold text-slate-900 font-heading">{activeSector.productionLineTerm}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">Primary Quality Metric</span>
            <p className="text-lg font-bold text-indigo-600 font-heading">{activeSector.labels.defect_rate}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">Utilization Sensor</span>
            <p className="text-lg font-bold text-emerald-600 font-heading">{activeSector.labels.machine_utilization}</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PLATFORM CAPABILITIES */}
      {/* ========================================================================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest font-mono">Engineered For Reliability</span>
          <h2 className="text-3xl font-black text-slate-900 font-heading">End-to-End Plant Intelligence</h2>
          <p className="text-slate-600 text-sm">
            Everything your operations team needs to forecast capacity, eliminate downtime, and export compliance reports.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center mb-5 border shadow-sm`}>
                  <c.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading group-hover:text-indigo-600 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  {c.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BOTTOM CTA BANNER */}
      {/* ========================================================================= */}
      <section className="rounded-3xl p-10 md:p-16 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white border border-indigo-500/30 text-center relative overflow-hidden shadow-2xl shadow-indigo-600/20">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-black font-heading leading-tight">
            Ready to Accelerate Plant Efficiency?
          </h2>
          <p className="text-indigo-100 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Join modern manufacturers optimizing their lines with FactoryIQ AI. Start your first prediction in seconds.
          </p>
          <div className="pt-2">
            <Link
              to={user ? "/predict" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-extrabold rounded-2xl hover:bg-slate-50 transition-all shadow-xl text-sm"
            >
              <span>{user ? "Go to Prediction Form" : "Create Free Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
