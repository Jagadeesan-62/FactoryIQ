export interface IndustryConfig {
  name: string;
  emoji: string;
  productionLineTerm: string;
  colors: {
    primary: string;       // primary button/accent classes
    primaryBg: string;     // bg color for badges/icons
    primaryText: string;   // text color for highlight
    gradient: string;      // card gradient classes
    border: string;        // border highlight class
    hex: string;           // raw primary color hex for Charts/PDFs
    glow: string;          // shadow/glow color
  };
  shades: Record<string, string>;
  labels: {
    production_time: string;
    machine_utilization: string;
    energy_consumption: string;
    material_usage: string;
    downtime: string;
    worker_count: string;
    defect_rate: string;
    maintenance_frequency: string;
    inventory_level: string;
  };
  description: string;
}

export const INDUSTRY_MAPPINGS: Record<string, IndustryConfig> = {
  '🚗 Automotive': {
    name: 'Automotive',
    emoji: '🚗',
    productionLineTerm: 'Assembly Line',
    colors: {
      primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30',
      primaryBg: 'bg-blue-50 dark:bg-blue-950/30',
      primaryText: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-600/20 via-transparent to-transparent',
      border: 'border-blue-500/20',
      hex: '#3B82F6',
      glow: 'shadow-blue-600/20',
    },
    shades: {
      '50': '#eff6ff',
      '100': '#dbeafe',
      '200': '#bfdbfe',
      '300': '#93c5fd',
      '400': '#60a5fa',
      '500': '#3b82f6',
      '600': '#2563eb',
      '700': '#1d4ed8',
      '800': '#1e40af',
      '900': '#1e3a8a',
      '950': '#172554',
    },
    labels: {
      production_time: 'Shift Duration (Hours)',
      machine_utilization: 'Robot Utilization (%)',
      energy_consumption: 'Power Consumption (kWh)',
      material_usage: 'Steel & Alloy Weight (kg)',
      downtime: 'Line Downtime (Hours)',
      worker_count: 'Assembly Operators',
      defect_rate: 'Weld/Parts Defect Rate (%)',
      maintenance_frequency: 'Robotic Calibration/Month',
      inventory_level: 'WIP Parts Inventory (Units)',
    },
    description: 'Optimize stamping presses, robotic welding stations, paint booths, and final assembly line checkpoints.',
  },
  '📱 Electronics': {
    name: 'Electronics',
    emoji: '📱',
    productionLineTerm: 'SMT Line',
    colors: {
      primary: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30',
      primaryBg: 'bg-cyan-50 dark:bg-cyan-950/30',
      primaryText: 'text-cyan-600 dark:text-cyan-400',
      gradient: 'from-cyan-600/20 via-transparent to-transparent',
      border: 'border-cyan-500/20',
      hex: '#06B6D4',
      glow: 'shadow-cyan-600/20',
    },
    shades: {
      '50': '#ecfeff',
      '100': '#cffafe',
      '200': '#a5f3fc',
      '300': '#67e8f9',
      '400': '#22d3ee',
      '500': '#06b6d4',
      '600': '#0891b2',
      '700': '#0e7490',
      '800': '#155e75',
      '900': '#164e63',
      '950': '#083344',
    },
    labels: {
      production_time: 'SMT Run Time (Hours)',
      machine_utilization: 'Pick & Place Duty Cycle (%)',
      energy_consumption: 'Cleanroom Power (kWh)',
      material_usage: 'Silicon & Solder Weight (kg)',
      downtime: 'Feeder Jam Downtime (Hours)',
      worker_count: 'Cleanroom Technicians',
      defect_rate: 'Component Defect Rate (%)',
      maintenance_frequency: 'Nozzle Calibration/Month',
      inventory_level: 'PCB & Component Stock (Units)',
    },
    description: 'Monitor pick-and-place precision, reflow oven temperature profiles, and cleanroom class environments.',
  },
  '💊 Pharmaceutical': {
    name: 'Pharmaceutical',
    emoji: '💊',
    productionLineTerm: 'Compounding & Batch Press',
    colors: {
      primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
      primaryBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      primaryText: 'text-emerald-600 dark:text-emerald-400',
      gradient: 'from-emerald-600/20 via-transparent to-transparent',
      border: 'border-emerald-500/20',
      hex: '#10B981',
      glow: 'shadow-emerald-600/20',
    },
    shades: {
      '50': '#ecfdf5',
      '100': '#d1fae5',
      '200': '#a7f3d0',
      '300': '#6ee7b7',
      '400': '#34d399',
      '500': '#10b981',
      '600': '#059669',
      '700': '#047857',
      '800': '#065f46',
      '900': '#064e3b',
      '950': '#022c22',
    },
    labels: {
      production_time: 'Batch Run Duration (Hours)',
      machine_utilization: 'Reactor/Press Utilization (%)',
      energy_consumption: 'Sterilization Power (kWh)',
      material_usage: 'Active Ingredients (API) (kg)',
      downtime: 'CIP/SIP Validation Downtime (Hours)',
      worker_count: 'QA & Lab Operators',
      defect_rate: 'Batch Deviation Rate (%)',
      maintenance_frequency: 'Autoclave Validation/Month',
      inventory_level: 'API & Excipient Stock (Units)',
    },
    description: 'Ensure FDA GMP compliance, tracking active ingredient batch assays, tablet compressions, and autoclave logs.',
  },
  '🍪 Food Processing': {
    name: 'Food Processing',
    emoji: '🍪',
    productionLineTerm: 'Baking & Packaging Line',
    colors: {
      primary: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
      primaryBg: 'bg-amber-50 dark:bg-amber-950/30',
      primaryText: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-600/20 via-transparent to-transparent',
      border: 'border-amber-500/20',
      hex: '#F59E0B',
      glow: 'shadow-amber-600/20',
    },
    shades: {
      '50': '#fffbeb',
      '100': '#fef3c7',
      '200': '#fde68a',
      '300': '#fcd34d',
      '400': '#fbbf24',
      '500': '#f59e0b',
      '600': '#d97706',
      '700': '#b45309',
      '800': '#92400e',
      '900': '#78350f',
      '950': '#451a03',
    },
    labels: {
      production_time: 'Oven/Line Run Time (Hours)',
      machine_utilization: 'Mixer & Extruder Capacity (%)',
      energy_consumption: 'Oven/Cooler Energy (kWh)',
      material_usage: 'Raw Ingredients Weight (kg)',
      downtime: 'Washdown/Sanitation Downtime (Hours)',
      worker_count: 'Sanitation & Line Operators',
      defect_rate: 'Food Spoilage/Reject Rate (%)',
      maintenance_frequency: 'Oven Calibration/Month',
      inventory_level: 'Ingredient Silo Stock (Units)',
    },
    description: 'Track HACCP safety controls, washdown sanitations, dough mixer capacities, and heating cycles.',
  },
  '🧵 Textile': {
    name: 'Textile',
    emoji: '🧵',
    productionLineTerm: 'Weaving & Loom Line',
    colors: {
      primary: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30',
      primaryBg: 'bg-purple-50 dark:bg-purple-950/30',
      primaryText: 'text-purple-600 dark:text-purple-400',
      gradient: 'from-purple-600/20 via-transparent to-transparent',
      border: 'border-purple-500/20',
      hex: '#8B5CF6',
      glow: 'shadow-purple-600/20',
    },
    shades: {
      '50': '#f5f3ff',
      '100': '#ede9fe',
      '200': '#ddd6fe',
      '300': '#c4b5fd',
      '400': '#a78bfa',
      '500': '#8b5cf6',
      '600': '#7c3aed',
      '700': '#6d28d9',
      '800': '#5b21b6',
      '900': '#4c1d95',
      '950': '#2e1065',
    },
    labels: {
      production_time: 'Loom Run Time (Hours)',
      machine_utilization: 'Loom Operating Duty (%)',
      energy_consumption: 'Spindle Power (kWh)',
      material_usage: 'Yarn & Fiber Weight (kg)',
      downtime: 'Thread Breakage Downtime (Hours)',
      worker_count: 'Loom Operators',
      defect_rate: 'Fabric Defect/Breakage Rate (%)',
      maintenance_frequency: 'Loom Lubrication/Month',
      inventory_level: 'Fabric Roll Inventory (Units)',
    },
    description: 'Optimize high-speed spindle speeds, loom tension controls, automated weaving, and yarn defect inspections.',
  },
  '🧴 Cosmetics': {
    name: 'Cosmetics',
    emoji: '🧴',
    productionLineTerm: 'Filling & Packaging Line',
    colors: {
      primary: 'bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/30',
      primaryBg: 'bg-pink-50 dark:bg-pink-950/30',
      primaryText: 'text-pink-600 dark:text-pink-400',
      gradient: 'from-pink-600/20 via-transparent to-transparent',
      border: 'border-pink-500/20',
      hex: '#EC4899',
      glow: 'shadow-pink-600/20',
    },
    shades: {
      '50': '#fdf2f8',
      '100': '#fce7f3',
      '200': '#fbcfe8',
      '300': '#f9a8d4',
      '400': '#f472b6',
      '500': '#ec4899',
      '600': '#db2777',
      '700': '#be185d',
      '800': '#9d174d',
      '900': '#831843',
      '950': '#500724',
    },
    labels: {
      production_time: 'Filling Line Run Time (Hours)',
      machine_utilization: 'Homogenizer/Filler Duty (%)',
      energy_consumption: 'Filling Power (kWh)',
      material_usage: 'Bulk Formula Weight (kg)',
      downtime: 'Nozzle Cleaning Downtime (Hours)',
      worker_count: 'Filling Line Operators',
      defect_rate: 'Bottle/Fill Reject Rate (%)',
      maintenance_frequency: 'Filler Calibration/Month',
      inventory_level: 'Vial & Bottle Inventory (Units)',
    },
    description: 'Control homogenizer emulsion batches, nozzle extrusion consistency, capping torque, and bottling lines.',
  },
};

export function getIndustryConfig(industryName: string | null | undefined): IndustryConfig {
  if (!industryName || !INDUSTRY_MAPPINGS[industryName]) {
    // Try to find by name match
    for (const key of Object.keys(INDUSTRY_MAPPINGS)) {
      if (INDUSTRY_MAPPINGS[key].name === industryName) {
        return INDUSTRY_MAPPINGS[key];
      }
    }
    return INDUSTRY_MAPPINGS['🚗 Automotive'];
  }
  return INDUSTRY_MAPPINGS[industryName];
}

export function applyIndustryTheme(industryName: string | null | undefined) {
  const config = getIndustryConfig(industryName);
  const shades = config.shades;
  if (!shades) return;
  Object.keys(shades).forEach((key) => {
    document.documentElement.style.setProperty(`--color-primary-${key}`, shades[key]);
  });
}
