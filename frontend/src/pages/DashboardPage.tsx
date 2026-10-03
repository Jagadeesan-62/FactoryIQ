import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Activity, Award, FileText, History, PlusCircle, TrendingUp, 
  AlertTriangle, ArrowUpRight, Sparkles, Sliders, MessageSquare, 
  Layers, Clock, ShieldCheck, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getIndustryConfig } from '../config/industryMapping';
import { FactoryVisual } from '../components/FactoryVisual';

interface HistoryItem {
  id: number;
  prediction: string;
  confidence: number | null;
  machine_utilization: number;
  defect_rate: number;
  downtime: number;
  created_at: string;
  has_report: boolean;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const config = getIndustryConfig(user?.industry);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/history');
        setHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalPredictions = history.length;
  const reportsGenerated = history.filter(h => h.has_report).length;
  const optimalRuns = history.filter(h => h.prediction === 'Optimal' || h.prediction === 'High').length;
  const optimalRate = totalPredictions > 0 ? ((optimalRuns / totalPredictions) * 100).toFixed(0) : '0';

  // Chart data: Distribution of predictions
  const predCounts: Record<string, number> = { Optimal: 0, High: 0, Moderate: 0, Low: 0 };
  history.forEach(h => {
    if (predCounts[h.prediction] !== undefined) {
      predCounts[h.prediction]++;
    }
  });

  const chartData = [
    { name: 'Optimal', count: predCounts['Optimal'], fill: '#10b981' },
    { name: 'High', count: predCounts['High'], fill: '#4f46e5' },
    { name: 'Moderate', count: predCounts['Moderate'], fill: '#f59e0b' },
    { name: 'Low', count: predCounts['Low'], fill: '#ef4444' },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{config.emoji}</span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
              {config.name} Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {config.name} Operations Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Active telemetry monitoring, AI efficiency evaluations, and {config.productionLineTerm.toLowerCase()} diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 text-xs transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Prediction</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Runs */}
        <div className="bg-white p-5 rounded-2xl relative overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Evaluated Runs</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-heading">{totalPredictions}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Full Audit Logs Active</span>
            </div>
          </div>
        </div>

        {/* Optimal Yield Rate */}
        <div className="bg-white p-5 rounded-2xl relative overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Optimal Yield Rate</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-heading">{optimalRate}%</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
              <span>{optimalRuns} Runs in High/Optimal Band</span>
            </div>
          </div>
        </div>

        {/* AI Reports */}
        <div className="bg-white p-5 rounded-2xl relative overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generated AI Reports</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-heading">{reportsGenerated}</div>
            <div className="flex items-center gap-1 text-xs text-sky-600 font-semibold mt-1">
              <span>Audit PDF Export Ready</span>
            </div>
          </div>
        </div>

        {/* ML Inference Model */}
        <div className="bg-white p-5 rounded-2xl relative overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inference Engine</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 font-heading">Groq + Scikit</div>
            <div className="flex items-center gap-1 text-xs text-purple-600 font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>Edge Model Operational</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Efficiency Distribution Chart (7 cols) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">Efficiency Classification Spectrum</h3>
                <p className="text-xs text-slate-500">Distribution of historical prediction runs across efficiency bands</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-600">
                TOTAL: {totalPredictions}
              </span>
            </div>

            {totalPredictions > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderColor: '#e2e8f0', 
                        color: '#0f172a', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(15,23,42,0.1)'
                      }}
                      formatter={(value) => [`${value} Runs`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <Activity className="w-10 h-10 mb-2 opacity-40 text-slate-400" />
                <p className="text-xs">No prediction records available. Click "New Prediction" above to log your first run.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100 text-center text-xs">
            <div>
              <span className="text-emerald-600 font-bold block text-sm">{predCounts['Optimal']}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Optimal</span>
            </div>
            <div>
              <span className="text-indigo-600 font-bold block text-sm">{predCounts['High']}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">High</span>
            </div>
            <div>
              <span className="text-amber-600 font-bold block text-sm">{predCounts['Moderate']}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Moderate</span>
            </div>
            <div>
              <span className="text-rose-600 font-bold block text-sm">{predCounts['Low']}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Low</span>
            </div>
          </div>
        </div>

        {/* Live Factory Simulation Graphic (5 cols) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-base font-bold text-slate-900 font-heading">{config.productionLineTerm} Dynamics</h3>
              </div>
              <span className="text-xs text-indigo-600 font-bold font-mono">SECTOR: {config.name}</span>
            </div>
            <div className="py-2 flex items-center justify-center min-h-[190px]">
              <FactoryVisual industry={user?.industry} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Need parameter guidance?</span>
            <Link to="/chat" className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
              <span>Ask Plant Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Runs Table Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">Recent Production Evaluations</h3>
            <p className="text-xs text-slate-500">Latest run telemetry, efficiency scores, and audit reports</p>
          </div>
          <Link 
            to="/history" 
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span>View All Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {history.slice(0, 5).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">Run ID & Timestamp</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-center">Confidence</th>
                  <th className="py-3 px-4 text-center">{config.labels.machine_utilization.replace(' (%)', '')}</th>
                  <th className="py-3 px-4 text-center">{config.labels.downtime.replace(' (Hours)', '')}</th>
                  <th className="py-3 px-4 text-center rounded-r-xl">{config.labels.defect_rate.replace(' (%)', '')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {history.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 font-mono">#{item.id}</span>
                      <span className="text-[11px] text-slate-500 block">{new Date(item.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        item.prediction === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.prediction === 'High' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        item.prediction === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.prediction}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                      {item.confidence ? `${item.confidence.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-700 font-mono">{item.machine_utilization}%</td>
                    <td className="py-3.5 px-4 text-center text-slate-700 font-mono">{item.downtime}h</td>
                    <td className="py-3.5 px-4 text-center text-slate-700 font-mono">{item.defect_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No prediction logs found. Click "New Prediction" above to log your first run.
          </div>
        )}
      </div>

    </div>
  );
};

export default DashboardPage;
