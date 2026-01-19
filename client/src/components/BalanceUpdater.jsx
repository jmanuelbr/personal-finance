import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

const BalanceUpdater = ({ accounts, onSave, onCancel }) => {
    const [balances, setBalances] = useState({});

    useEffect(() => {
        const initialBalances = {};
        accounts.forEach(acc => {
            initialBalances[acc.id] = acc.balance;
        });
        setBalances(initialBalances);
    }, [accounts]);

    const handleChange = (id, value) => {
        setBalances(prev => ({
            ...prev,
            [id]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(balances);
    };

    const total = Object.values(balances).reduce((sum, val) => sum + val, 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl border-slate-700/50">
                <div className="flex-between mb-6 sm:mb-8 sticky top-0 bg-slate-900/50 backdrop-blur-xl -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 p-4 sm:p-8 border-b border-white/5 z-10">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold">Actualizar Saldos</h2>
                        <p className="text-sm text-secondary">Introduzca el valor actual de cada cuenta</p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-secondary hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-8">
                        {accounts.map((account, index) => (
                            <div
                                key={account.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-slate-800/30 rounded-[2rem] border border-slate-700/30 hover:border-accent-primary/30 transition-all group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div
                                    style={{ width: '80px', height: '80px', minWidth: '80px', minHeight: '80px' }}
                                    className={`rounded-2xl overflow-hidden flex items-center justify-center shadow-lg border-2 transition-transform duration-300 group-hover:scale-105 ${account.logo ? 'bg-white border-white/10 p-2' : 'bg-slate-700/50 border-transparent text-accent-primary'}`}
                                >
                                    {account.logo ? (
                                        <img src={account.logo} alt={account.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="transform scale-[1.5]">
                                            {getIcon(account.type)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-white">{account.name}</h3>
                                    <p className="text-xs text-secondary uppercase tracking-widest font-bold">{account.type}</p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                    <span className="text-secondary font-medium text-lg">€</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input-field w-full sm:w-40 text-right font-mono text-xl font-black bg-slate-900/50 border-slate-700/50 focus:border-accent-primary"
                                        value={balances[account.id] || ''}
                                        onChange={(e) => handleChange(account.id, e.target.value)}
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-t border-white/10 pt-6 mt-8">
                        <div>
                            <p className="text-sm text-secondary font-medium uppercase tracking-wider mb-1">Nueva Estimación Total</p>
                            <p className="text-3xl font-bold text-accent-success tracking-tight">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(total)}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancelar</button>
                            <button type="submit" className="btn btn-primary flex items-center gap-2 px-6">
                                <Save size={18} /> Guardar Cambios
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BalanceUpdater;
