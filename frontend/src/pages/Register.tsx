// ─── frontend/src/pages/Register.tsx ─────────────────────────────────────────
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { authApi } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { Spinner } from '../components/ui/Spinner';

export const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const { setAuth } = useAppStore();
  const navigate = useNavigate();

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const { data } = await authApi.register(form);
      setAuth(data.user, data.token);
      navigate('/');
    } catch (e: any) {
      setErr(e.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-800/20 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Start understanding your M-Pesa spending</p>
        </div>

        <div className="glass p-8">
          <form onSubmit={submit} className="space-y-4">
            {[
              { label: 'Full Name',  key: 'name',     type: 'text',     placeholder: 'John Kamau' },
              { label: 'Email',      key: 'email',    type: 'email',    placeholder: 'you@example.com' },
              { label: 'Password',   key: 'password', type: 'password', placeholder: 'Min 6 characters' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]}
                  onChange={update(f.key)} className="input" placeholder={f.placeholder} required />
              </div>
            ))}

            {err && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {err}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Spinner size="sm" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};