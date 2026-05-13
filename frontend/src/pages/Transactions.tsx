// frontend/src/pages/Transactions.tsx
import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { useTransactions } from '../hooks/useTransactions';
import { CATEGORIES } from '../utils/categories';
import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Transactions = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('transactionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useTransactions({
    page, limit: 25, search, category, type, startDate, endDate, sortBy, sortOrder,
  });

  const handleSort = (col: string) => {
    if (col === sortBy) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortOrder('desc'); }
    setPage(1);
  };

  const clearFilters = () => {
    setCategory(''); setType(''); setStartDate(''); setEndDate('');
    setSearch(''); setSearchInput(''); setPage(1);
  };

  const hasFilters = category || type || startDate || endDate || search;

  return (
    <Layout>
      <Header title="Transactions" subtitle={`${data?.total || 0} total`} />

      <div className="p-8 space-y-4 animate-fade-in">
        {/* Search & Filter bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
              placeholder="Search merchants or descriptions… (Enter)"
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`btn-ghost flex items-center gap-2 border border-white/10 ${showFilters ? 'bg-white/5' : ''}`}
          >
            <Filter size={15} />
            Filters
            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-500" />
            )}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost flex items-center gap-1 text-red-400 hover:text-red-300">
              <X size={15} /> Clear
            </button>
          )}
        </div>

        {/* Expandable filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Category</label>
                  <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
                    className="input text-sm py-2">
                    <option value="">All categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Type</label>
                  <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}
                    className="input text-sm py-2">
                    <option value="">All types</option>
                    <option value="DEBIT">Debit</option>
                    <option value="CREDIT">Credit</option>
                    <option value="WITHDRAW">Withdraw</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">From</label>
                  <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }}
                    className="input text-sm py-2" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">To</label>
                  <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }}
                    className="input text-sm py-2" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TransactionTable
          data={data?.transactions || []}
          isLoading={isLoading}
          total={data?.total || 0}
          page={page}
          pages={data?.pages || 1}
          onPageChange={setPage}
          onSort={handleSort}
        />
      </div>
    </Layout>
  );
};