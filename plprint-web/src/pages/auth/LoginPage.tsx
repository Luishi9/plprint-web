import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoginTopNav } from './LoginTopNav';
import { LoginVisualSection } from './LoginVisualSection';
import { LoginFormSection } from './LoginFormSection';

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

  return (
    <div className="login-page w-full flex flex-col min-h-dvh bg-[#e8fdff] dark:bg-[#05080b]">
      <LoginTopNav />

      <main id="login-main" className="w-full flex flex-col md:flex-row flex-1">
        <LoginVisualSection />

        <LoginFormSection
          email={email}
          password={password}
          rememberMe={rememberMe}
          loading={loading}
          errorMsg={errorMsg}
          showPassword={showPassword}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onRememberMeChange={setRememberMe}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onSubmit={handleFormSubmit}
        />
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
    </div>
  );
}
