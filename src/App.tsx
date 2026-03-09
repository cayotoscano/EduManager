import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Calendar from './components/Calendar';
import Financial from './components/Financial';
import { BookOpen, Calendar as CalendarIcon, DollarSign, LayoutDashboard, LogOut, Menu, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Alunos', href: '/alunos', icon: Users },
    { name: 'Agenda', href: '/agenda', icon: CalendarIcon },
    { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2 font-bold text-xl">
          <BookOpen className="w-6 h-6" />
          <span>EduManager</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0`}>
        <div className="p-6 hidden md:flex items-center space-x-3 text-white font-bold text-2xl border-b border-slate-800">
          <BookOpen className="w-8 h-8 text-indigo-500" />
          <span>EduManager</span>
        </div>
        
        <div className="p-4 border-b border-slate-800 mb-4">
          <p className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-1">Professor(a)</p>
          <p className="text-white font-medium">{user?.email}</p>
        </div>

        <nav className="px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={() => signOut()}
            className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  const { user, setSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/alunos" 
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agenda" 
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/financeiro" 
          element={
            <ProtectedRoute>
              <Financial />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;