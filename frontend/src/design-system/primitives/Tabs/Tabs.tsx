'use client';

import { createContext, useContext, ReactNode } from 'react';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

export function Tabs({
  value,
  onValueChange,
  children,
  className = '',
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-warm-100 p-1 text-warm-600 ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = '',
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { value: selectedValue, onValueChange } = useTabs();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isSelected
          ? 'bg-white text-warm-900 shadow-sm'
          : 'text-warm-600 hover:text-warm-900'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className = '',
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { value: selectedValue } = useTabs();

  if (selectedValue !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  );
}
