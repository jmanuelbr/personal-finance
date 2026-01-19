import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PieChart as PieIcon, Activity } from 'lucide-react';

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
    { label: 'TODO', days: Infinity },
    { label: '1A', days: 365 },
    { label: '6M', days: 180 },
    { label: '3M', days: 90 },
    { label: '1M', days: 30 },
];

const HistoryChart = ({ history, accounts, isPrivate }) => {
    // Unique Account Types
    const accountTypes = useMemo(() => ['Todas', 'Patrimonio Total', ...new Set(accounts.map(acc => acc.type))], [accounts]);

    // State
    const [activeTab, setActiveTab] = useState('evolution'); // 'evolution' or 'distribution'
    const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[0]);
    const [selectedType, setSelectedType] = useState('Todas');
    const [distributionType, setDistributionType] = useState('accounts'); // 'accounts' or 'types'
    const [visibleAccountIds, setVisibleAccountIds] = useState(new Set(accounts.map(acc => acc.id)));

    // Filtering Logic for Evolution
    const filteredHistory = useMemo(() => {
        if (!history || history.length === 0) return [];

        const now = new Date();
        const cutoff = new Date(now.getTime() - selectedTimeframe.days * 24 * 60 * 60 * 1000);

        return history
            .filter(entry => selectedTimeframe.days === Infinity || new Date(entry.date) >= cutoff)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [history, selectedTimeframe]);

    // Accounts for Evolution
    const accountsInType = useMemo(() => {
        if (selectedType === 'Todas') return accounts;
        if (selectedType === 'Patrimonio Total') return accounts; // All accounts needed for total usually, but here we just need to know we are in total mode
        return accounts.filter(acc => acc.type === selectedType);
    }, [accounts, selectedType]);

    const activeAccountIds = useMemo(() => {
        if (selectedType === 'Patrimonio Total') return ['total'];
        return accountsInType.filter(acc => visibleAccountIds.has(acc.id)).map(acc => acc.id);
    }, [accountsInType, visibleAccountIds, selectedType]);

    // Distribution Data
    const distributionData = useMemo(() => {
        if (distributionType === 'accounts') {
            return accounts
                .filter(acc => acc.balance > 0)
                .map((acc, i) => ({
                    name: acc.name,
                    value: acc.balance,
                    color: COLORS[i % COLORS.length]
                }))
                .sort((a, b) => b.value - a.value);
        } else {
            const types = {};
            accounts.forEach(acc => {
                if (acc.balance > 0) {
                    types[acc.type] = (types[acc.type] || 0) + acc.balance;
                }
            });
            return Object.entries(types)
                .map(([name, value], i) => ({
                    name,
                    value,
                    color: COLORS[i % COLORS.length]
                }))
                .sort((a, b) => b.value - a.value);
        }
    }, [accounts, distributionType]);

    // Total for percentage calculations
    const totalDistribution = useMemo(() => distributionData.reduce((sum, item) => sum + item.value, 0), [distributionData]);

    // Map account IDs to names/colors
    const accountMeta = useMemo(() => {
        const meta = {
            'total': { name: 'Patrimonio Total', color: '#10b981' } // Emerald-500 for total
        };
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
                timestamp: new Date(entry.date).getTime(),
                total: entry.total // Ensure total is available
            };

            // If we are showing individual accounts, populate them
            if (selectedType !== 'Patrimonio Total') {
                activeAccountIds.forEach(id => {
                    row[id] = entry.accounts?.[id] || 0;
                });
            }

            return row;
        });
    }, [filteredHistory, activeAccountIds, selectedType]);

    const toggleAccount = (id) => {
        const newSet = new Set(visibleAccountIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setVisibleAccountIds(newSet);
    };

    const CustomEvolutionTooltip = ({ active, payload, label, isPrivate }) => {
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
                                    <span className="text-sm text-slate-200 truncate max-w-[120px]">{accountMeta[p.dataKey]?.name || 'Desconocido'}</span>
                                </div>
                                <span className={`text-sm font-mono text-white transition-all duration-300 ${isPrivate ? 'blur-[5px] select-none' : ''}`}>
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Only show total if NOT in 'Patrimonio Total' mode (since it's already redundant) OR if multiple items */}
                    {selectedType !== 'Patrimonio Total' && (
                        <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                            <span className="text-sm font-bold text-white">Total Filtrado</span>
                            <span className={`text-sm font-black text-accent-primary transition-all duration-300 ${isPrivate ? 'blur-md select-none' : ''}`}>
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(total)}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const CustomDistributionTooltip = ({ active, payload, isPrivate }) => {
        if (active && payload && payload.length) {
            const { name, value, color } = payload[0].payload;
            const percent = totalDistribution > 0 ? ((value / totalDistribution) * 100).toFixed(1) : 0;

            return (
                <div className="glass-panel p-4 shadow-2xl border-slate-700/50 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">{name}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-secondary">Saldo</span>
                            <span className={`text-sm font-mono text-white ${isPrivate ? 'blur-[5px] select-none' : ''}`}>
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-secondary">Porcentaje</span>
                            <span className="text-sm font-black text-accent-primary">{percent}%</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (!history || history.length === 0) {
        return (
            <div className="glass-panel h-[260px] sm:h-[400px] flex items-center justify-center">
                <p className="text-secondary text-base sm:text-lg text-center px-2">
                    No hay datos históricos disponibles todavía.
                </p>
            </div>
        );
    }

    return (
        <div className="glass-panel h-full flex flex-col p-4 sm:p-8 transition-all duration-500">
            {/* Header with Tabs and Sub-filters */}
            <div className="flex flex-col gap-6 sm:gap-8 mb-8 sm:mb-10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-white/10 shadow-inner w-full sm:w-auto">
                            <button
                                onClick={() => setActiveTab('evolution')}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'evolution'
                                    ? 'bg-gradient-to-r from-accent-primary to-accent-purple text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Activity size={18} /> Evolución
                            </button>
                            <button
                                onClick={() => setActiveTab('distribution')}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'distribution'
                                    ? 'bg-gradient-to-r from-accent-primary to-accent-purple text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <PieIcon size={18} /> Distribución
                            </button>
                        </div>
                    </div>

                    {activeTab === 'evolution' ? (
                        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5 w-full sm:w-auto overflow-x-auto">
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
                    ) : (
                        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
                            <button
                                onClick={() => setDistributionType('accounts')}
                                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${distributionType === 'accounts'
                                    ? 'bg-accent-primary text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                POR CUENTA
                            </button>
                            <button
                                onClick={() => setDistributionType('types')}
                                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${distributionType === 'types'
                                    ? 'bg-accent-primary text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                POR TIPO
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {activeTab === 'evolution' ? 'Evolución del Patrimonio' : 'Distribución de Activos'}
                    </h2>
                    <p className="text-sm text-secondary">
                        {activeTab === 'evolution' ? 'Analiza tendencias con filtros personalizados' : `Desglose de cartera por ${distributionType === 'accounts' ? 'cuenta' : 'tipo'}`}
                    </p>
                </div>
            </div>

            {/* Evolution Tab Content */}
            {activeTab === 'evolution' && (
                <>
                    <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
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

                    <div className="w-full h-[260px] sm:h-[360px] lg:h-[400px] animate-scale-in">
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
                                <Tooltip content={<CustomEvolutionTooltip isPrivate={isPrivate} />} />

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

                    <div className="flex flex-wrap gap-x-6 gap-y-3 mt-10 pt-6 border-t border-white/5 animate-fade-in">
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
                </>
            )}

            {/* Distribution Tab Content */}
            {activeTab === 'distribution' && (
                <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 mt-4 animate-fade-in">
                    <div className="w-full h-[260px] sm:h-[360px] lg:h-[400px] animate-scale-in lg:flex-[1.2]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth={2}
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomDistributionTooltip isPrivate={isPrivate} />} />
                                <text
                                    x="50%"
                                    y="50%"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="fill-white font-black text-2xl"
                                >
                                    Total
                                </text>
                                <text
                                    x="50%"
                                    y="57%"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    // Use explicit fill color because fill-secondary might not work in SVGs depending on config
                                    className={`fill-slate-400 text-base font-bold transition-all duration-500 ${isPrivate ? 'blur-sm select-none' : ''}`}
                                >
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalDistribution)}
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex-1 w-full max-h-[400px] overflow-y-auto pr-4 custom-scrollbar bg-slate-800/20 rounded-2xl p-6 border border-white/5 animate-slide-right">
                        <div className="space-y-4">
                            {distributionData.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1.5 group">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-white font-bold tracking-wide uppercase text-xs group-hover:text-accent-primary transition-colors">{item.name}</span>
                                        </div>
                                        <span className="text-accent-primary font-black">
                                            {totalDistribution > 0 ? ((item.value / totalDistribution) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                                            style={{
                                                width: `${totalDistribution > 0 ? (item.value / totalDistribution) * 100 : 0}%`,
                                                backgroundColor: item.color
                                            }}
                                        ></div>
                                    </div>
                                    <div className={`text-[10px] font-mono text-slate-500 text-right transition-all duration-500 ${isPrivate ? 'blur-[3px] select-none' : ''}`}>
                                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryChart;
