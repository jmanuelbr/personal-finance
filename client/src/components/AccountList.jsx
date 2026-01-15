import React, { useState } from 'react';
import { Plus, Trash2, CreditCard, TrendingUp, PieChart, Wallet, Pencil, X } from 'lucide-react';

const AccountList = ({ accounts, onAddAccount, onDeleteAccount, onEditAccount }) => {
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
            alert('Error uploading image');
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
            <div className="flex-between mb-10">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Your Accounts</h2>
                    <p className="text-sm text-secondary">Manage your financial sources</p>
                </div>
                <button
                    className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-accent-primary to-accent-purple text-white font-bold text-sm shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 hover:-translate-y-1 transition-all"
                    onClick={handleStartAdd}
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Add Account
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

                        <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Account' : 'Add New Account'}</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 mb-8">
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">Name</label>
                                    <input
                                        className="input-field"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Main Savings"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">Type</label>
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
                                    <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">IBAN (Optional)</label>
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
                                                {formData.logo ? 'Change Image' : 'Upload Image'}
                                            </label>
                                            {formData.logo && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, logo: '' })}
                                                    className="text-xs text-red-400 ml-3 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">Current Balance (€)</label>
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
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'} Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {accounts.map((account, index) => (
                    <div
                        key={account.id}
                        className="group relative rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-accent-primary/40 transition-all duration-300 hover:shadow-2xl overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex gap-8 p-8">
                            {/* Logo Container - Left Side */}
                            <div className="flex-shrink-0">
                                <div
                                    style={{ width: '80px', height: '80px' }}
                                    className={`rounded-2xl overflow-hidden flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-accent-primary/20 ${account.logo ? 'bg-white p-3' : 'bg-slate-700 text-accent-primary'}`}
                                >
                                    {account.logo ? (
                                        <img
                                            src={account.logo}
                                            alt={account.name}
                                            style={{ maxWidth: '80px', maxHeight: '80px', width: '100%', height: '100%' }}
                                            className="object-contain"
                                        />
                                    ) : (
                                        <div className="transform scale-[1.5]">
                                            {getIcon(account.type)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content - Right Side */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-3 truncate group-hover:text-accent-primary transition-colors">
                                        {account.name}
                                    </h3>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-700/50 border border-slate-600/50 font-semibold text-secondary text-sm">
                                            {getIcon(account.type)}
                                            {account.type}
                                        </span>
                                        {account.iban && (
                                            <span className="font-mono text-slate-500 text-xs truncate ml-2">
                                                {account.iban}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-end justify-between flex-wrap gap-4 mt-6">
                                    <div className="min-w-0">
                                        <p className="text-xs text-secondary uppercase tracking-wider font-bold mb-2">Current Balance</p>
                                        <p className="text-3xl font-black text-emerald-400 tracking-tight truncate">
                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(account.balance)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button
                                            onClick={() => handleStartEdit(account)}
                                            className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white transition-all shadow-lg"
                                            title="Edit account"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        {onDeleteAccount && (
                                            <button
                                                onClick={() => onDeleteAccount(account.id)}
                                                className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                                title="Delete account"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {accounts.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-700/50 rounded-xl">
                        <div className="inline-flex p-4 rounded-full bg-slate-800/50 text-slate-600 mb-3">
                            <CreditCard size={32} />
                        </div>
                        <p className="text-secondary font-medium">No accounts yet</p>
                        <p className="text-sm text-slate-500 mt-1">Add your first account to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountList;
