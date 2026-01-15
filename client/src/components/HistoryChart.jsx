import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
    '#38bdf8', // Sky
    '#a78bfa', // Purple
    '#34d399', // Emerald
    '#f472b6', // Pink
    '#fbbf24', // Amber
    '#f87171', // Red
    '#6366f1', // Indigo
    '#14b8a6', // Teal
];

const TIMEFRAMES = [
    { label: 'ALL', days: Infinity },
    { label: '1Y', days: 365 },
    { label: '6M', days: 180 },
    { label: '3M', days: 90 },
    { label: '1M', days: 30 },
];

const HistoryChart = ({ history, accounts, isPrivate }) => {
    // Unique Account Types
    const accountTypes = useMemo(() => ['All', ...new Set(accounts.map(acc => acc.type))], [accounts]);

    // State
    const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[0]);
    const [selectedType, setSelectedType] = useState('All');
    const [visibleAccountIds, setVisibleAccountIds] = useState(new Set(accounts.map(acc => acc.id)));

    // Filtering Logic
    const filteredHistory = useMemo(() => {
        if (!history || history.length === 0) return [];

        const now = new Date();
        const cutoff = new Date(now.getTime() - selectedTimeframe.days * 24 * 60 * 60 * 1000);

        return history
            .filter(entry => selectedTimeframe.days === Infinity || new Date(entry.date) >= cutoff)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [history, selectedTimeframe]);

    // Accounts that belong to the selected type
    const accountsInType = useMemo(() => {
        return accounts.filter(acc => selectedType === 'All' || acc.type === selectedType);
    }, [accounts, selectedType]);

    const activeAccountIds = useMemo(() => {
        return accountsInType.filter(acc => visibleAccountIds.has(acc.id)).map(acc => acc.id);
    }, [accountsInType, visibleAccountIds]);

    // Map account IDs to names/colors
    const accountMeta = useMemo(() => {
        const meta = {};
        accounts.forEach((acc, i) => {
            meta[acc.id] = {
                name: acc.name,
                color: COLORS[i % COLORS.length]
            };
        });
        return meta;
    }, [accounts]);

    // Format data for Recharts
    const chartData = useMemo(() => {
        return filteredHistory.map(entry => {
            const row = {
                date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                timestamp: new Date(entry.date).getTime()
            };
            activeAccountIds.forEach(id => {
                row[id] = entry.accounts?.[id] || 0;
            });
            return row;
        });
    }, [filteredHistory, activeAccountIds]);

    const toggleAccount = (id) => {
        const newSet = new Set(visibleAccountIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setVisibleAccountIds(newSet);
    };

    const CustomTooltip = ({ active, payload, label, isPrivate }) => {
        if (active && payload && payload.length) {
            const total = payload.reduce((sum, entry) => sum + entry.value, 0);

            return (
                <div className="glass-panel p-4 shadow-2xl border-slate-700/50 min-w-[220px]">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-3">{label}</p>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {payload.slice().reverse().map((p, i) => (
                            <div key={i} className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke }}></div>
                                    <span className="text-sm text-slate-200 truncate max-w-[120px]">{accountMeta[p.dataKey]?.name || 'Unknown'}</span>
                                </div>
                                <span className={`text-sm font-mono text-white transition-all duration-300 ${isPrivate ? 'blur-[5px] select-none' : ''}`}>
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                        <span className="text-sm font-bold text-white">Total Filtered</span>
                        <span className={`text-sm font-black text-accent-primary transition-all duration-300 ${isPrivate ? 'blur-md select-none' : ''}`}>
                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(total)}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (!history || history.length === 0) {
        return (
            <div className="glass-panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="text-secondary text-lg">No historical data available yet.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel h-full flex flex-col p-8">
            {/* Header with Timeline and Title */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Patrimony Evolution</h2>
                    <p className="text-sm text-secondary">Analyze trends with custom filters</p>
                </div>

                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
                    {TIMEFRAMES.map((tf) => (
                        <button
                            key={tf.label}
                            onClick={() => setSelectedTimeframe(tf)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedTimeframe.label === tf.label
                                ? 'bg-accent-primary text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Type Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
                {accountTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedType === type
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Main Chart Area */}
            <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <defs>
                            {activeAccountIds.map((id) => (
                                <linearGradient key={`grad-${id}`} id={`color-${id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={accountMeta[id].color} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={accountMeta[id].color} stopOpacity={0} />
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
                            dy={10}
                        />
                        <YAxis
                            stroke="#475569"
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => isPrivate ? '***' : `€${Math.round(value / 1000)}k`}
                            dx={-5}
                        />
                        <Tooltip content={<CustomTooltip isPrivate={isPrivate} />} />

                        {activeAccountIds.map((id) => (
                            <Area
                                key={id}
                                type="monotone"
                                dataKey={id}
                                stackId="1"
                                stroke={accountMeta[id].color}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#color-${id})`}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Interactive Legend */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-10 pt-6 border-t border-white/5">
                {accountsInType.map((acc) => (
                    <button
                        key={acc.id}
                        onClick={() => toggleAccount(acc.id)}
                        className={`flex items-center gap-2 group transition-opacity ${visibleAccountIds.has(acc.id) ? 'opacity-100' : 'opacity-30'
                            }`}
                    >
                        <div
                            className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                            style={{ backgroundColor: accountMeta[acc.id].color }}
                        ></div>
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                            {acc.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HistoryChart;
