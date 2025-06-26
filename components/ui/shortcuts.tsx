import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Tipos de atajos
export interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  category?: string;
  modifier?: 'ctrl' | 'alt' | 'shift' | 'meta';
}

// Hook para manejar atajos de teclado
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorar si está en un input o textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey;
    const alt = event.altKey;
    const shift = event.shiftKey;
    const meta = event.metaKey;

    for (const shortcut of shortcuts) {
      const shortcutKey = shortcut.key.toLowerCase();
      const modifier = shortcut.modifier;

      // Verificar si coincide el modificador
      const modifierMatch = !modifier || 
        (modifier === 'ctrl' && ctrl) ||
        (modifier === 'alt' && alt) ||
        (modifier === 'shift' && shift) ||
        (modifier === 'meta' && meta);

      // Verificar si coincide la tecla
      const keyMatch = key === shortcutKey;

      if (modifierMatch && keyMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Componente para mostrar atajos disponibles
interface ShortcutsHelpProps {
  shortcuts: Shortcut[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ShortcutsHelp({ shortcuts, isOpen, onClose, className }: ShortcutsHelpProps) {
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const formatKey = (shortcut: Shortcut) => {
    const parts = [];
    if (shortcut.modifier) {
      parts.push(shortcut.modifier.toUpperCase());
    }
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={cn(
              "bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Atajos de Teclado</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{category}</h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                      >
                        <span className="text-sm text-gray-700">
                          {shortcut.description}
                        </span>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                          {formatKey(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                Presiona <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">ESC</kbd> para cerrar
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Componente de botón para mostrar atajos
interface ShortcutsButtonProps {
  shortcuts: Shortcut[];
  className?: string;
  children?: React.ReactNode;
}

export function ShortcutsButton({ shortcuts, className, children }: ShortcutsButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          className
        )}
      >
        {children || (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Atajos
          </>
        )}
      </button>

      <ShortcutsHelp
        shortcuts={shortcuts}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

// Atajos predefinidos comunes
export const commonShortcuts: Shortcut[] = [
  {
    key: '?',
    description: 'Mostrar atajos de teclado',
    category: 'Ayuda',
    action: () => {
      // Se puede personalizar para mostrar el modal de atajos
      console.log('Mostrar atajos');
    }
  },
  {
    key: 'Escape',
    description: 'Cerrar modal o cancelar',
    category: 'Navegación',
    action: () => {
      // Se puede personalizar para cerrar modales
      console.log('Escape pressed');
    }
  },
  {
    key: 'Enter',
    description: 'Confirmar o enviar',
    category: 'Acciones',
    action: () => {
      console.log('Enter pressed');
    }
  },
  {
    key: 'n',
    modifier: 'ctrl',
    description: 'Nuevo elemento',
    category: 'Creación',
    action: () => {
      console.log('Ctrl+N pressed');
    }
  },
  {
    key: 's',
    modifier: 'ctrl',
    description: 'Guardar',
    category: 'Archivo',
    action: () => {
      console.log('Ctrl+S pressed');
    }
  },
  {
    key: 'f',
    modifier: 'ctrl',
    description: 'Buscar',
    category: 'Navegación',
    action: () => {
      console.log('Ctrl+F pressed');
    }
  },
  {
    key: 'r',
    modifier: 'ctrl',
    description: 'Recargar',
    category: 'Navegación',
    action: () => {
      window.location.reload();
    }
  }
];

// Hook para atajos específicos de la aplicación
export function useAppShortcuts() {
  const shortcuts: Shortcut[] = [
    ...commonShortcuts,
    {
      key: '1',
      description: 'Ir a Productos',
      category: 'Navegación',
      action: () => {
        // Navegar a productos
        console.log('Ir a productos');
      }
    },
    {
      key: '2',
      description: 'Ir a Caja',
      category: 'Navegación',
      action: () => {
        // Navegar a caja
        console.log('Ir a caja');
      }
    },
    {
      key: '3',
      description: 'Ir a Ventas',
      category: 'Navegación',
      action: () => {
        // Navegar a ventas
        console.log('Ir a ventas');
      }
    },
    {
      key: 'a',
      modifier: 'ctrl',
      description: 'Ir a Administración',
      category: 'Navegación',
      action: () => {
        // Navegar a administración
        console.log('Ir a administración');
      }
    },
    {
      key: 'p',
      modifier: 'ctrl',
      description: 'Crear nueva comanda',
      category: 'Comandas',
      action: () => {
        // Crear nueva comanda
        console.log('Crear nueva comanda');
      }
    }
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
} 