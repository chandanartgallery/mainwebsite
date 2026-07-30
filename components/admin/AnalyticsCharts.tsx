'use client';

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';

interface AnalyticsChartsProps {
  trafficData: { date: string; views: number; clicks: number }[];
  deviceData:  { name: string; value: number }[];
  topSearches: { query: string; count: number }[];
}

const GOLD    = '#b99a64';
const BLUE    = '#6ea8cc';
const GREEN   = '#5cad8a';
const MUTED   = '#4a3f35';
const PIE_COLORS = [GOLD, BLUE, GREEN, '#c07850', '#9a7db8'];

// Shared tooltip style — always dark so it's readable on the dark chart bg
const tooltipStyle = {
  backgroundColor: '#1a1612',
  border: '1px solid rgba(185,154,100,0.25)',
  borderRadius: '8px',
  color: '#e8ddd0',
  fontSize: '11px',
  padding: '8px 12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
};

const labelStyle = { color: '#b99a64', fontWeight: 700, fontSize: 11 };

export default function AnalyticsCharts({ trafficData, deviceData, topSearches }: AnalyticsChartsProps) {
  const hasTraffic = trafficData.some(d => d.views > 0 || d.clicks > 0);
  const hasDevices = deviceData.length > 0 && deviceData.some(d => d.value > 0);

  return (
    <div className="space-y-5">

      {/* ── Row 1: Area chart + Pie chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Traffic area chart */}
        <div className="adm-chart-container lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#7a6a56]">Daily Traffic</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[0.62rem] text-[#7a6a56]">
                <span className="w-3 h-0.5 rounded bg-[#b99a64] inline-block" />Page Views
              </span>
              <span className="flex items-center gap-1.5 text-[0.62rem] text-[#7a6a56]">
                <span className="w-3 h-0.5 rounded bg-[#6ea8cc] inline-block" />WhatsApp Clicks
              </span>
            </div>
          </div>

          {!hasTraffic ? (
            <div className="h-48 flex items-center justify-center text-[0.75rem] text-[#4a3f35] italic">
              No traffic events recorded yet.
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={GOLD} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={BLUE} stopOpacity={0.22} />
                      <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(185,154,100,0.07)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke={MUTED} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#6a5a48' }} />
                  <YAxis stroke={MUTED} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#6a5a48' }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} itemStyle={{ color: '#c8b48c' }} />
                  <Area type="monotone" dataKey="views"  stroke={GOLD} strokeWidth={2} fill="url(#gViews)"  name="Page Views" dot={false} activeDot={{ r: 4, fill: GOLD }} />
                  <Area type="monotone" dataKey="clicks" stroke={BLUE} strokeWidth={2} fill="url(#gClicks)" name="WA Clicks"  dot={false} activeDot={{ r: 4, fill: BLUE }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Device pie chart */}
        <div className="adm-chart-container flex flex-col">
          <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#7a6a56] mb-4">Device Split</p>

          {!hasDevices ? (
            <div className="flex-1 flex items-center justify-center text-[0.75rem] text-[#4a3f35] italic">
              No device data yet.
            </div>
          ) : (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%"
                      innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value"
                      stroke="none"
                    >
                      {deviceData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#c8b48c' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-1.5">
                {deviceData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-[0.65rem]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[#9a8a76]">{d.name}</span>
                    </div>
                    <span className="font-bold text-[#b99a64]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 2: Top searches bar chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bar chart */}
        <div className="adm-chart-container">
          <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#7a6a56] mb-4">Top Search Queries</p>
          {topSearches.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-[0.75rem] text-[#4a3f35] italic">
              No search queries recorded yet.
            </div>
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSearches} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(185,154,100,0.07)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke={MUTED} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#6a5a48' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="query" stroke={MUTED} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#9a8a76' }} width={90} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} itemStyle={{ color: '#c8b48c' }} />
                  <Bar dataKey="count" name="Searches" radius={[0, 4, 4, 0]}>
                    {topSearches.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? GOLD : `rgba(185,154,100,${0.65 - i * 0.1})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Event type breakdown */}
        <div className="adm-chart-container">
          <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#7a6a56] mb-4">Traffic Breakdown</p>
          {trafficData.every(d => d.views === 0 && d.clicks === 0) ? (
            <div className="h-32 flex items-center justify-center text-[0.75rem] text-[#4a3f35] italic">
              No events recorded yet.
            </div>
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(185,154,100,0.07)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke={MUTED} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#6a5a48' }} />
                  <YAxis stroke={MUTED} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#6a5a48' }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} itemStyle={{ color: '#c8b48c' }} />
                  <Bar dataKey="views"  name="Page Views"  fill={GOLD}  radius={[3,3,0,0]} maxBarSize={20} />
                  <Bar dataKey="clicks" name="WA Clicks"   fill={BLUE}  radius={[3,3,0,0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
