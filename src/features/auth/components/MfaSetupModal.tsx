import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Smartphone, Check, Copy, Download, AlertTriangle } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '../store/auth.store';
import { QRCodeSVG } from 'qrcode.react';

type SetupStep = 'intro' | 'qr' | 'verify' | 'success';

interface MfaSetupData {
  secret: string;
  uri: string;
  qr_code_url: string;
}

interface MfaSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function MfaSetupModal({ open, onOpenChange, onComplete }: MfaSetupModalProps) {
  const [step, setStep] = useState<SetupStep>('intro');
  const [setupData, setSetupData] = useState<MfaSetupData | null>(null);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!open) {
      setStep('intro');
      setCode(['', '', '', '', '', '']);
      setError('');
      setSetupData(null);
    }
  }, [open]);

  const handleStart = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient.post<MfaSetupData>('/api/auth/mfa/setup');
      setSetupData(data);
      setStep('qr');
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Error al generar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(0, 1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Ingrese el código completo de 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await apiClient.post('/api/auth/mfa/verify-setup', { totp_code: fullCode });
      setStep('success');
      setTimeout(() => {
        onComplete();
        onOpenChange(false);
      }, 2000);
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Código inválido. Intente nuevamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (setupData) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title=""
      className="max-w-md"
    >
      <div className="text-center">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-brand-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display mb-2">
                Configurar autenticación de dos factores
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Aumente la seguridad de su cuenta activando la verificación en dos pasos.
                Necesitará una aplicación como Google Authenticator o Microsoft Authenticator.
              </p>
              <p className="text-xs text-slate-400 mb-8">
                También puede usar códigos de respaldo enviados a su correo institucional.
              </p>

              <button
                onClick={handleStart}
                disabled={isLoading}
                className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    Comenzar configuración
                  </>
                )}
              </button>
            </motion.div>
          )}

          {step === 'qr' && setupData && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-xl font-bold text-slate-900 font-display mb-2">
                Escanee el código QR
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Abra su aplicación autenticadora y escanee este código
              </p>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                  <QRCodeSVG value={setupData.uri} size={200} />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-6">
                <code className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded font-mono max-w-[200px] truncate">
                  {setupData.secret}
                </code>
                <button
                  onClick={handleCopySecret}
                  className="p-1.5 text-slate-400 hover:text-brand-primary transition-colors bg-transparent border-none cursor-pointer"
                  title="Copiar secreto"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700">
                  Luego de escanear, ingrese el código de 6 dígitos:
                </p>

                <div className="flex justify-center gap-2 mb-4">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all bg-white"
                      style={{ borderColor: digit ? '#1e3a5f' : '#e2e8f0' }}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerify}
                  disabled={code.some((d) => !d) || isLoading}
                  className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Verificar y activar'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display mb-2">
                ¡MFA activado!
              </h2>
              <p className="text-sm text-slate-500">
                Su cuenta ahora está protegida con autenticación de dos factores.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

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
