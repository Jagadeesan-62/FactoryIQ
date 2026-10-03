import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Download, FileText, Calendar, Activity, CheckCircle2, 
  ArrowRight, Search, Sliders, Sparkles, Filter, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIndustryConfig } from '../config/industryMapping';

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

const HistoryPage = () => {
  const { user } = useAuth();
  const config = getIndustryConfig(user?.industry);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDownloadPDF = async (predictionId: number) => {
    try {
      const response = await api.get(`/reports/${predictionId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FactoryIQ_AI_Report_${predictionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF report');
    }
  };

  const filteredHistory = history.filter(item => 
    item.prediction.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{config.emoji}</span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
              Audit Logs & Telemetry Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {config.name} Run History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Audit-ready archive of evaluated runs, confidence ratings, and downloadable reports.
          </p>
        </div>

        <Link
          to="/predict"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 text-xs transition-all w-fit cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          <span>New Prediction</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold">Loading production logs...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-500 space-y-4 rounded-3xl border border-slate-200 shadow-sm">
          <Activity className="w-12 h-12 mx-auto opacity-30 text-indigo-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">No Evaluation Logs Recorded</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Run your first production prediction to start building your historical telemetry analytics.
            </p>
          </div>
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md"
          >
            <span>Run First Prediction</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Search bar & filter summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search run ID or classification..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
              />
            </div>
            <div className="text-xs font-mono text-slate-500">
              Showing <span className="font-bold text-slate-900">{filteredHistory.length}</span> of {history.length} logged runs
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Run ID & Timestamp</th>
                    <th className="py-4 px-6">Classification Outcome</th>
                    <th className="py-4 px-6 text-center">Confidence</th>
                    <th className="py-4 px-6 text-center">{config.labels.machine_utilization.replace(' (%)', '')}</th>
                    <th className="py-4 px-6 text-center">{config.labels.downtime.replace(' (Hours)', '')}</th>
                    <th className="py-4 px-6 text-center">{config.labels.defect_rate.replace(' (%)', '')}</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 font-mono text-sm">#{item.id}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          item.prediction === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          item.prediction === 'High' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          item.prediction === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {item.prediction}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-800 font-mono">
                        {item.confidence ? `${item.confidence.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-center text-slate-700 font-mono">{item.machine_utilization}%</td>
                      <td className="py-4 px-6 text-center text-slate-700 font-mono">{item.downtime}h</td>
                      <td className="py-4 px-6 text-center text-slate-700 font-mono">{item.defect_rate}%</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDownloadPDF(item.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Export</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HistoryPage;
