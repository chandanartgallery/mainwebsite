'use client';

import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

interface AnalyticsChartsProps {
  trafficData: any[];
  deviceData: any[];
  topSearches: any[];
}

export default function AnalyticsCharts({ trafficData, deviceData, topSearches }: AnalyticsChartsProps) {
  // Brand colors
  const COLORS = ['#b99a64', '#513723', '#211d19', '#8d7046', '#d8ccb8'];

  return (
    <div className="space-y-8 select-none">
      {/* Upper Grid: Traffic Curve & Search terms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Views Area Chart */}
        <div className="commerce-surface p-6 lg:col-span-2">
          <h4 className="font-serif text-base text-luxury-black dark:text-white mb-6 uppercase tracking-wider">
            Daily Traffic Overview
          </h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5a880" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#c5a880" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121212', 
                    borderRadius: '12px', 
                    border: '1px solid #c5a880',
                    color: '#faf8f5',
                    fontSize: '11px'
                  }} 
                />
                <Area type="monotone" dataKey="views" stroke="#c5a880" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" name="Page Views" />
                <Area type="monotone" dataKey="clicks" stroke="#4b3621" strokeWidth={2} fillOpacity={0} name="WhatsApp Clicks" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown Pie Chart */}
        <div className="commerce-surface p-6">
          <h4 className="font-serif text-base text-luxury-black dark:text-white mb-6 uppercase tracking-wider">
            Device Distribution
          </h4>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121212', 
                    borderRadius: '8px', 
                    border: 'none', 
                    color: '#faf8f5',
                    fontSize: '11px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend indicator */}
          <div className="flex flex-wrap justify-center gap-4 text-[10px] uppercase tracking-wider text-gray-400 mt-2">
            {deviceData.map((d, index) => (
              <div key={d.name} className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-sm mr-1.5" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Search Queries */}
      <div className="commerce-surface max-w-xl p-6">
        <h4 className="font-serif text-base text-luxury-black dark:text-white mb-4 uppercase tracking-wider">
          Top Customer Search Queries
        </h4>
        <div className="space-y-3">
          {topSearches.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No search events recorded.</p>
          ) : (
            topSearches.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs border-b border-gray-50 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                <span className="font-semibold text-luxury-charcoal dark:text-white flex items-center">
                  <span className="text-luxury-gold mr-2 font-serif font-bold">#{idx + 1}</span>
                  {item.query}
                </span>
                <span className="bg-luxury-gold/15 text-luxury-gold-dark text-[10px] font-bold px-2 py-0.5 rounded-[12px]">
                  {item.count} searches
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
