import { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { RoleSelection } from './pages/RoleSelection';
import { Dashboard } from './pages/Dashboard';
import { Timeline } from './pages/Timeline';
import { ReportGenerator } from './pages/ReportGenerator';
import { Navigation } from './components/Navigation';
import { useLocalStorage } from './hooks/useLocalStorage';


function Layout({ children }) {
  const location = useLocation();
  const isRoleSelection = location.pathname === '/';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <main
        className={`container mx-auto px-4 py-6 ${
          !isRoleSelection ? 'mb-20 md:mb-0 md:pl-24' : ''
        }`}
      >
        {children}
      </main>

      {!isRoleSelection && (
        <div className="md:fixed md:left-0 md:top-0 md:bottom-0 md:w-64 md:border-r md:border-stone-200 md:bg-white md:z-50">
          <div className="hidden md:flex items-center p-6 mb-6">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg mr-3" />
            <span className="text-xl font-bold text-stone-900">
              HealthJournal
            </span>
          </div>
          <Navigation />
        </div>
      )}
    </div>
  );
}

function ProtectedRoute({ children, role }) {
  if (!role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function App() {
  const [userRole, setUserRole] = useLocalStorage('user_role', null);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              userRole ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <RoleSelection onSelect={setUserRole} />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role={userRole}>
                <Dashboard userRole={userRole} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/timeline"
            element={
              <ProtectedRoute role={userRole}>
                <Timeline />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report"
            element={
              <ProtectedRoute role={userRole}>
                <ReportGenerator />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
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
