import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Smartphone, Mail, Key, ArrowLeft, Clock } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

interface MfaVerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MethodOption {
  id: string;
  label: string;
  icon: React.ElementType;
  desc: string;
}

export function MfaVerifyModal({ open, onOpenChange }: MfaVerifyModalProps) {
  const [method, setMethod] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [emailCode, setEmailCode] = useState(['', '', '', '', '', '']);
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const [showMethodPicker, setShowMethodPicker] = useState(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { verifyMfaTotp, verifyMfaEmailOtp, verifyMfaBackupCode, requestMfaEmailOtp, mfaTempToken, mfaMethods } = useAuthStore();

  useEffect(() => {
    if (!open) {
      setMethod(null);
      setTotpCode(['', '', '', '', '', '']);
      setEmailCode(['', '', '', '', '', '']);
      setBackupCode('');
      setError('');
      setEmailSent(false);
      setCountdown(180);
      setShowMethodPicker(true);
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

  const methods: MethodOption[] = [];
  if (mfaMethods.includes('totp')) {
    methods.push({ id: 'totp', label: 'Código Authenticator', icon: Smartphone, desc: 'Ingrese el código de 6 dígitos' });
  }
  if (mfaMethods.includes('email')) {
    methods.push({ id: 'email', label: 'Código por correo', icon: Mail, desc: 'Reciba un código en su correo' });
  }
  if (mfaMethods.includes('backup_codes')) {
    methods.push({ id: 'backup_code', label: 'Código de respaldo', icon: Key, desc: 'Use uno de sus códigos de respaldo' });
  }

  const handleSelectMethod = (m: string) => {
    setMethod(m);
    setShowMethodPicker(false);
    if (m === 'email') {
      handleRequestEmailOtp();
    }
  };

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
    if (code.length !== 6) { setError('Ingrese el código completo de 6 dígitos'); return; }
    if (!mfaTempToken) { setError('Sesión expirada. Inicie sesión nuevamente.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await verifyMfaTotp(mfaTempToken, code);
      onOpenChange(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.detail || 'Código inválido. Intente nuevamente.');
      setTotpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally { setIsLoading(false); }
  };

  const handleRequestEmailOtp = async () => {
    if (!mfaTempToken) { setError('Sesión expirada. Inicie sesión nuevamente.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await requestMfaEmailOtp(mfaTempToken);
      setEmailSent(true);
      setCountdown(180);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err?.detail || 'Error al enviar el código');
    } finally { setIsLoading(false); }
  };

  const handleEmailOtpSubmit = async () => {
    const code = emailCode.join('');
    if (code.length !== 6) { setError('Ingrese el código completo de 6 dígitos'); return; }
    if (!mfaTempToken) { setError('Sesión expirada. Inicie sesión nuevamente.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await verifyMfaEmailOtp(mfaTempToken, code);
      onOpenChange(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.detail || 'Código inválido. Intente nuevamente.');
      setEmailCode(['', '', '', '', '', '']);
    } finally { setIsLoading(false); }
  };

  const handleBackupCodeSubmit = async () => {
    if (!backupCode.trim()) { setError('Ingrese un código de respaldo'); return; }
    if (!mfaTempToken) { setError('Sesión expirada. Inicie sesión nuevamente.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await verifyMfaBackupCode(mfaTempToken, backupCode.trim());
      onOpenChange(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.detail || 'Código inválido. Intente nuevamente.');
      setBackupCode('');
    } finally { setIsLoading(false); }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isCodeComplete = (arr: string[]) => arr.every((d) => d !== '');

  const renderMethodContent = () => {
    switch (method) {
      case 'totp':
        return (
          <>
            <p className="text-sm text-slate-500 mb-6">Ingrese el código de 6 dígitos de su aplicación autenticadora</p>
            <div className="flex justify-center gap-2 mb-6">
              {totpCode.map((digit, index) => (
                <input key={index} ref={(el) => { inputRefs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={(e) => handleTotpChange(index, e.target.value)} onKeyDown={(e) => handleTotpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all bg-white"
                  style={{ borderColor: digit ? '#1e3a5f' : '#e2e8f0' }} autoFocus={index === 0} />
              ))}
            </div>
            <button onClick={handleTotpSubmit} disabled={!isCodeComplete(totpCode) || isLoading}
              className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verificar código'}
            </button>
          </>
        );

      case 'email':
        return (
          <>
            <p className="text-sm text-slate-500 mb-6">Ingrese el código enviado a su correo institucional</p>
            {!emailSent ? (
              <button onClick={handleRequestEmailOtp} disabled={isLoading}
                className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Enviar código al correo'}
              </button>
            ) : (
              <>
                <div className="flex justify-center gap-2 mb-6">
                  {emailCode.map((digit, index) => (
                    <input key={index} ref={(el) => { inputRefs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleEmailCodeChange(index, e.target.value)} onKeyDown={(e) => handleEmailCodeKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all bg-white"
                      style={{ borderColor: digit ? '#1e3a5f' : '#e2e8f0' }} autoFocus={index === 0} />
                  ))}
                </div>
                <button onClick={handleEmailOtpSubmit} disabled={!isCodeComplete(emailCode) || isLoading}
                  className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verificar código'}
                </button>
                <button onClick={handleRequestEmailOtp} disabled={isLoading}
                  className="mt-2 text-xs text-slate-400 hover:text-brand-primary transition-colors bg-transparent border-none cursor-pointer">Reenviar código</button>
              </>
            )}
          </>
        );

      case 'backup_code':
        return (
          <>
            <p className="text-sm text-slate-500 mb-6">Ingrese uno de sus códigos de respaldo (formato: XXXX-XXXXXX)</p>
            <input type="text" value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
              placeholder="Ej: AB12-CD34EF"
              className="w-full px-4 py-3 text-center text-lg font-mono font-bold border-2 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all bg-white mb-6"
              style={{ borderColor: backupCode ? '#1e3a5f' : '#e2e8f0' }}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleBackupCodeSubmit(); }} />
            <button onClick={handleBackupCodeSubmit} disabled={!backupCode.trim() || isLoading}
              className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verificar código'}
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="" className="max-w-md">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-brand-primary" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display mb-1">Verificación en dos pasos</h2>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className={`text-sm font-mono ${countdown < 30 ? 'text-red-500' : 'text-slate-500'}`}>
            {formatTime(countdown)}
          </span>
        </div>

        {showMethodPicker && methods.length > 1 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-4">Seleccione un método de verificación:</p>
            {methods.map((m) => {
              const Icon = m.icon;
              return (
                <button key={m.id} onClick={() => handleSelectMethod(m.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left bg-transparent cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                    <p className="text-xs text-slate-500">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {renderMethodContent()}
            {methods.length > 1 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => { setShowMethodPicker(true); setMethod(null); setError(''); setEmailSent(false); }}
                  className="text-sm text-brand-primary hover:underline flex items-center justify-center gap-1.5 mx-auto bg-transparent border-none cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  Otro método
                </button>
              </div>
            )}
          </>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
