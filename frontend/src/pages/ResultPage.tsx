import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Download, Bot, Award, ArrowLeft, CheckCircle2, AlertTriangle, Activity,
  Zap, ShieldAlert, Sparkles, TrendingUp, Cpu, FileText, ArrowRight,
  Sliders, MessageSquare, Check, ArrowUpRight, Gauge, Wrench, Clock, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getIndustryConfig } from '../config/industryMapping';

const ResultPage = () => {
  const { user } = useAuth();
  const config = getIndustryConfig(user?.industry);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { prediction: any; inputs: any } | null;

  if (!state || !state.prediction) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-slate-900">No Prediction Result Available</h2>
        <p className="text-slate-600 mt-2 mb-6">Please run a prediction first to view the detailed results.</p>
        <Link to="/predict" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md">
          Go to Predict Form
        </Link>
      </div>
    );
  }

  const { prediction, inputs: rawInputs } = state;
  const inputs = rawInputs || {
    production_time: prediction.production_time || 8.0,
    machine_utilization: prediction.machine_utilization || 85.0,
    energy_consumption: prediction.energy_consumption || 450.0,
    material_usage: prediction.material_usage || 300.0,
    downtime: prediction.downtime || 1.0,
    worker_count: prediction.worker_count || 10,
    defect_rate: prediction.defect_rate || 1.5,
    maintenance_frequency: prediction.maintenance_frequency || 1,
    inventory_level: prediction.inventory_level || 400,
  };

  const predClass = prediction.prediction || 'Unknown';
  const confidence = prediction.confidence || 0;
  const reportText = prediction.report || 'No detailed report content generated.';

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/reports/${prediction.id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FactoryIQ_AI_Report_${prediction.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF report');
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Optimal':
        return 'bg-emerald-600 text-white shadow-emerald-600/30';
      case 'High':
        return 'bg-indigo-600 text-white shadow-indigo-600/30';
      case 'Moderate':
        return 'bg-amber-500 text-white shadow-amber-500/30';
      default:
        return 'bg-rose-600 text-white shadow-rose-600/30';
    }
  };

  // Parameter Optimization Calculations
  const util = Number(inputs.machine_utilization) || 0;
  const downtime = Number(inputs.downtime) || 0;
  const defect = Number(inputs.defect_rate) || 0;
  const energy = Number(inputs.energy_consumption) || 0;
  const maint = Number(inputs.maintenance_frequency) || 0;
  const workers = Number(inputs.worker_count) || 0;

  const optimizationMatrix = [
    {
      parameter: config.labels.machine_utilization,
      current: `${util.toFixed(1)}%`,
      target: '≥ 90.0%',
      targetVal: 90.0,
      delta: util >= 90 ? 'Aligned' : `+${(90.0 - util).toFixed(1)}%`,
      status: util >= 90 ? 'Optimal' : util >= 80 ? 'Near Target' : 'Action Required',
      statusColor: util >= 90 ? 'emerald' : util >= 80 ? 'amber' : 'rose',
      impact: 'Very High (+38% Impact)',
      actionPlan: 'Optimize robot motion trajectories, eliminate buffer starvation, and synchronize station takt times.'
    },
    {
      parameter: config.labels.downtime,
      current: `${downtime.toFixed(1)} hrs`,
      target: '≤ 0.8 hrs',
      targetVal: 0.8,
      delta: downtime <= 0.8 ? 'Aligned' : `-${(downtime - 0.8).toFixed(1)} hrs`,
      status: downtime <= 0.8 ? 'Optimal' : downtime <= 1.5 ? 'Moderate' : 'Critical Bottleneck',
      statusColor: downtime <= 0.8 ? 'emerald' : downtime <= 1.5 ? 'amber' : 'rose',
      impact: 'High (-29% Penalty)',
      actionPlan: 'Deploy SMED quick changeover checklists (< 15 min) and condition-based predictive motor vibration alerts.'
    },
    {
      parameter: config.labels.defect_rate,
      current: `${defect.toFixed(2)}%`,
      target: '≤ 1.20%',
      targetVal: 1.0,
      delta: defect <= 1.2 ? 'Aligned' : `-${(defect - 1.2).toFixed(2)}%`,
      status: defect <= 1.2 ? 'Optimal' : defect <= 3.0 ? 'Acceptable' : 'Quality Risk',
      statusColor: defect <= 1.2 ? 'emerald' : defect <= 3.0 ? 'amber' : 'rose',
      impact: 'High (-18% Penalty)',
      actionPlan: 'Install in-line machine vision inspection gates and automated tool tip dressing / calibration.'
    },
    {
      parameter: config.labels.energy_consumption,
      current: `${energy.toFixed(0)} kWh`,
      target: '≤ 480 kWh',
      targetVal: 450,
      delta: energy <= 480 ? 'Aligned' : `-${(energy - 480).toFixed(0)} kWh`,
      status: energy <= 480 ? 'Optimal' : 'Elevated',
      statusColor: energy <= 480 ? 'emerald' : 'amber',
      impact: 'Medium Cost Driver',
      actionPlan: 'Enable automatic eco-standby on idle robotic drives and stagger heavy startup loads.'
    },
    {
      parameter: config.labels.maintenance_frequency,
      current: `${maint} events`,
      target: '1 - 2 events',
      targetVal: 2,
      delta: maint <= 2 ? 'Aligned' : `-${maint - 2} events`,
      status: maint <= 2 ? 'Optimal' : 'Over-Servicing / Reactive',
      statusColor: maint <= 2 ? 'emerald' : 'amber',
      impact: 'Medium Throughput Impact',
      actionPlan: 'Shift from reactive break-fix repairs to scheduled preventive maintenance during shift turnovers.'
    }
  ];

  // Parse report string into sections
  const parseReport = (text: string) => {
    const sections: { title: string; content: string }[] = [];
    const lines = text.split('\n');
    let currentSection: { title: string; content: string } | null = null;

    const knownHeaders = [
      "Production Summary",
      "Prediction",
      "Confidence",
      "Key Factors",
      "Production Insights",
      "Risk Analysis",
      "Energy Analysis",
      `${config.labels.machine_utilization.replace(' (%)', '')} Analysis`,
      "Recommendations",
      "Conclusion"
    ];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const matchedHeader = knownHeaders.find(h => 
        trimmed.toLowerCase() === h.toLowerCase() || 
        trimmed.toLowerCase() === (h + ':').toLowerCase() ||
        trimmed.toLowerCase().startsWith(h.toLowerCase() + ':') ||
        trimmed.toLowerCase().startsWith('**' + h.toLowerCase() + '**')
      );

      if (matchedHeader) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { title: matchedHeader, content: '' };
      } else {
        if (currentSection) {
          currentSection.content += (currentSection.content ? ' ' : '') + trimmed;
        } else {
          currentSection = { title: 'Overview', content: trimmed };
        }
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  const reportSections = parseReport(reportText);

  // Map section title to color/icon
  const getSectionMeta = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('risk')) return { icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (t.includes('energy')) return { icon: Zap, color: 'text-sky-600 bg-sky-50 border-sky-200' };
    if (t.includes('recommendation') || t.includes('insight')) return { icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (t.includes('utilization') || t.includes('machine')) return { icon: Cpu, color: 'text-purple-600 bg-purple-50 border-purple-200' };
    if (t.includes('factor')) return { icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    return { icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link to="/predict" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>New Prediction</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Main Result Header Card */}
      <div className="p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl rounded-3xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none" />
        
        <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
          <div>
            <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-300">FactoryIQ AI Model Outcome</span>
            <div className="flex items-center gap-4 mt-3">
              <span className={`px-6 py-2.5 rounded-2xl text-2xl font-black shadow-lg ${getCategoryBadge(predClass)}`}>
                {predClass} Efficiency
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-4 leading-relaxed font-normal">
              Real-time classification based on {config.name.toLowerCase()} {config.productionLineTerm.toLowerCase()} telemetry parameters.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-200">Model Confidence</span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-4xl font-black text-white mb-2">{confidence.toFixed(1)}%</div>
            <div className="w-full bg-slate-700/60 h-2.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400 h-full transition-all duration-500 rounded-full" style={{ width: `${confidence}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-3 text-[11px] text-slate-300 font-medium">
              <span>Target Benchmark: Optimal (≥ 90%)</span>
              <span className={confidence >= 85 ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                {confidence >= 85 ? 'High Certainty' : 'Calibration Recommended'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: METHODS TO IMPROVE PRODUCTION EFFICIENCY & PARAMETER CALIBRATION */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">
                Methods to Improve Production Efficiency
              </h3>
              <p className="text-xs md:text-sm text-slate-600">
                Actionable parameter calibration roadmap to elevate your line to <strong className="text-emerald-700 font-bold">Optimal Efficiency</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/chat"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition-colors shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Plant Advisor</span>
            </Link>
          </div>
        </div>

        {/* Parameter Optimization Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Target Parameter Calibration Matrix
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Calculated for {config.name} {config.productionLineTerm}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Operational Parameter</th>
                  <th className="py-3 px-4 text-center">Current Run</th>
                  <th className="py-3 px-4 text-center">Optimal Target</th>
                  <th className="py-3 px-4 text-center">Calibration Required</th>
                  <th className="py-3 px-4">Implementation Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {optimizationMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div>{item.parameter}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{item.impact}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 font-mono">
                      {item.current}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700 font-mono">
                      {item.target}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        item.statusColor === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.statusColor === 'amber'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.delta}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs leading-relaxed">
                      {item.actionPlan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3-Step Implementation Execution Plan */}
        <div className="grid md:grid-cols-3 gap-4 pt-2">
          
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Phase 1: Immediate (0-24h)</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">
                Rapid SMED & Line Balancing
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Pre-stage tooling and fixtures to compress changeovers below 15 mins.</li>
                <li>Smooth robot trajectories to eliminate idle dwell times.</li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-emerald-700">
              Expected Gain: +5% to +8% Utilization
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
                <Wrench className="w-4 h-4" />
                <span>Phase 2: Process Control (1-2 Wks)</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">
                Quality Gating & Predictive Alerts
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Activate in-line vision cameras to catch defects at sub-assembly gates.</li>
                <li>Set automated threshold warnings on motor drive temperatures.</li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-emerald-700">
              Expected Gain: Scrap Rate &lt; 1.2%
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>Phase 3: Continuous Lean (30+ Days)</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">
                Energy Shaving & Workforce OEE
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Enable auto-standby power cutting during station line pauses.</li>
                <li>Cross-train operators across adjacent welding & assembly cells.</li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-emerald-700">
              Expected Gain: Stable Optimal Classification
            </div>
          </div>

        </div>

      </div>

      {/* Feature Importance Driver Impact */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">ML Feature Importance Weights</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-bold uppercase">{config.labels.machine_utilization.replace(' (%)', '')}</p>
            <p className="text-sm font-bold text-emerald-700 mt-1">High Positive Impact (+38%)</p>
            <p className="text-xs text-slate-500 mt-1">Highest driver for Optimal classification.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-bold uppercase">{config.labels.downtime.replace(' (Hours)', '')}</p>
            <p className="text-sm font-bold text-rose-700 mt-1">High Negative Impact (-29%)</p>
            <p className="text-xs text-slate-500 mt-1">Unplanned stops degrade efficiency fast.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-bold uppercase">{config.labels.defect_rate.replace(' (%)', '')}</p>
            <p className="text-sm font-bold text-amber-700 mt-1">Moderate Negative Impact (-18%)</p>
            <p className="text-xs text-slate-500 mt-1">Quality scrap limits max efficiency.</p>
          </div>
        </div>
      </div>

      {/* Generated AI Report */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Operations Analysis Dashboard</h3>
            <p className="text-xs text-slate-500">Automated FactoryIQ AI & Rule Engine Insights</p>
          </div>
        </div>

        {/* Structured Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportSections.map((section, idx) => {
            const meta = getSectionMeta(section.title);
            const Icon = meta.icon;
            // Span full width for specific sections
            const isFullWidth = section.title.toLowerCase().includes('summary') || 
                               section.title.toLowerCase().includes('recommendation') ||
                               section.title.toLowerCase().includes('conclusion');

            return (
              <div 
                key={idx} 
                className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isFullWidth ? 'md:col-span-2' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.color.split(' ')[1]}`}>
                      <Icon className={`w-4 h-4 ${meta.color.split(' ')[0]}`} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{section.title}</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {section.content.replace(/\[Generated by local fallback.*\]/i, '').replace(/\[Generated by FactoryIQ Rule Engine.*\]/i, '').trim()}
                  </p>
                </div>
                
                {/* Fallback label indicator if generated locally */}
                {section.content.includes('[Generated by') && (
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-4">
                    Source: FactoryIQ Rule Engine
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
