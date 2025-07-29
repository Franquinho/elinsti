import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../../lib/utils';

type Theme = 'light' | 'dark' | 'system';

interface ThemeSwitcherProps {
  className?: string;
  showLabels?: boolean;
}

export function ThemeSwitcher({ className, showLabels = false }: ThemeSwitcherProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <button
        onClick={() => handleThemeChange('light')}
        className={cn(
          "p-2 rounded-md transition-colors",
          resolvedTheme === 'light' 
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
        )}
        title="Tema claro"
      >
        <Sun className="w-4 h-4" />
        {showLabels && <span className="ml-2 text-sm">Claro</span>}
      </button>

      <button
        onClick={() => handleThemeChange('dark')}
        className={cn(
          "p-2 rounded-md transition-colors",
          resolvedTheme === 'dark' 
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
        )}
        title="Tema oscuro"
      >
        <Moon className="w-4 h-4" />
        {showLabels && <span className="ml-2 text-sm">Oscuro</span>}
      </button>

      <button
        onClick={() => handleThemeChange('system')}
        className={cn(
          "p-2 rounded-md transition-colors",
          theme === 'system' 
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
        )}
        title="Tema del sistema"
      >
        <Monitor className="w-4 h-4" />
        {showLabels && <span className="ml-2 text-sm">Sistema</span>}
      </button>
    </div>
  );
}

// Selector de tema con dropdown
interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const getCurrentIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getCurrentLabel = () => {
    switch (theme) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Oscuro';
      case 'system':
        return 'Sistema';
      default:
        return 'Sistema';
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  if (!mounted) {
    return (
      <div className={cn("relative", className)}>
        <div className="w-32 h-10 bg-gray-200 rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {getCurrentIcon()}
        <span>{getCurrentLabel()}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
          >
            <div className="py-1">
              <button
                onClick={() => handleThemeChange('light')}
                className={cn(
                  "flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                  theme === 'light' && "bg-blue-50 text-blue-600"
                )}
              >
                <Sun className="w-4 h-4 mr-3" />
                Claro
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={cn(
                  "flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                  theme === 'dark' && "bg-blue-50 text-blue-600"
                )}
              >
                <Moon className="w-4 h-4 mr-3" />
                Oscuro
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={cn(
                  "flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                  theme === 'system' && "bg-blue-50 text-blue-600"
                )}
              >
                <Monitor className="w-4 h-4 mr-3" />
                Sistema
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook para usar el tema
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return {
    theme,
    changeTheme,
    mounted
  };
} 