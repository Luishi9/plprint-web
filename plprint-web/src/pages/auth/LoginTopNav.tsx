import { ThemeToggle } from '@/components/ThemeToggle';

export function LoginTopNav() {
  return (
    <nav id="login-nav" className="bg-[#e8fdff] dark:bg-[#0d1118] flex justify-between items-center w-full px-8 py-4 z-50 border-b border-[#cce8ea] dark:border-[#1a2528]">
      <div id="brand-title" className="text-xl font-bold text-[#006765] dark:text-[#48b9b4]">PLPrint</div>
      <div id="nav-links" className="flex gap-6 items-center">
        <a className="text-[#3d4948] dark:text-[#b9eced] hover:text-[#008280] dark:hover:text-[#8df3f0] transition-colors text-sm font-semibold" href="#">Support</a>
        <a className="text-[#3d4948] dark:text-[#b9eced] hover:text-[#008280] dark:hover:text-[#8df3f0] transition-colors text-sm font-semibold" href="#">Documentation</a>
        <ThemeToggle />
      </div>
    </nav>
  );
}
