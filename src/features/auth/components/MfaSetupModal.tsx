import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Smartphone, Mail, Key, Check, Copy, Download, AlertTriangle } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { apiClient } from '@/lib/api-client';
import { QRCodeSVG } from 'qrcode.react';

type SetupStep = 'methods' | 'qr' | 'verify' | 'backup-codes' | 'success';

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

const METHOD_OPTIONS = [
  { id: 'totp', label: 'Código Authenticator (TOTP)', desc: 'Google Authenticator, Microsoft Authenticator o Authy', icon: Smartphone },
  { id: 'email', label: 'Código por correo electrónico', desc: 'Recibe un código de un solo uso en tu correo', icon: Mail },
  { id: 'backup_codes', label: 'Códigos de respaldo', desc: '8 códigos de un solo uso para emergencias', icon: Key },
];

export function MfaSetupModal({ open, onOpenChange, onComplete }: MfaSetupModalProps) {
  const [step, setStep] = useState<SetupStep>('methods');
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['totp']);
  const [setupData, setSetupData] = useState<MfaSetupData | null>(null);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codesSaved, setCodesSaved] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!open) {
      setStep('methods');
      setSelectedMethods(['totp']);
      setCode(['', '', '', '', '', '']);
      setError('');
      setSetupData(null);
      setBackupCodes([]);
      setCodesSaved(false);
      setCopied(false);
    }
  }, [open]);

  const toggleMethod = (methodId: string) => {
    setSelectedMethods((prev) =>
      prev.includes(methodId) ? prev.filter((m) => m !== methodId) : [...prev, methodId]
    );
  };

  const handleStart = async () => {
    if (selectedMethods.length === 0) {
      setError('Seleccione al menos un método de verificación');
      return;
    }
    setIsLoading(true);
    setError('');

    if (selectedMethods.includes('backup_codes')) {
      try {
        const resp = await apiClient.post<{ codes: string[]; remaining: number }>('/api/auth/mfa/generate-backup-codes');
        setBackupCodes(resp.codes);
      } catch (err: any) {
        setError(err?.detail || 'Error al generar códigos de respaldo');
        setIsLoading(false);
        return;
      }
    }

    if (selectedMethods.includes('totp')) {
      try {
        const data = await apiClient.post<MfaSetupData>('/api/auth/mfa/setup', { methods: selectedMethods });
        setSetupData(data);
        setStep('qr');
      } catch (err: any) {
        setError(err?.detail || err?.message || 'Error al generar la configuración');
        setIsLoading(false);
        return;
      }
    } else {
      const data = await apiClient.post<MfaSetupData>('/api/auth/mfa/setup', { methods: selectedMethods });
      setSetupData(data);
      if (backupCodes.length > 0) {
        setStep('backup-codes');
      } else {
        setStep('success');
        setTimeout(() => { onComplete(); onOpenChange(false); }, 2000);
      }
    }
    setIsLoading(false);
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
      if (backupCodes.length > 0) {
        setStep('backup-codes');
      } else {
        setStep('success');
        setTimeout(() => { onComplete(); onOpenChange(false); }, 2000);
      }
    } catch (err: any) {
      setError(err?.detail || 'Código inválido. Intente nuevamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishSetup = async () => {
    if (selectedMethods.includes('totp') && !setupData) {
      await handleStart();
    } else {
      setStep('success');
      setTimeout(() => { onComplete(); onOpenChange(false); }, 2000);
    }
  };

  const handleCopySecret = () => {
    if (setupData) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'satisup-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const methodLabels: Record<string, string> = {
    totp: 'Authenticator',
    email: 'Correo electrónico',
    backup_codes: 'Códigos de respaldo',
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="" className="max-w-md">
      <div className="text-center">
        <AnimatePresence mode="wait">
          {step === 'methods' && (
            <motion.div key="methods" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mx-auto w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-brand-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display mb-2">Configurar autenticación de dos factores</h2>
              <p className="text-sm text-slate-500 mb-6">Seleccione los métodos que desea utilizar para verificar su identidad.</p>

              <div className="space-y-3 mb-6 text-left">
                {METHOD_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedMethods.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleMethod(opt.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left bg-transparent cursor-pointer ${
                        isSelected ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                        <p className="text-xs text-slate-500">{opt.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-brand-primary bg-brand-primary' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleStart}
                disabled={selectedMethods.length === 0 || isLoading}
                className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Continuar</>
                )}
              </button>
            </motion.div>
          )}

          {step === 'qr' && setupData && (
            <motion.div key="qr" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-xl font-bold text-slate-900 font-display mb-2">Escanee el código QR</h2>
              <p className="text-sm text-slate-500 mb-6">Abra su aplicación autenticadora y escanee este código</p>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                  <QRCodeSVG value={setupData.uri} size={200} />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-6">
                <code className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded font-mono max-w-[200px] truncate">
                  {setupData.secret}
                </code>
                <button onClick={handleCopySecret} className="p-1.5 text-slate-400 hover:text-brand-primary transition-colors bg-transparent border-none cursor-pointer" title="Copiar secreto">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700">Luego de escanear, ingrese el código de 6 dígitos:</p>
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

          {step === 'backup-codes' && backupCodes.length > 0 && (
            <motion.div key="backup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <Key className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display mb-2">Códigos de respaldo</h2>
              <p className="text-sm text-slate-500 mb-4">
                Guarde estos códigos en un lugar seguro. Cada código solo se puede usar una vez.
              </p>

              <div className="bg-slate-50 rounded-lg p-4 mb-4 font-mono text-sm text-left">
                {backupCodes.map((c, i) => (
                  <div key={i} className="py-1 px-2 flex items-center gap-2">
                    <span className="text-slate-400 w-6 text-right">{i + 1}.</span>
                    <span className="text-slate-800 font-bold tracking-wider">{c}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={handleDownloadCodes}
                  className="flex-1 py-2 px-4 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary/5 transition-all bg-transparent cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar .txt
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(backupCodes.join('\n'));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex-1 py-2 px-4 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary/5 transition-all bg-transparent cursor-pointer flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <label className="flex items-center justify-center gap-2 mb-4 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={codesSaved}
                  onChange={(e) => setCodesSaved(e.target.checked)}
                  className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-slate-600">Ya guardé los códigos</span>
              </label>

              <button
                onClick={handleFinishSetup}
                disabled={!codesSaved || isLoading}
                className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Finalizar configuración'
                )}
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display mb-2">¡MFA activado!</h2>
              <p className="text-sm text-slate-500">
                Métodos activos: {selectedMethods.map((m) => methodLabels[m]).join(', ')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
