import { MouseEvent, useState } from 'react';

export function LoginVisualSection() {
  const [glowPos, setGlowPos] = useState({ x: 150, y: 150 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section
      id="visual-section"
      className="hidden md:flex relative md:w-1/2 w-full bg-[#0b2628] dark:bg-[#03090a] overflow-hidden flex-col justify-center p-16"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
        <img
          id="abstract-graphic"
          alt="Graphics de precisión"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          src="https://lh3.googleusercontent.com/aida/ADBb0uhl62BHfVzS7D2mS_cVgavDbz7hAdPdqLLGn2NXl1OhQg-lhwdB4qQNN_YiSToA7TtEw6thU5SYTWpzflc0OVQKGzS0r77u3Y7z42AHHtBp8dk2WDLaHL6dtDbAvsJGRVmBo8MhJng3JqR1LVw9Pw8XlLi6weh5In5qzLgreqaZNnl4CsJHyvZbRb2QGrtXEIg1Tu0D2Xn8KHyud-iQzPgn30YtscX6T81slinZs4w7333hEf2kZid-d6o"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0b2628] dark:from-[#03090a] via-transparent to-[#2e9e9b]/20"></div>
      </div>

      <div className="relative z-10 space-y-6 max-w-lg">
        <div className="flex items-center gap-2 text-[#8df3f0]">
          <span className="w-5 h-5 flex items-center justify-center">⚙️</span>
          <span className="text-xs tracking-widest uppercase font-semibold">Precision Operations</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          Precision in every print. Excellence in every sale.
        </h1>
        <p className="text-lg text-[#b9eced]/80">
          Optimiza tu centro de impresión con herramientas diseñadas para la máxima eficiencia y control operativo.
        </p>
      </div>

      <div
        id="glow-cursor"
        className="pointer-events-none absolute w-96 h-96 bg-[#2e9e9b]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-60 transition-opacity duration-300"
        style={{
          left: `${glowPos.x}px`,
          top: `${glowPos.y}px`,
        }}
      />
    </section>
  );
}
