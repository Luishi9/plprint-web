import { Icon } from '@/components/ui/Icon';
import logoImage from '@/assets/logo.png';

interface LoginFormSectionProps {
  email: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  errorMsg: string;
  showPassword: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onRememberMeChange: (v: boolean) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginFormSection({
  email, password, rememberMe, loading, errorMsg, showPassword,
  onEmailChange, onPasswordChange, onRememberMeChange, onTogglePassword, onSubmit,
}: LoginFormSectionProps) {
  return (
    <section id="form-section" className="w-full md:w-1/2 bg-[#ffffff] dark:bg-[#0d1118] flex flex-col p-8 md:p-12">
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

      {errorMsg && (
        <div id="error-alert" className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/30 mb-6">
          {errorMsg}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5 flex-1 flex flex-col">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#041f21] dark:text-[#b9eced]" htmlFor="email">Correo electrónico</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#99a3a9]">
              <Icon name="mail" size={20} />
            </span>
            <input
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#05080b] border border-[#bcc9c8] dark:border-[#1a2528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006765]/15 dark:focus:ring-[#2e9e9b]/25 focus:border-[#006765] dark:focus:border-[#2e9e9b] transition-colors text-sm text-[#041f21] dark:text-[#f3f6f4] placeholder:text-gray-400 dark:placeholder:text-[#99a3a9]"
              id="email"
              placeholder="nombre@printflow.com"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>
        </div>

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
              className="w-full pl-10 pr-12 py-3 bg-white dark:bg-[#05080b] border border-[#bcc9c8] dark:border-[#1a2528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006765]/15 dark:focus:ring-[#2e9e9b]/25 focus:border-[#006765] dark:focus:border-[#2e9e9b] transition-colors text-sm text-[#041f21] dark:text-[#f3f6f4] placeholder:text-gray-400 dark:placeholder:text-[#99a3a9]"
              id="password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-[#99a3a9] hover:text-gray-600 dark:hover:text-[#b9eced] transition-colors"
              onClick={onTogglePassword}
            >
              {showPassword ? <Icon name="visibility_off" size={16} /> : <Icon name="visibility" size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            className="w-4 h-4 text-[#006765] dark:text-[#2e9e9b] bg-white dark:bg-[#05080b] border-[#bcc9c8] dark:border-[#1a2528] rounded focus:ring-[#006765]/20 dark:focus:ring-[#2e9e9b]/30 cursor-pointer"
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
          />
          <label className="text-xs text-[#3d4948] dark:text-[#b9eced] select-none cursor-pointer" htmlFor="remember">Recuérdame</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2e9e9b] hover:bg-[#25827f] dark:bg-[#1a7a78] dark:hover:bg-[#2e9e9b] disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-base transition-colors duration-200 transform active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
  );
}
