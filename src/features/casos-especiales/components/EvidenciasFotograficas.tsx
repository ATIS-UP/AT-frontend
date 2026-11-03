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
import { casosEspecialesService } from "../services/casosEspecialesService";
import {
  useArchivoEvidencia,
  useEliminarEvidencia,
  useEvidenciasCaso,
  useSubirEvidencia,
} from "../hooks/useEvidenciasCaso";
import type { EvidenciaCaso } from "../types/casosEspeciales.types";

interface EvidenciaLocal {
  id: string;
  file: File;
  preview: string;
}

interface Props {
  registroId: string;
}

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

// apiClient lanza ApiError ({ message }) o, para HTTPException del backend, el cuerpo { detail }.
function mensajeError(err: unknown, porDefecto: string): string {
  const e = err as { message?: unknown; detail?: unknown } | null;

  if (typeof e?.message === "string" && e.message) return e.message;
  if (typeof e?.detail === "string" && e.detail) return e.detail;

  return porDefecto;
}

function MiniaturaEvidencia({ evidencia }: { evidencia: EvidenciaCaso }) {
  const { data: blob, isLoading } = useArchivoEvidencia(evidencia.id);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  if (preview) {
    return (
      <img
        src={preview}
        alt={evidencia.nombre}
        className="w-full h-36 object-cover"
      />
    );
  }

  return (
    <div className="h-36 flex items-center justify-center text-slate-400">
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        "Imagen no disponible"
      )}
    </div>
  );
}

export function EvidenciasFotograficas({ registroId }: Props) {
  const [imagenes, setImagenes] = useState<EvidenciaLocal[]>([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const urlsLocales = useRef(new Set<string>());

  const {
    data,
    isLoading: cargando,
    error: errorCarga,
  } = useEvidenciasCaso(registroId);
  const subirEvidencia = useSubirEvidencia();
  const eliminarEvidencia = useEliminarEvidencia();

  const guardadas = data?.evidencias ?? [];
  const eliminandoId = eliminarEvidencia.isPending
    ? eliminarEvidencia.variables?.evidenciaId
    : null;
  const errorVisible =
    error ||
    (errorCarga
      ? mensajeError(errorCarga, "No se pudieron cargar las evidencias.")
      : "");

  useEffect(() => {
    const urls = urlsLocales.current;

    return () => {
      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      urls.clear();
    };
  }, []);

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
        await subirEvidencia.mutateAsync({
          registroId,
          file: imagen.file,
        });

        subidas.push(imagen.id);
      }

      setMensaje("Las fotografías se guardaron correctamente.");
    } catch (err) {
      setError(
        mensajeError(err, "No se pudieron guardar todas las fotografías.")
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
    }
  };

  const descargarEvidencia = async (
    evidencia: EvidenciaCaso
  ) => {
    try {
      setError("");

      const blob = await casosEspecialesService.obtenerArchivoEvidencia(
        evidencia.id
      );
      const url = URL.createObjectURL(blob);

      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = evidencia.nombre;

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(mensajeError(err, "No se pudo descargar la fotografía."));
    }
  };

  const confirmarEliminacion = async (
    evidencia: EvidenciaCaso
  ) => {
    const confirmado = window.confirm(
      `¿Deseas eliminar la fotografía "${evidencia.nombre}"?`
    );

    if (!confirmado) return;

    setError("");
    setMensaje("");

    try {
      await eliminarEvidencia.mutateAsync({
        evidenciaId: evidencia.id,
        registroId,
      });

      setMensaje("La fotografía fue eliminada.");
    } catch (err) {
      setError(mensajeError(err, "No se pudo eliminar la fotografía."));
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

      {errorVisible && (
        <p role="alert" className="text-sm text-red-600">
          {errorVisible}
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
                <MiniaturaEvidencia evidencia={evidencia} />

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
                      onClick={() => confirmarEliminacion(evidencia)}
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
