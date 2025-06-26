import React from 'react';
import { cn } from '../../lib/utils';

// Breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// Hook para detectar el tamaño de pantalla
export function useResponsive() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < breakpoints.md);
      setIsTablet(width >= breakpoints.md && width < breakpoints.lg);
      setIsDesktop(width >= breakpoints.lg);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isMobile, isTablet, isDesktop };
}

// Componente responsive que se adapta al tamaño de pantalla
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobile?: string;
  tablet?: string;
  desktop?: string;
}

export function ResponsiveContainer({ 
  children, 
  className,
  mobile,
  tablet,
  desktop 
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getResponsiveClass = () => {
    if (isMobile && mobile) return mobile;
    if (isTablet && tablet) return tablet;
    if (isDesktop && desktop) return desktop;
    return className;
  };

  return (
    <div className={cn(getResponsiveClass())}>
      {children}
    </div>
  );
}

// Grid responsive
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "gap-4"
}: ResponsiveGridProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getGridCols = () => {
    if (isMobile) return `grid-cols-${cols.mobile || 1}`;
    if (isTablet) return `grid-cols-${cols.tablet || 2}`;
    if (isDesktop) return `grid-cols-${cols.desktop || 3}`;
    return `grid-cols-${cols.mobile || 1}`;
  };

  return (
    <div className={cn("grid", getGridCols(), gap, className)}>
      {children}
    </div>
  );
}

// Layout responsive
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  sidebar?: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string;
}

export function ResponsiveLayout({ 
  children, 
  className,
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = 'w-64'
}: ResponsiveLayoutProps) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className={cn("flex flex-col", className)}>
        {sidebar && (
          <div className="mb-4">
            {sidebar}
          </div>
        )}
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className={cn("flex", className)}>
      {sidebar && sidebarPosition === 'left' && (
        <aside className={cn(sidebarWidth, "flex-shrink-0")}>
          {sidebar}
        </aside>
      )}
      <main className="flex-1">
        {children}
      </main>
      {sidebar && sidebarPosition === 'right' && (
        <aside className={cn(sidebarWidth, "flex-shrink-0")}>
          {sidebar}
        </aside>
      )}
    </div>
  );
}

// Texto responsive
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

export function ResponsiveText({ 
  children, 
  className,
  sizes = { mobile: 'text-sm', tablet: 'text-base', desktop: 'text-lg' }
}: ResponsiveTextProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getTextSize = () => {
    if (isMobile) return sizes.mobile;
    if (isTablet) return sizes.tablet;
    if (isDesktop) return sizes.desktop;
    return sizes.mobile;
  };

  return (
    <div className={cn(getTextSize(), className)}>
      {children}
    </div>
  );
}

// Espaciado responsive
interface ResponsiveSpacingProps {
  children: React.ReactNode;
  className?: string;
  spacing?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

export function ResponsiveSpacing({ 
  children, 
  className,
  spacing = { mobile: 'p-4', tablet: 'p-6', desktop: 'p-8' }
}: ResponsiveSpacingProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getSpacing = () => {
    if (isMobile) return spacing.mobile;
    if (isTablet) return spacing.tablet;
    if (isDesktop) return spacing.desktop;
    return spacing.mobile;
  };

  return (
    <div className={cn(getSpacing(), className)}>
      {children}
    </div>
  );
}

// Navegación responsive
interface ResponsiveNavigationProps {
  children: React.ReactNode;
  className?: string;
  mobileMenu?: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ResponsiveNavigation({ 
  children, 
  className,
  mobileMenu,
  isOpen = false,
  onToggle
}: ResponsiveNavigationProps) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <nav className={cn("relative", className)}>
        <div className="flex items-center justify-between">
          {children}
          {mobileMenu && onToggle && (
            <button
              onClick={onToggle}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
        {isOpen && mobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-t shadow-lg z-50">
            {mobileMenu}
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className={cn("flex items-center", className)}>
      {children}
    </nav>
  );
}

// Tabla responsive
interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  mobileView?: React.ReactNode;
}

export function ResponsiveTable({ 
  children, 
  className,
  mobileView 
}: ResponsiveTableProps) {
  const { isMobile } = useResponsive();

  if (isMobile && mobileView) {
    return (
      <div className={className}>
        {mobileView}
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      {children}
    </div>
  );
}

// Card responsive
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

export function ResponsiveCard({ 
  children, 
  className,
  padding = { mobile: 'p-4', tablet: 'p-6', desktop: 'p-8' }
}: ResponsiveCardProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getPadding = () => {
    if (isMobile) return padding.mobile;
    if (isTablet) return padding.tablet;
    if (isDesktop) return padding.desktop;
    return padding.mobile;
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border", getPadding(), className)}>
      {children}
    </div>
  );
}

// Botón responsive
interface ResponsiveButtonProps {
  children: React.ReactNode;
  className?: string;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  onClick?: () => void;
  disabled?: boolean;
}

export function ResponsiveButton({ 
  children, 
  className,
  sizes = { mobile: 'text-sm px-3 py-2', tablet: 'text-base px-4 py-2', desktop: 'text-base px-6 py-3' },
  onClick,
  disabled = false
}: ResponsiveButtonProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getButtonSize = () => {
    if (isMobile) return sizes.mobile;
    if (isTablet) return sizes.tablet;
    if (isDesktop) return sizes.desktop;
    return sizes.mobile;
  };

  return (
    <button
      className={cn(
        "bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
        getButtonSize(),
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Input responsive
interface ResponsiveInputProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

export function ResponsiveInput({ 
  className,
  placeholder,
  value,
  onChange,
  sizes = { mobile: 'text-sm px-3 py-2', tablet: 'text-base px-4 py-2', desktop: 'text-base px-4 py-3' }
}: ResponsiveInputProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getInputSize = () => {
    if (isMobile) return sizes.mobile;
    if (isTablet) return sizes.tablet;
    if (isDesktop) return sizes.desktop;
    return sizes.mobile;
  };

  return (
    <input
      className={cn(
        "border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        getInputSize(),
        className
      )}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

// Modal responsive
interface ResponsiveModalProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

export function ResponsiveModal({ 
  children, 
  className,
  isOpen,
  onClose,
  sizes = { mobile: 'w-full mx-4', tablet: 'w-11/12 max-w-md', desktop: 'w-11/12 max-w-lg' }
}: ResponsiveModalProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getModalSize = () => {
    if (isMobile) return sizes.mobile;
    if (isTablet) return sizes.tablet;
    if (isDesktop) return sizes.desktop;
    return sizes.mobile;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={cn("bg-white rounded-lg shadow-xl", getModalSize(), className)}>
        {children}
      </div>
    </div>
  );
} 