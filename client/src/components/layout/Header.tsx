import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Home, LogIn, LogOut, Sun, Moon, MessageCircle, Sparkles, Tag, Tv, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, username, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = location.pathname === '/admin';
  const isLogin = location.pathname === '/login';
  const isDiscussions = location.pathname.startsWith('/discussions');
  const isFreetch = location.pathname === '/freetch';
  const isPromo = location.pathname === '/promo';
  const isStream = location.pathname === '/stream';
  const isHome = !isAdmin && !isLogin && !isDiscussions && !isFreetch && !isPromo && !isStream;

  // Fermer le menu au changement de route
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Bloquer le scroll quand le menu est ouvert
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const navItems: NavItem[] = [
    { to: '/', label: 'Accueil', icon: Home, active: isHome },
    { to: '/discussions', label: 'Discussions', icon: MessageCircle, active: isDiscussions },
    { to: '/freetch', label: 'Freetch', icon: Sparkles, active: isFreetch },
    { to: '/promo', label: 'Promo', icon: Tag, active: isPromo },
    { to: '/stream', label: 'Stream', icon: Tv, active: isStream },
  ];

  const linkClass = (active: boolean) =>
    cn(
      'flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
      active
        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    );

  return (
    <motion.header
      className="sticky top-0 z-40 glass-card border-b border-gray-200/50 dark:border-gray-700/50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          <Link
            to="/"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <img
              src="/logo.png"
              alt="DoFri"
              className="w-10 h-10 rounded-xl object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div>
              <h1 className="text-xl font-bold gradient-text">DoFri</h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 -mt-0.5 font-medium tracking-wider uppercase">
                Portail de liens
              </p>
            </div>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-end">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={linkClass(item.active)}>
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link to="/admin" className={linkClass(isAdmin)}>
                  <Settings className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                <span className="hidden xl:inline text-xs text-gray-400 dark:text-gray-500">{username}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <Link to="/login" className={linkClass(isLogin)}>
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </Link>
            )}

            <NotificationBell />

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              <motion.div
                key={isDark ? 'moon' : 'sun'}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </button>
          </nav>

          {/* Contrôles mobile : bell + theme + hamburger */}
          <div className="flex lg:hidden items-center gap-1">
            <NotificationBell />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Volet déroulant mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-16 inset-x-0 z-40 glass-card border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      item.active
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/admin"
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                        isAdmin
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Admin</span>
                      {username && (
                        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{username}</span>
                      )}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      isLogin
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Connexion</span>
                  </Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
