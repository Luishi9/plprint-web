import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-[#3d4948] dark:text-[#b9eced] hover:text-[#008280] dark:hover:text-[#8df3f0] hover:bg-[#ddf9fb] dark:hover:bg-[#1a2528] transition-colors"
      aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
