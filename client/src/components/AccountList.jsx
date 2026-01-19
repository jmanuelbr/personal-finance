import React, { useState } from 'react';
import { Plus, Trash2, CreditCard, TrendingUp, PieChart, Wallet, Pencil, X } from 'lucide-react';

const AccountList = ({ accounts, onAddAccount, onDeleteAccount, onEditAccount, isPrivate, totalPatrimony, previousAccounts }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        iban: '',
        type: 'Cuenta Corriente',
        balance: 0
    });

    const resetForm = () => {
        setFormData({ name: '', logo: '', iban: '', type: 'Cuenta Corriente', balance: 0 });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleStartAdd = () => {
        resetForm();
        setIsAdding(true);
    };

    const handleStartEdit = (account) => {
        setFormData({ ...account });
        setEditingId(account.id);
        setIsAdding(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            onEditAccount({ ...formData, id: editingId });
        } else {
            onAddAccount({ ...formData, id: crypto.randomUUID() });
        }
        resetForm();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('logo', file);

        try {
            const res = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: formDataUpload
            });
            if (!res.ok) throw new Error('Upload failed');
            const { filePath } = await res.json();
            setFormData({ ...formData, logo: `http://localhost:3001${filePath}` });
        } catch (err) {
            console.error(err);
            alert('Error al subir la imagen');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Fondos': return <TrendingUp size={20} />;
            case 'ETF': return <PieChart size={20} />;
            case 'Cuenta Remunerada': return <Wallet size={20} />;
            default: return <CreditCard size={20} />;
        }
    };

    return (
        <div className="glass-panel h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8 md:mb-10">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Tus Cuentas</h2>
                    <p className="text-sm text-secondary">Gestiona tus fuentes financieras</p>
                </div>
                <button
                    className="w-full md:w-auto group flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-accent-primary to-accent-purple text-white font-bold text-sm shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 hover:-translate-y-1 transition-all"
                    onClick={handleStartAdd}
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Añadir Cuenta
                </button>
            </div>

            {(isAdding || editingId) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-panel w-full max-w-lg animate-scale-in shadow-2xl border-slate-700/50 relative">
                        <button
                            onClick={resetForm}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-secondary hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold mb-6">{editingId ? 'Editar Cuenta' : 'Añadir Nueva Cuenta'}</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 mb-8">
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">Nombre</label>
                                    <input
                                        className="input-field"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="ej. Cuenta de Ahorros"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">Tipo</label>
                                    <select
                                        className="input-field appearance-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option>Cuenta Corriente</option>
                                        <option>Fondos</option>
                                        <option>ETF</option>
                                        <option>Cuenta Remunerada</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">IBAN (Opcional)</label>
                                    <input
                                        className="input-field"
                                        value={formData.iban}
                                        onChange={e => setFormData({ ...formData, iban: e.target.value })}
                                        placeholder="ES..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">Logo</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            style={{ width: '64px', height: '64px', minWidth: '64px', minHeight: '64px' }}
                                            className={`rounded-xl overflow-hidden flex items-center justify-center shadow-inner border transition-all duration-300 ${formData.logo ? 'bg-white border-slate-200 p-2' : 'bg-slate-800 border-slate-700'}`}
                                        >
                                            {formData.logo ? (
                                                <img src={formData.logo} alt="Preview" className="w-full h-full object-contain" />
                                            ) : (
                                                <Plus className="text-slate-600" size={24} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="logo-upload"
                                            />
                                            <label
                                                htmlFor="logo-upload"
                                                className="btn btn-secondary text-xs py-2 px-4 cursor-pointer hover:bg-slate-700"
                                            >
                                                {formData.logo ? 'Cambiar Imagen' : 'Subir Imagen'}
                                            </label>
                                            {formData.logo && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, logo: '' })}
                                                    className="text-xs text-red-400 ml-3 hover:underline"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">Saldo Actual (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input-field font-mono"
                                        value={formData.balance}
                                        onChange={e => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Actualizar' : 'Guardar'} Cuenta</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {accounts.map((account, index) => (
                    <div
                        key={account.id}
                        className="group relative rounded-2xl sm:rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-accent-primary/40 transition-all duration-300 hover:shadow-2xl overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Mobile: 2-row layout, Desktop: original layout */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 p-3 sm:p-8">
                            {/* Row 1: Logo + Info (Mobile) / Logo Column (Desktop) */}
                            <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-4 flex-shrink-0">
                                {/* Logo - Smaller on mobile */}
                                <div
                                    style={{ width: '48px', height: '48px' }}
                                    className={`sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center shadow-lg sm:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-accent-primary/20 flex-shrink-0 ${account.logo ? 'bg-white p-0.5 sm:p-1' : 'bg-slate-700 text-accent-primary'}`}
                                >
                                    {account.logo ? (
                                        <img
                                            src={account.logo}
                                            alt={account.name}
                                            className="w-full h-full object-contain rounded-xl sm:rounded-2xl"
                                        />
                                    ) : (
                                        <div className="transform scale-125 sm:scale-150">
                                            {getIcon(account.type)}
                                        </div>
                                    )}
                                </div>

                                {/* Info Section - Right of logo on mobile, hidden on desktop (shown in content area) */}
                                <div className="flex-1 min-w-0 sm:hidden">
                                    <h3 className="text-base font-black text-white mb-1 truncate group-hover:text-accent-primary transition-colors">
                                        {account.name}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-700/50 border border-slate-600/50 font-semibold text-secondary text-xs">
                                            {getIcon(account.type)}
                                            <span className="hidden min-[375px]:inline">{account.type}</span>
                                        </span>
                                        {account.iban && (
                                            <span className={`font-mono text-slate-500 text-[10px] truncate transition-all duration-300 ${isPrivate ? 'blur-[3px] select-none opacity-50' : ''}`}>
                                                {account.iban.slice(-4)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions - Desktop: below logo (prevents overlap with content) */}
                                <div className="hidden sm:flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={() => handleStartEdit(account)}
                                        className="p-2.5 rounded-xl bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white transition-all shadow-lg"
                                        title="Editar cuenta"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    {onDeleteAccount && (
                                        <button
                                            onClick={() => onDeleteAccount(account.id)}
                                            className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                            title="Eliminar cuenta"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Content - Hidden on mobile (shown in logo row), visible on desktop */}
                            <div className="hidden sm:flex flex-1 min-w-0 flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-5 truncate group-hover:text-accent-primary transition-colors">
                                        {account.name}
                                    </h3>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-700/50 border border-slate-600/50 font-semibold text-secondary text-sm">
                                            {getIcon(account.type)}
                                            {account.type}
                                        </span>
                                        {account.iban ? (
                                            <span className={`font-mono text-slate-500 text-xs truncate ml-2 transition-all duration-300 ${isPrivate ? 'blur-[3px] select-none opacity-50' : ''}`}>
                                                {account.iban}
                                            </span>
                                        ) : (
                                            <span className="font-mono text-slate-500/0 text-xs select-none ml-2">
                                                ES00 0000 0000 0000 0000 0000
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Balance Section - Desktop: Inside content column */}
                                <div className="mt-auto pt-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-xs text-secondary uppercase tracking-wider font-bold">
                                            {isPrivate ? 'Contribución' : 'Saldo Actual'}
                                        </p>
                                        {/* Percentage Change Indicator - Desktop */}
                                        {(() => {
                                            const prevBalance = previousAccounts?.[account.id];
                                            if (prevBalance !== undefined && prevBalance !== 0) {
                                                const diff = account.balance - prevBalance;
                                                const pct = (diff / prevBalance) * 100;
                                                if (Math.abs(pct) > 0.01) {
                                                    const isPos = pct >= 0;
                                                    return (
                                                        <div className={`flex items-center gap-1 text-xs font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {isPos ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                                                            {isPos ? '+' : ''}{pct.toFixed(1)}%
                                                        </div>
                                                    );
                                                }
                                            }
                                            return null;
                                        })()}
                                    </div>
                                    <div className="flex items-baseline justify-between gap-4">
                                        <p className={`text-3xl lg:text-4xl font-black text-emerald-400 tracking-tight transition-all duration-500 ${isPrivate ? 'blur-md select-none' : ''}`}>
                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(account.balance)}
                                        </p>
                                        <p className="text-lg font-bold text-accent-primary whitespace-nowrap">
                                            {totalPatrimony > 0 ? ((account.balance / totalPatrimony) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Balance + Actions (Mobile only) */}
                            <div className="flex items-center justify-between gap-2 sm:hidden">
                                {/* Balance Section */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] text-secondary uppercase tracking-wider font-bold hidden min-[375px]:block">
                                            {isPrivate ? 'Contribución' : 'Saldo'}
                                        </p>
                                        {/* Percentage Change Indicator - Mobile */}
                                        {(() => {
                                            const prevBalance = previousAccounts?.[account.id];
                                            if (prevBalance !== undefined && prevBalance !== 0) {
                                                const diff = account.balance - prevBalance;
                                                const pct = (diff / prevBalance) * 100;
                                                if (Math.abs(pct) > 0.01) {
                                                    const isPos = pct >= 0;
                                                    return (
                                                        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {isPos ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                                                            {isPos ? '+' : ''}{pct.toFixed(1)}%
                                                        </div>
                                                    );
                                                }
                                            }
                                            return null;
                                        })()}
                                    </div>
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p className={`text-lg font-black text-emerald-400 tracking-tight truncate transition-all duration-500 ${isPrivate ? 'blur-md select-none' : ''}`}>
                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(account.balance)}
                                        </p>
                                        <p className="text-xs font-semibold text-accent-primary whitespace-nowrap">
                                            {totalPatrimony > 0 ? ((account.balance / totalPatrimony) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1.5 opacity-100 transition-all duration-300 flex-shrink-0">
                                    <button
                                        onClick={() => handleStartEdit(account)}
                                        className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white transition-all shadow-lg"
                                        title="Editar cuenta"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    {onDeleteAccount && (
                                        <button
                                            onClick={() => onDeleteAccount(account.id)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                            title="Eliminar cuenta"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Actions - Desktop: moved below logo */}
                        </div>
                    </div>
                ))}
                {accounts.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-700/50 rounded-xl">
                        <div className="inline-flex p-4 rounded-full bg-slate-800/50 text-slate-600 mb-3">
                            <CreditCard size={32} />
                        </div>
                        <p className="text-secondary font-medium">No hay cuentas todavía</p>
                        <p className="text-sm text-slate-500 mt-1">Añade tu primera cuenta para empezar</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountList;
