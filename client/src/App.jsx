import { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { AuthProvider, useAuth } from './hooks/useAuth';
import { RoleSelection } from './pages/RoleSelection';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Timeline } from './pages/Timeline';
import { Patients } from './pages/Patients';
import { ReportGenerator } from './pages/ReportGenerator';
import { Navigation } from './components/Navigation';
import { useLocalStorage } from './hooks/useLocalStorage';


function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isAuthPage = location.pathname === '/' || 
                     location.pathname === '/role' || 
                     location.pathname === '/login' || 
                     location.pathname === '/register';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <main
        className={`container mx-auto px-4 py-6 ${
          !isAuthPage ? 'mb-20 md:mb-0 md:pl-24' : ''
        }`}
      >
        {!isAuthPage && (
          <div className="flex items-center justify-between md:hidden mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg mr-3" />
              <span className="text-lg font-bold text-stone-900">HealthJournal</span>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-stone-600">{user.name}</span>
              )}
              <button
                className="text-sm text-stone-500 hover:text-stone-900"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {children}
      </main>

      {!isAuthPage && (
        <div className="md:fixed md:left-0 md:top-0 md:bottom-0 md:w-64 md:border-r md:border-stone-200 md:bg-white md:z-50">
          <div className="hidden md:flex items-center p-6 mb-6 justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg mr-3" />
              <span className="text-xl font-bold text-stone-900">
                HealthJournal
              </span>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-stone-600">{user.name}</span>
              )}
              <button
                className="text-sm text-stone-500 hover:text-stone-900"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
          <Navigation />
        </div>
      )}
    </div>
  );
}
<div className="bg-emerald-600 text-white p-6 rounded-xl">
  Tailwind is finally working 🎉
</div>


function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-stone-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'caregiver' ? '/patients' : '/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/role" element={<RoleSelection />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/timeline"
        element={
          <ProtectedRoute>
            <Timeline />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <ReportGenerator />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App

// function App() {
//   const [count, setCount] = useState(0)
//   const [data, setData] = useState(null);

//   const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`${API_BASE}/api`);
//         const result = await response.json();
//         setData(result.message);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setData('Server unavailable');
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>{data}</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
