
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  ImagePlus,
  Trash2,
  Images,
  Save,
  Download,
  Loader2,
} from "lucide-react";

interface EvidenciaLocal {
  id: string;
  file: File;
  preview: string;
}

interface EvidenciaGuardada {
  id: string;
  registro_id: string;
  nombre: string;
  tipo: string;
  created_at: string | null;
  preview?: string;
}

interface RespuestaEvidencias {
  evidencias: EvidenciaGuardada[];
  total: number;
}

interface Props {
  registroId: string;
}

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

const API_BASE = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

function urlApi(ruta: string): string {
  return `${API_BASE}${ruta}`;
}

async function solicitar(
  ruta: string,
  opciones: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("sat_access_token");

  const headers = new Headers(opciones.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const respuesta = await fetch(urlApi(ruta), {
    ...opciones,
    headers,
    credentials: "same-origin",
  });

  if (!respuesta.ok) {
    let mensaje = `Error HTTP ${respuesta.status}`;

    try {
      const contenido = await respuesta.json();

      if (typeof contenido.detail === "string") {
        mensaje = contenido.detail;
      }
    } catch {
      // La respuesta no contiene un mensaje JSON.
    }

    if (respuesta.status === 401) {
      mensaje = "La sesión expiró. Inicia sesión nuevamente.";
    }

    if (respuesta.status === 403) {
      mensaje = "No tienes permisos para realizar esta operación.";
    }

    throw new Error(mensaje);
  }

  return respuesta;
}

export function EvidenciasFotograficas({ registroId }: Props) {
  const [imagenes, setImagenes] = useState<EvidenciaLocal[]>([]);
  const [guardadas, setGuardadas] = useState<EvidenciaGuardada[]>([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const urlsLocales = useRef(new Set<string>());
  const urlsGuardadas = useRef(new Set<string>());
  const solicitudActual = useRef(0);

  const cargarEvidencias = async () => {
    const numeroSolicitud = ++solicitudActual.current;

    setCargando(true);

    try {
      const respuesta = await solicitar(
        `/api/registros-casos/${registroId}/evidencias`
      );

      const datos: RespuestaEvidencias = await respuesta.json();

      const resultados = await Promise.all(
        datos.evidencias.map(async (evidencia) => {
          try {
            const archivo = await solicitar(
              `/api/registros-casos/evidencias/${evidencia.id}/archivo`
            );

            const blob = await archivo.blob();
            const preview = URL.createObjectURL(blob);

            return { ...evidencia, preview };
          } catch {
            return evidencia;
          }
        })
      );

      if (numeroSolicitud !== solicitudActual.current) {
        resultados.forEach((evidencia) => {
          if (evidencia.preview) {
            URL.revokeObjectURL(evidencia.preview);
          }
        });
        return;
      }

      urlsGuardadas.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      urlsGuardadas.current.clear();

      resultados.forEach((evidencia) => {
        if (evidencia.preview) {
          urlsGuardadas.current.add(evidencia.preview);
        }
      });

      setGuardadas(resultados);
    } catch (err) {
      if (numeroSolicitud === solicitudActual.current) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las evidencias."
        );
      }
    } finally {
      if (numeroSolicitud === solicitudActual.current) {
        setCargando(false);
      }
    }
  };

  useEffect(() => {
    void cargarEvidencias();

    return () => {
      solicitudActual.current += 1;

      urlsLocales.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      urlsLocales.current.clear();

      urlsGuardadas.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      urlsGuardadas.current.clear();
    };
  }, [registroId]);

  const seleccionarImagenes = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const archivos = Array.from(event.target.files || []);
    event.target.value = "";

    setError("");
    setMensaje("");

    const invalidos = archivos.some(
      (archivo) =>
        !["image/jpeg", "image/png"].includes(archivo.type) ||
        archivo.size > MAX_BYTES
    );

    if (invalidos) {
      setError(
        "Solo se permiten imágenes JPG o PNG de máximo 5 MB."
      );
      return;
    }

    if (
      guardadas.length + imagenes.length + archivos.length >
      MAX_IMAGES
    ) {
      setError(
        `Cada caso permite un máximo de ${MAX_IMAGES} fotografías.`
      );
      return;
    }

    const nuevas = archivos.map((file) => {
      const preview = URL.createObjectURL(file);
      urlsLocales.current.add(preview);

      return {
        id: crypto.randomUUID(),
        file,
        preview,
      };
    });

    setImagenes((actuales) => [...actuales, ...nuevas]);
  };

  const quitarImagen = (id: string) => {
    const imagen = imagenes.find((item) => item.id === id);

    if (imagen) {
      URL.revokeObjectURL(imagen.preview);
      urlsLocales.current.delete(imagen.preview);
    }

    setImagenes((actuales) =>
      actuales.filter((item) => item.id !== id)
    );
  };

  const guardarImagenes = async () => {
    if (imagenes.length === 0 || guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    const subidas: string[] = [];

    try {
      for (const imagen of imagenes) {
        const formulario = new FormData();
        formulario.append("file", imagen.file);

        await solicitar(
          `/api/registros-casos/${registroId}/evidencias`,
          {
            method: "POST",
            body: formulario,
          }
        );

        subidas.push(imagen.id);
      }

      setMensaje("Las fotografías se guardaron correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar todas las fotografías."
      );
    } finally {
      const subidasSet = new Set(subidas);

      imagenes.forEach((imagen) => {
        if (subidasSet.has(imagen.id)) {
          URL.revokeObjectURL(imagen.preview);
          urlsLocales.current.delete(imagen.preview);
        }
      });

      setImagenes((actuales) =>
        actuales.filter((imagen) => !subidasSet.has(imagen.id))
      );

      setGuardando(false);
      await cargarEvidencias();
    }
  };

  const descargarEvidencia = async (
    evidencia: EvidenciaGuardada
  ) => {
    try {
      setError("");

      const respuesta = await solicitar(
        `/api/registros-casos/evidencias/${evidencia.id}/archivo`
      );

      const blob = await respuesta.blob();
      const url = URL.createObjectURL(blob);

      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = evidencia.nombre;

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo descargar la fotografía."
      );
    }
  };

  const eliminarEvidencia = async (
    evidencia: EvidenciaGuardada
  ) => {
    const confirmado = window.confirm(
      `¿Deseas eliminar la fotografía "${evidencia.nombre}"?`
    );

    if (!confirmado) return;

    setEliminandoId(evidencia.id);
    setError("");
    setMensaje("");

    try {
      await solicitar(
        `/api/registros-casos/evidencias/${evidencia.id}`,
        { method: "DELETE" }
      );

      setMensaje("La fotografía fue eliminada.");
      await cargarEvidencias();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la fotografía."
      );
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
      <div className="flex items-center gap-3">
        <Images className="w-6 h-6 text-blue-600" />

        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Evidencias fotográficas
          </h3>

          <p className="text-sm text-slate-500">
            Adjunta y consulta las fotografías de este caso especial.
          </p>
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
        <ImagePlus className="w-10 h-10 mx-auto text-slate-400 mb-3" />

        <p className="text-sm text-slate-600 mb-3">
          Selecciona las imágenes que deseas adjuntar
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          multiple
          onChange={seleccionarImagenes}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={
            cargando ||
            guardando ||
            guardadas.length + imagenes.length >= MAX_IMAGES
          }
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium"
        >
          Seleccionar imágenes
        </button>

        <p className="text-xs text-slate-400 mt-3">
          JPG o PNG. Máximo 5 MB por imagen y 10 por caso.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {mensaje && (
        <p role="status" className="text-sm text-green-700">
          {mensaje}
        </p>
      )}

      {imagenes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700">
            Imágenes pendientes de guardar ({imagenes.length})
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagenes.map((imagen) => (
              <div
                key={imagen.id}
                className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50"
              >
                <img
                  src={imagen.preview}
                  alt={imagen.file.name}
                  className="w-full h-36 object-cover"
                />

                <div className="p-2 flex justify-between items-center gap-2">
                  <p className="text-xs text-slate-600 truncate">
                    {imagen.file.name}
                  </p>

                  <button
                    type="button"
                    disabled={guardando}
                    onClick={() => quitarImagen(imagen.id)}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    title="Quitar imagen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={guardando}
            onClick={guardarImagenes}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            {guardando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}

            {guardando ? "Guardando..." : "Guardar fotografías"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-semibold text-slate-700">
          Fotografías guardadas ({guardadas.length})
        </h4>

        {cargando ? (
          <p className="text-sm text-slate-500">
            Cargando fotografías...
          </p>
        ) : guardadas.length === 0 ? (
          <p className="text-sm text-slate-500">
            Este caso todavía no tiene fotografías guardadas.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {guardadas.map((evidencia) => (
              <div
                key={evidencia.id}
                className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50"
              >
                {evidencia.preview ? (
                  <img
                    src={evidencia.preview}
                    alt={evidencia.nombre}
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div className="h-36 flex items-center justify-center text-slate-400">
                    Imagen no disponible
                  </div>
                )}

                <div className="p-2 space-y-2">
                  <p
                    className="text-xs text-slate-600 truncate"
                    title={evidencia.nombre}
                  >
                    {evidencia.nombre}
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => descargarEvidencia(evidencia)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Descargar fotografía"
                      aria-label={`Descargar ${evidencia.nombre}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={eliminandoId === evidencia.id}
                      onClick={() => eliminarEvidencia(evidencia)}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      title="Eliminar fotografía"
                      aria-label={`Eliminar ${evidencia.nombre}`}
                    >
                      {eliminandoId === evidencia.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
