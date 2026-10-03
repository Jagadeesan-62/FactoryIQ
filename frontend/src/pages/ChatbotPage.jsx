import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getIndustryConfig } from '../config/industryMapping';
import {
  Send,
  User,
  Sparkles,
  Search,
  ArrowRight,
  TriangleAlert,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  AlertTriangle
} from 'lucide-react';

const MANUFACTURING_NOISE = [
  "Sensor 14: transient vibration peak 4.2mm/s",
  "Feeder belt belt-slip fluctuation logged",
  "Ambient humidity spike: 64% in zone B",
  "SMT nozzle micro-clog: 12ms delay",
  "Coolant level warning (reactor 3)",
  "Oven temperature fluctuation ±3.5°C",
  "Steel plate thickness tolerance +0.08mm",
  "Power phase angle deviation: 3.2°",
  "Worker shift handover logs: missing fields",
  "Pneumatic air pressure drop (5.2 bar)",
];

// Animated typing dots component
const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-1">
    <span
      className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"
      style={{ animationDelay: '0ms' }}
    />
    <span
      className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"
      style={{ animationDelay: '150ms' }}
    />
    <span
      className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"
      style={{ animationDelay: '300ms' }}
    />
  </div>
);

// Bot Avatar
const BotAvatar = ({ size = 'md' }) => {
  const sizeClass = size === 'lg' ? 'w-12 h-12 md:w-14 md:h-14' : size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const [imgError, setImgError] = React.useState(false);

  if (imgError) {
    return (
      <div className={`${sizeClass} rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/20`}>
        <span className="text-xs md:text-sm font-bold">AI</span>
      </div>
    );
  }

  return (
    <img
      src="/chatbot_avatar.png"
      alt="AI Assistant"
      className={`${sizeClass} rounded-xl object-cover flex-shrink-0 shadow-md shadow-indigo-600/20 border-2 border-indigo-100`}
      onError={() => setImgError(true)}
    />
  );
};

export default function ChatbotPage() {
  const { user } = useAuth();
  const config = getIndustryConfig(user?.industry);

  const [stage, setStage] = useState('input');
  const [question, setQuestion] = useState('');
  const [constraints, setConstraints] = useState('');
  const [noiseIdx, setNoiseIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [latestTelemetry, setLatestTelemetry] = useState(null);

  // Follow-up chat states
  const [followUpInput, setFollowUpInput] = useState('');
  const [inlineLoading, setInlineLoading] = useState(false);

  const noiseTimer = useRef(null);
  const chatBottomRef = useRef(null);
  const inputRef = useRef(null);

  // Default context if history is empty
  const defaultTelemetry = {
    production_time: 8.0,
    machine_utilization: 72.5,
    energy_consumption: 520.0,
    material_usage: 340.0,
    downtime: 2.5,
    worker_count: 12,
    defect_rate: 2.8,
    maintenance_frequency: 1,
    inventory_level: 400,
    prediction: 'Moderate',
    confidence: 82.4,
  };

  const activeTelemetry = latestTelemetry || defaultTelemetry;

  useEffect(() => {
    const fetchLatestHistory = async () => {
      try {
        const response = await api.get('/history');
        if (response.data && response.data.length > 0) {
          const item = response.data[0];
          setLatestTelemetry({
            production_time: item.production_time ?? 8.0,
            machine_utilization: item.machine_utilization ?? 75.0,
            energy_consumption: item.energy_consumption ?? 500.0,
            material_usage: item.material_usage ?? 300.0,
            downtime: item.downtime ?? 1.5,
            worker_count: item.worker_count ?? 10,
            defect_rate: item.defect_rate ?? 2.0,
            maintenance_frequency: item.maintenance_frequency ?? 1,
            inventory_level: item.inventory_level ?? 400,
            prediction: item.prediction ?? 'Unknown',
            confidence: item.confidence ?? null,
          });
        }
      } catch (err) {
        console.error('Failed to load latest telemetry context', err);
      }
    };
    fetchLatestHistory();
  }, []);

  useEffect(() => {
    if (stage === 'result') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [stage, messages]);

  const sampleQuestions = [
    `How can ${config?.labels?.downtime ? config.labels.downtime.toLowerCase().replace(' (hours)', '') : 'downtime'} be reduced?`,
    `What causes low ${config?.labels?.machine_utilization ? config.labels.machine_utilization.toLowerCase().replace(' (%)', '') : 'machine utilization'}?`,
    `How do we lower ${config?.labels?.defect_rate ? config.labels.defect_rate.toLowerCase().replace(' (%)', '') : 'defect rate'} without slowing the line?`,
    `What is the fastest way to achieve Optimal efficiency?`
  ];

  const handleQuickQuestion = (q) => {
    setQuestion(q);
    handleRunAnalysis(q);
  };

  const handleRunAnalysis = async (customQ) => {
    const query = customQ || question;
    if (!query.trim()) return;

    setStage('working');
    setErrorMsg('');
    setNoiseIdx(0);

    noiseTimer.current = setInterval(() => {
      setNoiseIdx((prev) => (prev + 1) % MANUFACTURING_NOISE.length);
    }, 400);

    try {
      const response = await api.post('/chat', {
        message: query,
        constraints: constraints.trim() || undefined,
        context: activeTelemetry,
      });

      clearInterval(noiseTimer.current);

      const botReply = response.data?.reply || response.data?.response || 'Analysis complete.';
      const sourceEngine = response.data?.source || 'groq';

      setMessages([
        { id: '1', sender: 'user', text: query, constraints },
        { id: '2', sender: 'bot', text: botReply, source: sourceEngine },
      ]);
      setStage('result');
    } catch (err) {
      clearInterval(noiseTimer.current);
      console.error('Analysis request failed', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to analyze operations telemetry.');
      setStage('error');
    }
  };

  const handleSendFollowUp = async () => {
    if (!followUpInput.trim() || inlineLoading) return;

    const userText = followUpInput.trim();
    setFollowUpInput('');

    const newMsg = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages((prev) => [...prev, newMsg]);
    setInlineLoading(true);

    try {
      const response = await api.post('/chat', {
        message: userText,
        context: activeTelemetry,
      });

      const botReply = response.data?.reply || response.data?.response || 'Analysis complete.';
      const sourceEngine = response.data?.source || 'groq';

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: botReply, source: sourceEngine },
      ]);
    } catch (err) {
      console.error('Follow-up chat failed', err);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Error connecting to operations engine. Please try again.', source: 'fallback' },
      ]);
    } finally {
      setInlineLoading(false);
    }
  };

  const reset = () => {
    setStage('input');
    setQuestion('');
    setConstraints('');
    setMessages([]);
    setErrorMsg('');
  };

  // Helper parser for Verdict Card
  const parseReply = (text) => {
    if (!text || typeof text !== 'string') {
      return {
        recommendation: text || 'Operational analysis completed.',
        why: [],
        uncertainties: []
      };
    }
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const why = [];
    let recommendation = '';
    const uncertainties = [];

    for (const line of lines) {
      if (line.startsWith('-') || line.startsWith('*') || /^\d+[\.\)]/.test(line)) {
        const cleanLine = line.replace(/^[\-\*\d\.\)\s]+/, '');
        if (
          cleanLine.toLowerCase().includes('uncertain') ||
          cleanLine.toLowerCase().includes('unverified') ||
          cleanLine.toLowerCase().includes('depends on') ||
          cleanLine.toLowerCase().includes('could not verify')
        ) {
          uncertainties.push(cleanLine);
        } else {
          why.push(cleanLine);
        }
      } else {
        if (!recommendation) {
          recommendation = line;
        } else if (recommendation.length < 150) {
          recommendation += ' ' + line;
        }
      }
    }

    if (!recommendation) recommendation = text;

    if (why.length === 0) {
      const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 10);
      if (sentences.length > 1) {
        why.push(...sentences.slice(1, 4));
      }
    }

    return {
      recommendation,
      why: why.slice(0, 3),
      uncertainties: uncertainties.length > 0 ? uncertainties.slice(0, 3) : [
        `Real-time ${config?.productionLineTerm ? config.productionLineTerm.toLowerCase() : 'production line'} sensor fluctuations (±1.5%)`,
        "Manual operator logs unverified for current shifts",
        "Raw material feedstock chemistry variance uncalibrated"
      ],
    };
  };

  // Metric benchmark rows
  const getBenchmarkRows = (telemetry) => {
    const t = telemetry || defaultTelemetry;
    const labels = config?.labels || {};
    return [
      {
        label: (labels.machine_utilization || 'Machine Utilization').replace(' (%)', ''),
        value: `${t.machine_utilization ?? 85}%`,
        target: '>= 80%',
        status: (t.machine_utilization ?? 85) >= 80 ? 'Optimal' : (t.machine_utilization ?? 85) >= 70 ? 'Warning' : 'Critical',
      },
      {
        label: (labels.downtime || 'Downtime').replace(' (Hours)', '').replace(' (hours)', ''),
        value: `${t.downtime ?? 1.0}h`,
        target: '<= 1.5h',
        status: (t.downtime ?? 1.0) <= 1.5 ? 'Optimal' : (t.downtime ?? 1.0) <= 3.0 ? 'Warning' : 'Critical',
      },
      {
        label: (labels.defect_rate || 'Defect Rate').replace(' (%)', ''),
        value: `${t.defect_rate ?? 1.5}%`,
        target: '<= 2.0%',
        status: (t.defect_rate ?? 1.5) <= 2.0 ? 'Optimal' : (t.defect_rate ?? 1.5) <= 5.0 ? 'Warning' : 'Critical',
      },
      {
        label: (labels.energy_consumption || 'Energy Consumption').replace(' (kWh)', ''),
        value: `${t.energy_consumption ?? 450} kWh`,
        target: '< 600 kWh',
        status: (t.energy_consumption ?? 450) < 600 ? 'Optimal' : (t.energy_consumption ?? 450) < 800 ? 'Warning' : 'Critical',
      },
      {
        label: labels.worker_count || 'Worker Count',
        value: `${t.worker_count ?? 15}`,
        target: '8 - 15',
        status: (t.worker_count ?? 15) >= 8 && (t.worker_count ?? 15) <= 15 ? 'Optimal' : 'Warning',
      },
    ];
  };

  const benchmarkRows = getBenchmarkRows(activeTelemetry);

  // Confidence badge color
  const getConfidenceStyle = (telemetry) => {
    if (!telemetry) return { text: 'HIGH', class: 'text-emerald-700 border-emerald-200 bg-emerald-50' };
    const score = telemetry.confidence;
    if (score !== null && score !== undefined) {
      if (score >= 85) return { text: 'HIGH', class: 'text-emerald-700 border-emerald-200 bg-emerald-50' };
      if (score >= 70) return { text: 'MEDIUM', class: 'text-amber-700 border-amber-200 bg-amber-50' };
      return { text: 'LOW', class: 'text-rose-700 border-rose-200 bg-rose-50' };
    }
    const pred = (telemetry.prediction || '').toLowerCase();
    if (pred === 'optimal' || pred === 'high') {
      return { text: 'HIGH', class: 'text-emerald-700 border-emerald-200 bg-emerald-50' };
    } else if (pred === 'moderate') {
      return { text: 'MEDIUM', class: 'text-amber-700 border-amber-200 bg-amber-50' };
    }
    return { text: 'LOW', class: 'text-rose-700 border-rose-200 bg-rose-50' };
  };

  const confidenceStyle = getConfidenceStyle(activeTelemetry);

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Outer Dashboard Panel */}
      <div className="relative overflow-hidden rounded-3xl bg-white text-slate-900 p-6 md:p-8 shadow-xl border border-slate-200 transition-all duration-300">
        
        {/* Dashboard Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <BotAvatar size="md" />
            <div>
              <h2 className="text-lg md:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>{config.emoji} AI {config.name} Advisor</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {stage === 'input' ? 'Ready to analyze telemetry' : 'Decisions & Insights Engine'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Advisor Live
            </span>
            {stage !== 'input' && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <X size={13} strokeWidth={2.5} />
                New Analysis
              </button>
            )}
          </div>
        </div>

        {/* STAGE 1: INPUT */}
        {stage === 'input' && (
          <div className="relative z-10 space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                One challenge in.<br />One optimal decision out.
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-2 max-w-xl leading-relaxed">
                Consult the advisor about your active {config.name.toLowerCase()} production line. Our AI will analyze your telemetry, filter the noise, and output a clean decision directive.
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Quick Inquiries</span>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q)}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-xs text-slate-700 transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:scale-[1.01] cursor-pointer font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">What challenge are you optimizing?</label>
              <textarea
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`e.g. How can we resolve the high defect rate and optimize SMT nozzle calibration parameters?`}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-xs sm:text-sm resize-none transition-all font-medium"
              />
            </div>

            {/* Constraints Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Operational Constraints <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. budget under $500, maintenance downtime < 2 hours, no additional staffing"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-xs sm:text-sm transition-all font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleRunAnalysis()}
              disabled={!question.trim()}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                question.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Consult Decision Advisor</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* STAGE 2: WORKING */}
        {stage === 'working' && (
          <div className="relative z-10 flex flex-col items-center py-10 animate-fadeIn">
            <div className="text-xs md:text-sm text-slate-600 font-medium text-center mb-10 max-w-sm px-4">
              "{question}"
            </div>

            {/* Funnel Filter Animation */}
            <div className="flex items-center gap-4 w-full max-w-lg justify-between px-4">
              
              {/* RAW Telemetry Noise Column */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Raw Telemetry</div>
                <div className="h-32 flex flex-col justify-end gap-2.5 overflow-hidden">
                  {MANUFACTURING_NOISE.slice(0, Math.min(MANUFACTURING_NOISE.length, noiseIdx + 1)).map((noise, i, arr) => {
                    const isLast = i === arr.length - 1;
                    return (
                      <div
                        key={noise}
                        className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-350 ${
                          isLast
                            ? 'text-slate-900 font-bold'
                            : 'text-slate-400 line-through opacity-40'
                        }`}
                      >
                        {noise}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filtering Funnel Center Icon */}
              <div className="flex-shrink-0 flex items-center justify-center text-indigo-600">
                <Search className="w-6 h-6 animate-spin" />
              </div>

              {/* SIGNAL Column */}
              <div className="w-24 flex-shrink-0 flex flex-col items-center">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Signal Output</div>
                <div className="h-32 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center animate-pulse">
                    <div className="w-4 h-4 rounded-full bg-indigo-600 shadow-md shadow-indigo-600/30" />
                  </div>
                </div>
              </div>

            </div>

            <div className="text-xs text-indigo-600 font-bold tracking-wider uppercase mt-8 animate-pulse">
              cutting operational noise & extracting signal
            </div>
          </div>
        )}

        {/* STAGE 3: RESULT */}
        {stage === 'result' && messages.length >= 2 && (
          <div className="relative z-10 space-y-6 animate-fadeIn">
            {/* User Question Details banner */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs md:text-sm text-slate-700 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 font-bold text-xs">Q</div>
              <div>
                <span className="font-bold text-slate-900 block">Inquiry:</span>
                <span>{question}</span>
                {messages[0]?.constraints && (
                  <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide font-semibold">
                    Constraints: {messages[0].constraints}
                  </div>
                )}
              </div>
            </div>

            {/* Verdict Card */}
            {(() => {
              const botReply = messages[1]?.text || 'No response content.';
              const parsed = parseReply(botReply);

              return (
                <>
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">FactoryIQ Operations Directive</span>
                      </div>
                      <span className={`text-xs font-bold tracking-wider px-2.5 py-0.5 rounded-full border uppercase ${confidenceStyle.class}`}>
                        {confidenceStyle.text} CONFIDENCE
                      </span>
                    </div>

                    <div className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans space-y-2 font-medium">
                      {botReply}
                    </div>

                    {/* Sources toggle and chips */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSourcesOpen((s) => !s)}
                        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {sourcesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        Sources (Active Engine)
                      </button>
                      <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                        {messages[1]?.source === 'groq' ? '✦ Groq AI Intelligence Engine' : '⚙ FactoryIQ Rule Engine (Fallback)'}
                      </span>
                    </div>
                    {sourcesOpen && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {messages[1]?.source === 'groq' ? (
                          <>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-xs text-slate-600 font-semibold border border-slate-200">
                              ✦ Groq Cloud LLM (openai/gpt-oss-120b)
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-xs text-slate-600 font-semibold border border-slate-200">
                              Live Telemetry Context Stream
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-xs text-slate-600 font-semibold border border-slate-200">
                              Production Line Domain Mapping
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-xs text-slate-600 font-semibold border border-slate-200">
                              ⚙ Deterministic Plant Rules Engine
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-xs text-slate-600 font-semibold border border-slate-200">
                              Telemetry Context Stream
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Telemetry metrics comparison table */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-500 tracking-wider uppercase block">Telemetry Context Check</span>
                    <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                              <th className="py-2.5 px-4">Telemetry Parameter</th>
                              <th className="py-2.5 px-4 text-center">Active Run Value</th>
                              <th className="py-2.5 px-4 text-center">Optimal Benchmark</th>
                              <th className="py-2.5 px-4 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {benchmarkRows.map((row) => (
                              <tr key={row.label} className="hover:bg-slate-50/70">
                                <td className="py-2.5 px-4 text-slate-700 font-mono text-xs">{row.label}</td>
                                <td className="py-2.5 px-4 text-center font-bold text-slate-900">{row.value}</td>
                                <td className="py-2.5 px-4 text-center text-slate-500 font-mono">{row.target}</td>
                                <td className="py-2.5 px-4 text-right">
                                  <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    row.status === 'Optimal' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' :
                                    row.status === 'Warning' ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                                    'text-rose-700 bg-rose-50 border border-rose-200'
                                  }`}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Follow-up Discussion Chat Stream */}
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <h3 className="text-xs font-bold text-slate-600 mb-4 tracking-wider uppercase flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      Follow-up Discussion
                    </h3>

                    {/* Chat log window */}
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-4 scroll-smooth">
                      {/* Sub-conversation logs */}
                      {messages.slice(2).map((msg, idx) => (
                        <div
                          key={msg.id || idx}
                          className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.sender === 'bot' && <BotAvatar size="sm" />}
                          <div
                            className={`max-w-[80%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm font-medium ${
                              msg.sender === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                            {msg.source && (
                              <div className="text-[9px] mt-2 text-right uppercase tracking-widest font-bold opacity-75">
                                via {msg.source === 'groq' ? '✦ Groq AI' : '⚙ Rule Engine'}
                              </div>
                            )}
                          </div>
                          {msg.sender === 'user' && (
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm text-xs font-bold">
                              {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                      ))}

                      {inlineLoading && (
                        <div className="flex items-start gap-3 justify-start">
                          <BotAvatar size="sm" />
                          <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                            <TypingDots />
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Chat follow-up input bar */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendFollowUp();
                      }}
                      className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-sm"
                    >
                      <input
                        type="text"
                        value={followUpInput}
                        onChange={(e) => setFollowUpInput(e.target.value)}
                        placeholder={`Ask follow-up questions about ${config.name.toLowerCase()} telemetry...`}
                        disabled={inlineLoading}
                        className="flex-1 bg-transparent px-3 py-2 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50 font-medium"
                      />
                      <button
                        type="submit"
                        disabled={inlineLoading || !followUpInput.trim()}
                        className={`px-4 py-2.5 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                          followUpInput.trim() && !inlineLoading
                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </form>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* STAGE 4: ERROR */}
        {stage === 'error' && (
          <div className="relative z-10 flex flex-col items-center text-center py-10 animate-fadeIn">
            <TriangleAlert size={40} className="text-rose-600 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900">Analysis Interrupted</h3>
            <p className="text-xs text-slate-600 mt-2 max-w-xs leading-relaxed font-medium">
              {errorMsg || 'Something went wrong while compiling the operational recommendation.'}
            </p>
            <div className="flex gap-3 w-full max-w-xs mt-6">
              <button
                onClick={() => handleRunAnalysis()}
                className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-md"
              >
                Try Again
              </button>
              <button
                onClick={reset}
                className="flex-1 py-3 bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-xl hover:bg-slate-200 transition-all border border-slate-200 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
