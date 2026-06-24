import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Smartphone, Mail, ArrowLeft, Clock } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

interface MfaVerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type MfaMethod = 'totp' | 'email';

export function MfaVerifyModal({ open, onOpenChange }: MfaVerifyModalProps) {
  const [method, setMethod] = useState<MfaMethod>('totp');
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [emailCode, setEmailCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(180);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { verifyMfaTotp, verifyMfaEmailOtp, requestMfaEmailOtp, mfaTempToken } = useAuthStore();

  useEffect(() => {
    if (!open) {
      setTotpCode(['', '', '', '', '', '']);
      setEmailCode(['', '', '', '', '', '']);
      setError('');
      setEmailSent(false);
      setMethod('totp');
      setCountdown(180);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onOpenChange(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [open, onOpenChange]);

  const handleTotpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...totpCode];
    newCode[index] = value.slice(0, 1);
    setTotpCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleTotpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !totpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleEmailCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...emailCode];
    newCode[index] = value.slice(0, 1);
    setEmailCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleEmailCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !emailCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleTotpSubmit = async () => {
    const code = totpCode.join('');
    if (code.length !== 6) {
      setError('Ingrese el código completo de 6 dígitos');
      return;
    }

    if (!mfaTempToken) {
      setError('Sesión expirada. Inicie sesión nuevamente.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyMfaTotp(mfaTempToken, code);
      onOpenChange(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Código inválido. Intente nuevamente.');
      setTotpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestEmailOtp = async () => {
    if (!mfaTempToken) {
      setError('Sesión expirada. Inicie sesión nuevamente.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await requestMfaEmailOtp(mfaTempToken);
      setEmailSent(true);
      setCountdown(180);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Error al enviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailOtpSubmit = async () => {
    const code = emailCode.join('');
    if (code.length !== 6) {
      setError('Ingrese el código completo de 6 dígitos');
      return;
    }

    if (!mfaTempToken) {
      setError('Sesi\u00f3n expirada. Inicie sesi\u00f3n nuevamente.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyMfaEmailOtp(mfaTempToken, code);
      onOpenChange(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.detail || err?.message || 'C\u00f3digo inv\u00e1lido. Intente nuevamente.');
      setEmailCode(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isCodeComplete = (code: string[]) => code.every((d) => d !== '');

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="" className="max-w-md">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-brand-primary" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display mb-1">
          Verificación en dos pasos
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {method === 'totp'
            ? 'Ingrese el código de 6 dígitos de su aplicación autenticadora'
            : 'Ingrese el código enviado a su correo institucional'}
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className={`text-sm font-mono ${countdown < 30 ? 'text-red-500' : 'text-slate-500'}`}>
            {formatTime(countdown)}
          </span>
        </div>

        {/* Method tabs */}
        {method === 'totp' ? (
          <>
            {/* TOTP input */}
            <div className="flex justify-center gap-2 mb-6">
              {totpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleTotpChange(index, e.target.value)}
                  onKeyDown={(e) => handleTotpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all bg-white"
                  style={{ borderColor: digit ? '#1e3a5f' : '#e2e8f0' }}
                />
              ))}
            </div>

            <button
              onClick={handleTotpSubmit}
              disabled={!isCodeComplete(totpCode) || isLoading}
              className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  Verificar código
                </>
              )}
            </button>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => { setMethod('email'); setEmailSent(false); }}
                className="text-sm text-brand-primary hover:underline flex items-center justify-center gap-1.5 mx-auto bg-transparent border-none cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                Enviar código a mi correo
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Email OTP flow */}
            {!emailSent ? (
              <button
                onClick={handleRequestEmailOtp}
                disabled={isLoading}
                className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Enviar código al correo
                  </>
                )}
              </button>
            ) : (
              <>
                <div className="flex justify-center gap-2 mb-6">
                  {emailCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleEmailCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleEmailCodeKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all bg-white"
                      style={{ borderColor: digit ? '#1e3a5f' : '#e2e8f0' }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleEmailOtpSubmit}
                  disabled={!isCodeComplete(emailCode) || isLoading}
                  className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Verificar código
                    </>
                  )}
                </button>

                <button
                  onClick={handleRequestEmailOtp}
                  disabled={isLoading}
                  className="mt-2 text-xs text-slate-400 hover:text-brand-primary transition-colors bg-transparent border-none cursor-pointer"
                >
                  Reenviar código
                </button>
              </>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => setMethod('totp')}
                className="text-sm text-brand-primary hover:underline flex items-center justify-center gap-1.5 mx-auto bg-transparent border-none cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                Usar aplicación autenticadora
              </button>
            </div>
          </>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
