import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Home, LogIn, LogOut, Sun, Moon, MessageCircle, Sparkles, Tag } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, username, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const isAdmin = location.pathname === '/admin';
  const isLogin = location.pathname === '/login';
  const isDiscussions = location.pathname.startsWith('/discussions');
  const isFreetch = location.pathname === '/freetch';
  const isPromo = location.pathname === '/promo';
  const isHome = !isAdmin && !isLogin && !isDiscussions && !isFreetch && !isPromo;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header
      className="sticky top-0 z-40 glass-card border-b border-gray-200/50 dark:border-gray-700/50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              onClick={(e) => {
                if (location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2 group"
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

            <Link
              to="/"
              className={cn(
                'flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isHome
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Accueil</span>
            </Link>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/discussions"
              className={cn(
                'flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isDiscussions
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Discussions</span>
            </Link>

            <Link
              to="/freetch"
              className={cn(
                'flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isFreetch
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Freetch</span>
            </Link>

            <Link
              to="/promo"
              className={cn(
                'flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isPromo
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Promo</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/admin"
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isAdmin
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
                <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                <span className="hidden md:inline text-xs text-gray-400 dark:text-gray-500">{username}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={cn(
                  'flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  isLogin
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Connexion</span>
              </Link>
            )}

            {/* Notifications */}
            <NotificationBell />

            {/* Dark mode toggle */}
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
        </div>
      </div>
    </motion.header>
  );
}
