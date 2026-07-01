import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useThemeStore } from '@/store/themeStore';

import { Toaster } from "sileo";

const App: React.FC = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <TooltipProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </TooltipProvider>
    </BrowserRouter>
  );
};

export default App;
