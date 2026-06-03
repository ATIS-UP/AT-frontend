import { SortableList } from '@/shared/components/ui/SortableList';
import { SortableRow, DragHandle } from '@/shared/components/ui/SortableItem';
import { OPCION_MAX_LENGTH } from './encuestaUtils';

interface OpcionesEditorProps {
  preguntaId: string;
  opciones: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onReorder: (next: string[]) => void;
}

export function OpcionesEditor({
  preguntaId, opciones, onAdd, onUpdate, onRemove, onReorder,
}: OpcionesEditorProps) {
  return (
    <div className="ml-8 pl-3 border-l-2 border-slate-100 space-y-1.5">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Opciones</p>
      <SortableList
        items={opciones}
        onReorder={onReorder}
        getItemId={(_o, i) => `op_${preguntaId}_${i}`}
        className="space-y-1.5"
        renderItem={(opcion, idx) => (
          <SortableRow key={`op_${preguntaId}_${idx}`} id={`op_${preguntaId}_${idx}`}>
            {({ listeners, setHandleRef }) => (
              <div className="flex items-center gap-1.5">
                <DragHandle listeners={listeners} handleRef={setHandleRef} className="w-5 h-5" />
                <input
                  type="text"
                  value={opcion}
                  maxLength={OPCION_MAX_LENGTH}
                  onChange={(e) => onUpdate(idx, e.target.value)}
                  className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  placeholder={`Opción ${idx + 1}`}
                />
                {opciones.length > 1 && (
                  <button type="button" onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-600 transition-colors text-xs" title="Eliminar opción">
                    ✕
                  </button>
                )}
              </div>
            )}
          </SortableRow>
        )}
      />
      <button type="button" onClick={onAdd} className="text-[10px] text-brand-primary hover:text-brand-primary/80 font-semibold transition-colors">
        + Añadir opción
      </button>
    </div>
  );
}
