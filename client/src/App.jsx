import React, { useState, useEffect } from 'react';
import { LayoutDashboard, RefreshCw, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';
import AccountList from './components/AccountList';
import HistoryChart from './components/HistoryChart';
import BalanceUpdater from './components/BalanceUpdater';

const API_URL = '/api/data';

function App() {
  const [data, setData] = useState({ accounts: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [showUpdater, setShowUpdater] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch data');
      const jsonData = await res.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the local server. Please ensure "node server/server.js" is running.');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (!res.ok) throw new Error('Failed to save data');
      setData(newData);
    } catch (err) {
      console.error(err);
      alert('Error saving data!');
    }
  };

  const handleAddAccount = (newAccount) => {
    const updatedAccounts = [...data.accounts, newAccount];
    // Also update history if it's the first entry or just add to current state?
    // Actually, adding an account changes the current total. 
    // We should probably record a history point or just let the user do it via "Update Balances".
    // For now, just add the account.
    saveData({ ...data, accounts: updatedAccounts });
  };

  const handleDeleteAccount = (id) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    const updatedAccounts = data.accounts.filter(acc => acc.id !== id);
    saveData({ ...data, accounts: updatedAccounts });
  };

  const handleEditAccount = (updatedAccount) => {
    const updatedAccounts = data.accounts.map(acc =>
      acc.id === updatedAccount.id ? updatedAccount : acc
    );
    saveData({ ...data, accounts: updatedAccounts });
  };

  const handleUpdateBalances = (newBalances) => {
    // 1. Update accounts
    const updatedAccounts = data.accounts.map(acc => ({
      ...acc,
      balance: newBalances[acc.id] !== undefined ? newBalances[acc.id] : acc.balance
    }));

    // 2. Calculate new total
    const newTotal = updatedAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    // 3. Add to history
    const newHistoryEntry = {
      date: new Date().toISOString(),
      total: newTotal,
      accounts: newBalances // Store snapshot of individual balances if needed later
    };

    const updatedHistory = [...data.history, newHistoryEntry];

    saveData({
      accounts: updatedAccounts,
      history: updatedHistory
    });
    setShowUpdater(false);
  };

  // Calculations
  const totalPatrimony = data.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Calculate changes
  // Sort history by date just in case
  const sortedHistory = [...data.history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const lastEntry = sortedHistory[sortedHistory.length - 1];
  // If we have history, compare current total with the last history entry (or the one before if we just updated?)
  // Actually, if we just updated, the current total IS the last history entry.
  // So we want to compare with the previous month.

  // Simple approach: Compare with the entry 30 days ago approx, or just the previous entry.
  // Let's compare with the previous entry for now.
  const previousEntry = sortedHistory.length > 1 ? sortedHistory[sortedHistory.length - 2] : null;
  const previousAccounts = previousEntry ? previousEntry.accounts : {};

  const changeAmount = previousEntry ? totalPatrimony - previousEntry.total : 0;
  const changePercent = previousEntry && previousEntry.total !== 0 ? (changeAmount / previousEntry.total) * 100 : 0;

  if (loading) return <div className="flex items-center justify-center h-screen text-secondary">Cargando...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-400">{error}</div>;

  return (
    <div className="min-h-screen pb-12 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0 mb-8 md:mb-12 py-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-accent-primary to-accent-purple rounded-xl shadow-lg shadow-accent-primary/20">
            <LayoutDashboard className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Seguimiento de Patrimonio
            </h1>
            <p className="text-secondary text-sm">Sigue la evolución de tu riqueza</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className={`p-2.5 rounded-xl transition-all duration-300 border ${isPrivate
              ? 'bg-accent-primary/20 border-accent-primary/30 text-accent-primary'
              : 'bg-slate-800/50 border-white/5 text-secondary hover:text-white hover:border-white/10'
              }`}
            title={isPrivate ? "Desactivar Modo Privado" : "Activar Modo Privado"}
          >
            {isPrivate ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button
            onClick={() => setShowUpdater(true)}
            className="btn btn-primary animate-scale-in delay-100 flex-1 md:flex-none"
          >
            <RefreshCw size={18} /> Actualizar Saldos
          </button>
        </div>
      </header>

      {/* Dashboard Cards */}
      <div className="grid-layout mb-12">
        <div className="glass-panel relative overflow-hidden group animate-slide-up delay-100">
          <div className="absolute -right-6 -top-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Wallet size={120} />
          </div>
          <p className="text-secondary text-sm font-medium mb-2 uppercase tracking-wider">Patrimonio Total</p>
          <h2 className={`text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight transition-all duration-500 ${isPrivate ? 'blur-md select-none' : ''}`}>
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalPatrimony)}
          </h2>
          <p className="text-sm text-secondary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-success"></span>
            En {data.accounts.length} cuentas
          </p>
        </div>

        <div className="glass-panel relative overflow-hidden group animate-slide-up delay-200">
          <div className="absolute -right-6 -top-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <TrendingUp size={120} />
          </div>
          <p className="text-secondary text-sm font-medium mb-2 uppercase tracking-wider">Cambio Reciente</p>
          <div className="flex items-baseline gap-3 mb-2">
            <h2 className={`text-3xl md:text-5xl font-bold tracking-tight transition-all duration-500 ${isPrivate ? 'blur-md select-none' : ''} ${changeAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {changeAmount >= 0 ? '+' : ''}{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(changeAmount)}
            </h2>
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${changeAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {changeAmount >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            <span>{Math.abs(changePercent).toFixed(2)}% vs actualización anterior</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-8">
        <div className="animate-slide-up delay-300">
          <HistoryChart history={sortedHistory} accounts={data.accounts} isPrivate={isPrivate} />
        </div>
        <div className="animate-slide-up delay-300">
          <AccountList
            accounts={data.accounts}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
            onEditAccount={handleEditAccount}
            isPrivate={isPrivate}
            totalPatrimony={totalPatrimony}
            previousAccounts={previousAccounts}
          />
        </div>
      </div>

      {showUpdater && (
        <BalanceUpdater
          accounts={data.accounts}
          onSave={handleUpdateBalances}
          onCancel={() => setShowUpdater(false)}
        />
      )}
    </div>
  );
}

export default App;
