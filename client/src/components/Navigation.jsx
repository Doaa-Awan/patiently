import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, FileText } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-emerald-600 bg-emerald-50'
      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50';
  };

  const navItems = [
    {
      path: '/dashboard',
      icon: <Home className="w-5 h-5" />,
      label: 'Log',
    },
    {
      path: '/timeline',
      icon: <Calendar className="w-5 h-5" />,
      label: 'Timeline',
    },
    {
      path: '/report',
      icon: <FileText className="w-5 h-5" />,
      label: 'Report',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 pb-safe md:relative md:border-t-0 md:pb-0">
      <div className="max-w-md mx-auto md:max-w-none px-4 md:px-0">
        <ul className="flex justify-around md:flex-col md:space-y-2 md:justify-start">
          {navItems.map((item) => (
            <li key={item.path} className="flex-1 md:flex-none">
              <Link
                to={item.path}
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start py-3 md:px-4 md:py-3 rounded-lg transition-colors ${isActive(
                  item.path
                )}`}
              >
                {item.icon}
                <span className="text-xs md:text-sm font-medium mt-1 md:mt-0 md:ml-3">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
