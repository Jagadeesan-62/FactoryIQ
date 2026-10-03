import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Activity, AlertCircle, ArrowRight, RotateCcw, Zap, Cpu, 
  Layers, Users, Wrench, Package, Sparkles, Sliders, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getIndustryConfig } from '../config/industryMapping';

const PredictionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const config = getIndustryConfig(user?.industry);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    production_time: 8.0,
    machine_utilization: 85.0,
    energy_consumption: 450.0,
    material_usage: 300.0,
    downtime: 1.0,
    worker_count: 25.0,
    defect_rate: 1.5,
    maintenance_frequency: 4.0,
    inventory_level: 500.0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleReset = () => {
    setFormData({
      production_time: 8.0,
      machine_utilization: 85.0,
      energy_consumption: 450.0,
      material_usage: 300.0,
      downtime: 1.0,
      worker_count: 25.0,
      defect_rate: 1.5,
      maintenance_frequency: 4.0,
      inventory_level: 500.0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.downtime > formData.production_time) {
      setError('Downtime cannot exceed Production Time');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/predict', formData);
      navigate('/result', { state: { prediction: response.data, inputs: formData } });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{config.emoji}</span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
              Machine Learning Evaluation Deck
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {config.name} Efficiency Prediction
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Input operational {config.name.toLowerCase()} telemetry to classify performance and generate AI recommendations.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* PANEL 1: Line Dynamics & Energy */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Line Dynamics & Energy Baseline</h3>
              <p className="text-xs text-slate-500">Shift duration, machine drive utilization, and power consumption</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {config.labels.production_time}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="24"
                  name="production_time"
                  value={formData.production_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">hrs</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {config.labels.machine_utilization}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  name="machine_utilization"
                  value={formData.machine_utilization}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {config.labels.energy_consumption}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  name="energy_consumption"
                  value={formData.energy_consumption}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">kWh</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2: Material Usage & Quality Yield */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Material & Quality Yield Gating</h3>
              <p className="text-xs text-slate-500">Raw feedstock volume, scrap rejection rates, and buffer inventory</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {config.labels.material_usage}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  name="material_usage"
                  value={formData.material_usage}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">units</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {config.labels.defect_rate}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  name="defect_rate"
                  value={formData.defect_rate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {config.labels.inventory_level}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="inventory_level"
                  value={formData.inventory_level}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">units</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: Staffing & Maintenance Dynamics */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Maintenance & Crew Manning Dynamics</h3>
              <p className="text-xs text-slate-500">Line downtime, operator staffing headcount, and calibration cadence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {config.labels.downtime}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  name="downtime"
                  value={formData.downtime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">hrs</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {config.labels.worker_count}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  name="worker_count"
                  value={formData.worker_count}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">staff</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {config.labels.maintenance_frequency}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="maintenance_frequency"
                  value={formData.maintenance_frequency}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">events</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-3 text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer rounded-xl hover:bg-slate-100"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Baseline</span>
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 text-sm cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>{loading ? 'Evaluating Scikit-Learn Engine...' : 'Run Efficiency Prediction'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default PredictionPage;
