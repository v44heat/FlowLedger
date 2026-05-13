// ─── frontend/src/App.tsx ─────────────────────────────────────────────────────
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard }    from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Analytics }    from './pages/Analytics';
import { Budgets }      from './pages/Budgets';
import { Login }        from './pages/Login';
import { Register }     from './pages/Register';

function App() {
  return (
    <Routes>
      <Route path="/"             element={<Dashboard />}    />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/analytics"    element={<Analytics />}    />
      <Route path="/budgets"      element={<Budgets />}      />
      <Route path="/login"        element={<Login />}        />
      <Route path="/register"     element={<Register />}     />
      <Route path="*"             element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;


