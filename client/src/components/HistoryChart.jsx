import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
    '#38bdf8', // Sky
    '#a78bfa', // Purple
    '#34d399', // Emerald
    '#f472b6', // Pink
    '#fbbf24', // Amber
    '#f87171', // Red
];

const HistoryChart = ({ history, accounts }) => {
    if (!history || history.length === 0) {
        return (
            <div className="glass-panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="text-secondary text-lg">No historical data available yet. Start tracking your wealth by updating balances!</p>
            </div>
        );
    }

    // Get unique account IDs from history to create areas
    const accountIds = Array.from(new Set(
        history.flatMap(entry => Object.keys(entry.accounts || {}))
    ));

    // Map account IDs to names for labeling
    const accountNames = {};
    accounts.forEach(acc => {
        accountNames[acc.id] = acc.name;
    });

    // Format data for the chart: { date, total, [accId1]: val1, [accId2]: val2, ... }
    const chartData = history.map(entry => ({
        date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        total: entry.total,
        ...entry.accounts
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const total = payload.reduce((sum, entry) => sum + (entry.dataKey !== 'total' ? entry.value : 0), 0);

            return (
                <div className="glass-panel p-4 shadow-2xl border-slate-700/50 min-w-[200px]">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-3">{label}</p>
                    <div className="space-y-2">
                        {payload.filter(p => p.dataKey !== 'total').reverse().map((p, i) => (
                            <div key={i} className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke }}></div>
                                    <span className="text-sm text-slate-200">{accountNames[p.dataKey] || 'Unknown Account'}</span>
                                </div>
                                <span className="text-sm font-mono text-white">
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                        <span className="text-sm font-bold text-white">Total</span>
                        <span className="text-sm font-black text-accent-primary">
                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(total)}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-panel h-full flex flex-col p-8">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Patrimony Evolution</h2>
                    <p className="text-sm text-secondary">Individual and total net worth trends</p>
                </div>
                <div className="flex gap-4">
                    {accountIds.map((id, i) => (
                        <div key={id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span className="text-xs text-secondary font-medium">{accountNames[id] || 'Other'}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            {accountIds.map((id, i) => (
                                <linearGradient key={`grad-${id}`} id={`color-${id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} strokeOpacity={0.5} />
                        <XAxis
                            dataKey="date"
                            stroke="#475569"
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            dy={15}
                        />
                        <YAxis
                            stroke="#475569"
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `€${Math.round(value / 1000)}k`}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Stacked Areas */}
                        {accountIds.map((id, i) => (
                            <Area
                                key={id}
                                type="monotone"
                                dataKey={id}
                                stackId="1"
                                stroke={COLORS[i % COLORS.length]}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#color-${id})`}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistoryChart;
