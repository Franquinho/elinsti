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