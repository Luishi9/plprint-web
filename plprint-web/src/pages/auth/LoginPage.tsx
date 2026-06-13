import { useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import logoImage from '@/assets/logo.png';

import './LoginPage.css';

interface LoginViewProps {
  onLoginSuccess?: (email: string) => void;
}

export default function LoginPage(props: LoginViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@plprint.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);

  const onSubmit = async (emailVal: string, passwordVal: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login(emailVal, passwordVal);
      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Credenciales incorrectas. Intenta de nuevo.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }
    setErrorMsg('');
    if (props.onLoginSuccess) {
      props.onLoginSuccess(email);
    } else {
      onSubmit(email, password);
    }
  };

  // Custom glow tracking
  const [glowPos, setGlowPos] = useState({ x: 150, y: 150 });
  
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="login-page w-full flex flex-col min-h-screen bg-[#e8fdff] dark:bg-[#05080b]">

      {/* TopNavBar */}
      <nav id="login-nav" className="bg-[#e8fdff] dark:bg-[#0d1118] flex justify-between items-center w-full px-8 py-4 z-50 border-b border-[#cce8ea] dark:border-[#1a2528]">
        <div id="brand-title" className="text-xl font-bold text-[#006765] dark:text-[#48b9b4]">PLPrint</div>
        <div id="nav-links" className="flex gap-6 items-center">
          <a className="text-[#3d4948] dark:text-[#b9eced] hover:text-[#008280] dark:hover:text-[#8df3f0] transition-colors text-sm font-semibold" href="#">Support</a>
          <a className="text-[#3d4948] dark:text-[#b9eced] hover:text-[#008280] dark:hover:text-[#8df3f0] transition-colors text-sm font-semibold" href="#">Documentation</a>
          <ThemeToggle />
        </div>
      </nav>

      <main id="login-main" className="w-full flex flex-col md:flex-row flex-1">

        {/* Left Side: Visual / Value Prop */}
        <section
          id="visual-section"
          className="hidden md:flex relative md:w-1/2 w-full bg-[#0b2628] dark:bg-[#03090a] overflow-hidden flex-col justify-center p-16"
          onMouseMove={handleMouseMove}
        >
          {/* Abstract Graphic Background */}
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

          {/* Content */}
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

          {/* Atmospheric micro-interaction element */}
          <div
            id="glow-cursor"
            className="pointer-events-none absolute w-96 h-96 bg-[#2e9e9b]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-60 transition-all duration-300 pointer-events-none"
            style={{
              left: `${glowPos.x}px`,
              top: `${glowPos.y}px`,
            }}
          />
        </section>

        {/* Right Side: Login Form */}
        <section id="form-section" className="w-full md:w-1/2 bg-[#ffffff] dark:bg-[#0d1118] flex flex-col p-8 md:p-12">
          {/* Brand Anchor */}
          <div className="flex flex-col items-center md:items-start space-y-4 mb-8">
            <div className="flex items-center justify-center rounded-lg overflow-hidden w-24 h-24">
              <img
                id="brand-logo"
                src={logoImage}
                alt="PLPrint Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-[#041f21] dark:text-[#f3f6f4]">Bienvenido de nuevo</h2>
              <p className="text-gray-500 dark:text-[#99a3a9] text-sm">Inicia sesión para gestionar tu centro de impresión</p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div id="error-alert" className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/30 mb-6">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-5 flex-1 flex flex-col">

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#041f21] dark:text-[#b9eced]" htmlFor="email">Correo electrónico</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#99a3a9]">
                    <Icon name="mail" size={20} />
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#05080b] border border-[#bcc9c8] dark:border-[#1a2528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006765]/15 dark:focus:ring-[#2e9e9b]/25 focus:border-[#006765] dark:focus:border-[#2e9e9b] transition-all text-sm text-[#041f21] dark:text-[#f3f6f4] placeholder:text-gray-400 dark:placeholder:text-[#99a3a9]"
                    id="email"
                    placeholder="nombre@printflow.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#041f21] dark:text-[#b9eced]" htmlFor="password">Contraseña</label>
                  <a className="text-xs text-[#006765] dark:text-[#48b9b4] font-semibold hover:underline" href="#">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#99a3a9]">
                    <Icon name="lock" size={20} />
                  </span>
                  <input
                    className="w-full pl-10 pr-12 py-3 bg-white dark:bg-[#05080b] border border-[#bcc9c8] dark:border-[#1a2528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006765]/15 dark:focus:ring-[#2e9e9b]/25 focus:border-[#006765] dark:focus:border-[#2e9e9b] transition-all text-sm text-[#041f21] dark:text-[#f3f6f4] placeholder:text-gray-400 dark:placeholder:text-[#99a3a9]"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-[#99a3a9] hover:text-gray-600 dark:hover:text-[#b9eced] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? <Icon name="visibility_off" size={16} /> : <Icon name="visibility" size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 text-[#006765] dark:text-[#2e9e9b] bg-white dark:bg-[#05080b] border-[#bcc9c8] dark:border-[#1a2528] rounded focus:ring-[#006765]/20 dark:focus:ring-[#2e9e9b]/30 cursor-pointer"
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="text-xs text-[#3d4948] dark:text-[#b9eced] select-none cursor-pointer" htmlFor="remember">Recuérdame</label>
              </div>

              {/* Primary Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2e9e9b] hover:bg-[#25827f] dark:bg-[#1a7a78] dark:hover:bg-[#2e9e9b] disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-base transition-all duration-200 transform active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Iniciando sesion...
                  </>
                ) : (
                  <>
                    Ingresar al sistema
                    <Icon name="arrow_forward" size={20} />
                  </>
                )}
              </button>
            </form>
          </section>
      </main>

      <footer
        className="w-full py-base px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-gutter bg-[#e8fdff] dark:bg-[#0d1118] border-t border-[#cce8ea] dark:border-[#1a2528]">
        <div className="font-label-md text-label-md text-[#041f21] dark:text-[#f3f6f4]">© 2024 PLPrint. All rights reserved.</div>
        <div className="flex gap-md">
          <a className="text-[#3d4948] dark:text-[#99a3a9] hover:text-[#008280] dark:hover:text-[#48b9b4] transition-colors font-body-sm text-body-sm cursor-pointer"
            href="#">Privacy Policy</a>
          <a className="text-[#3d4948] dark:text-[#99a3a9] hover:text-[#008280] dark:hover:text-[#48b9b4] transition-colors font-body-sm text-body-sm cursor-pointer"
            href="#">Terms of Service</a>
          <a className="text-[#3d4948] dark:text-[#99a3a9] hover:text-[#008280] dark:hover:text-[#48b9b4] transition-colors font-body-sm text-body-sm cursor-pointer"
            href="#">Support</a>
        </div>
      </footer>


      {/*
      <section className="login-shell" aria-label="Ingreso al sistema PLPrint">
        <div className="login-card">
          <div className="login-card-overlay" aria-hidden="true" />

          <header className="login-header">
            <div className="login-logo-wrap">
              <img src={loginLogo} alt="Logo PLPrint" className="login-logo" />
            </div>
            <h1>
              Bienvenido a <span>PLPrint</span>
            </h1>
            <p>Portal de inventario y ventas</p>
          </header>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="login-field">
              <label htmlFor="email">Identificacion (Correo)</label>
              <div className="login-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input id="email" type="email" {...register('email')} placeholder="usuario@plprint.com" />
              </div>
              {errors.email && <p className="login-error">{errors.email.message}</p>}
            </div>

            <div className="login-field">
              <label htmlFor="password">Codigo de Acceso</label>
              <div className="login-input-wrap">
                <Lock size={18} aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="login-error">{errors.password.message}</p>}
            </div>

            <div className="login-row">
              <label className="login-remember" htmlFor="remember-me">
                <input id="remember-me" type="checkbox" />
                <span>Recordar usuario</span>
              </label>
              <a href="/login" onClick={(event) => event.preventDefault()}>
                ¿Olvidaste tu contrasena?
              </a>
            </div>

            {error && <p className="login-error login-error-block">{error}</p>}

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? (
                <span className="login-spinner" aria-hidden="true" />
              ) : (
                <>
                  <Rocket size={18} aria-hidden="true" />
                  <span>Iniciar Sesion</span>
                </>
              )}
            </button>
          </form>

          <footer className="login-footer">Sistema de Gestion PLPrint v1.0.0</footer>
        </div>
      </section>
      */}


    </div>
  );
}


