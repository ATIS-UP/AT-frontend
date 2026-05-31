import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { encuestasService } from '../services/encuestasService';
import { createCharFilter, CharType } from '@/src/lib/validation';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

type Step = 'documento' | 'responder' | 'confirmacion' | 'error';

export function ResponderEncuesta() {
  const { encuestaId } = useParams<{ encuestaId: string }>();

  const [documento, setDocumento] = useState('');
  const [step, setStep] = useState<Step>('documento');
  const [verificando, setVerificando] = useState(false);
  const [verificacion, setVerificacion] = useState<{
    existe: boolean;
    ya_respondio: boolean;
    puede_responder: boolean;
    estudiante_nombre: string | null;
    estudiante_id: string | null;
  } | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: encuesta, isLoading: loadingEncuesta } = useQuery({
    queryKey: ['encuesta-publica', encuestaId],
    queryFn: () => encuestasService.obtenerInfoPublica(encuestaId!),
    enabled: !!encuestaId,
  });

  const responderMutation = useMutation({
    mutationFn: () =>
      encuestasService.responderPublico(encuestaId!, {
        documento,
        respuestas: Object.entries(respuestas).map(([preguntaId, valor]) => ({
          pregunta_id: Number(preguntaId),
          valor,
        })),
      }),
    onSuccess: () => {
      setStep('confirmacion');
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Error al enviar la respuesta');
      setStep('error');
    },
  });

  const handleVerificar = async () => {
    if (!documento.trim()) return;
    setVerificando(true);
    setErrorMsg(null);
    try {
      const res = await encuestasService.verificarEstudiante(encuestaId!, documento.trim());
      setVerificacion(res);
      if (res.puede_responder) {
        setStep('responder');
        // init respuestas with empty values
        const init: Record<string, string> = {};
        (encuesta?.preguntas || []).forEach((p: any) => {
          init[String(p.id)] = '';
        });
        setRespuestas(init);
      } else if (res.ya_respondio) {
        setErrorMsg('Ya has respondido esta encuesta anteriormente.');
        setStep('error');
      } else if (!res.existe) {
        setErrorMsg('El documento no coincide con un estudiante registrado.');
        setStep('error');
      } else {
        setErrorMsg('No puedes responder esta encuesta en este momento.');
        setStep('error');
      }
    } catch {
      setErrorMsg('Error al verificar el documento. Intente nuevamente.');
      setStep('error');
    } finally {
      setVerificando(false);
    }
  };

  const handleResponder = () => {
    // validate all questions answered
    const allAnswered = Object.values(respuestas).every((v) => v.trim());
    if (!allAnswered) {
      setErrorMsg('Por favor responda todas las preguntas antes de enviar.');
      return;
    }
    responderMutation.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleVerificar();
  };

  if (loadingEncuesta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  if (!encuesta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Encuesta no encontrada</p>
          <p className="text-sm text-slate-400 mt-1">El enlace podría ser inválido o la encuesta ha sido eliminada.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* header */}
        <div className="text-center mb-8">
          <FileText className="w-10 h-10 text-brand-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-800">{encuesta.titulo}</h1>
          {encuesta.descripcion && (
            <p className="text-slate-500 mt-1 text-sm">{encuesta.descripcion}</p>
          )}
        </div>

        {step === 'documento' && (
          <Card className="p-6">
            <h2 className="font-semibold text-slate-700 mb-1">Verifica tu identidad</h2>
            <p className="text-sm text-slate-400 mb-4">
              Ingresa tu número de documento para verificar que eres un estudiante registrado.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(createCharFilter(CharType.DIGITS)(e.target.value))}
                onKeyDown={handleKeyDown}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                placeholder="Número de documento"
              />
              <Button onClick={handleVerificar} isLoading={verificando}>
                Verificar
              </Button>
            </div>
          </Card>
        )}

        {step === 'responder' && verificacion?.estudiante_nombre && (
          <>
            <Card className="p-4 mb-4 bg-green-50 border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  Verificado: <span className="font-bold">{verificacion.estudiante_nombre}</span>
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold text-slate-700 mb-4">Preguntas</h2>
              <div className="space-y-4">
                {(encuesta.preguntas || []).map((pregunta: any, idx: number) => (
                  <div key={pregunta.id}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {idx + 1}. {pregunta.texto}
                    </label>
                    {pregunta.tipo === 'texto_libre' && (
                      <textarea
                        value={respuestas[String(pregunta.id)] || ''}
                        onChange={(e) =>
                          setRespuestas((prev) => ({
                            ...prev,
                            [String(pregunta.id)]: e.target.value,
                          }))
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[60px] resize-none"
                        placeholder="Escribe tu respuesta..."
                        maxLength={500}
                      />
                    )}
                    {pregunta.tipo === 'opcion_multiple' && (
                      <div className="space-y-1">
                        {(pregunta.opciones || []).map((opt: string) => (
                          <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name={`pregunta_${pregunta.id}`}
                              value={opt}
                              checked={respuestas[String(pregunta.id)] === opt}
                              onChange={(e) =>
                                setRespuestas((prev) => ({
                                  ...prev,
                                  [String(pregunta.id)]: e.target.value,
                                }))
                              }
                              className="accent-brand-primary"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                    {pregunta.tipo === 'escala_likert' && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              setRespuestas((prev) => ({
                                ...prev,
                                [String(pregunta.id)]: String(val),
                              }))
                            }
                            className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${
                              respuestas[String(pregunta.id)] === String(val)
                                ? 'bg-brand-primary text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {errorMsg && (
                <p className="text-sm text-red-500 mt-3">{errorMsg}</p>
              )}

              <div className="flex justify-end mt-6">
                <Button onClick={handleResponder} isLoading={responderMutation.isPending}>
                  Enviar respuestas
                </Button>
              </div>
            </Card>
          </>
        )}

        {step === 'confirmacion' && (
          <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-1">¡Respuesta enviada!</h2>
            <p className="text-slate-500 text-sm">
              Tu respuesta ha sido registrada exitosamente. Gracias por participar.
            </p>
          </Card>
        )}

        {step === 'error' && (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-slate-700 font-medium mb-1">No se pudo completar la operación</p>
            <p className="text-sm text-slate-500 mb-4">{errorMsg}</p>
            <Button
              variant="outline"
              onClick={() => {
                setStep('documento');
                setErrorMsg(null);
                setVerificacion(null);
              }}
            >
              Intentar de nuevo
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
