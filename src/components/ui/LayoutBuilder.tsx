import { useFormContext } from "../widgets/Form";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

// elemento dentro row
type RowItem = {
  id: string;
  fieldName: string;
  colStart: number; // colonna di partenza
  colSpan: number; // colonne occupate
};

// interfaccia del ref che il parent può usare
export type LayoutBuilderHandle = {
  getValue: () => RowItem[]; // Ti ritorna lo stato corrente
  setValue: (items: RowItem[]) => void; // Imposta da fuori una lista di items
  clear: () => void; // Svuota la row
};

// props componente
type Props = {
  name: string; // nome campo form
  defaultSpan?: number; // span default col drop
  heightPx?: number; // altezza row
};

const MAX_COLS = 12;
const MAX_ITEMS = 12;

// clippa un numero fra min e max per non uscire dalle 12 colonne
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// prende quello che arriva dal drag (es "{workflow.nome_campo}") e tira fuori "nome_campo"
const extractFieldName = (raw: string) => {
  if (!raw) return "";
  const cleaned = raw.trim().replace(/^\{/, "").replace(/\}$/, "").trim(); // tolgo { } e spazi
  const parts = cleaned.split(".");
  const last = parts[parts.length - 1];
  return (last || cleaned).trim();
};

/** Converte una coordinata X (clientX) in una colonna 0..11 */
const clientXToCol = (clientX: number, rowRect: DOMRect) => {
  const x = clientX - rowRect.left;
  const colWidth = rowRect.width / MAX_COLS;
  return clamp(Math.floor(x / colWidth), 0, MAX_COLS - 1);
};

/** Generatore id */
const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const findFreeSpot = (desiredCol: number, span: number, items: RowItem[]): number | null => {
  const canPlaceAt = (start: number) => {
    const end = start + span; // esclusivo
    if (end > MAX_COLS) return false;

    // collisione se si sovrappone anche solo una colonna
    return !items.some((it) => {
      const a0 = start;
      const a1 = end;
      const b0 = it.colStart;
      const b1 = it.colStart + it.colSpan;
      return a0 < b1 && b0 < a1;
    });
  };

  for (let c = desiredCol; c <= MAX_COLS - span; c++) if (canPlaceAt(c)) return c;
  for (let c = 0; c <= MAX_COLS - span; c++) if (canPlaceAt(c)) return c;
  return null;
};

const tryMoveItem = (items: RowItem[], itemId: string, targetCol: number) => {
  const current = items.find((i) => i.id === itemId);
  if (!current) return items;

  const others = items.filter((i) => i.id !== itemId);
  const start = clamp(targetCol, 0, MAX_COLS - current.colSpan);

  const free = findFreeSpot(start, current.colSpan, others);
  if (free === null) return items;

  return items.map((i) => (i.id === itemId ? { ...i, colStart: free } : i));
};

const resizeItemToFit = (items: RowItem[], itemId: string, targetSpan: number) => {
  const current = items.find((i) => i.id === itemId);
  if (!current) return items;

  const others = items.filter((i) => i.id !== itemId);
  const maxSpanFromStart = MAX_COLS - current.colStart;
  let span = clamp(targetSpan, 1, maxSpanFromStart);

  const collides = (spanTry: number) => {
    const a0 = current.colStart;
    const a1 = current.colStart + spanTry;
    return others.some((it) => {
      const b0 = it.colStart;
      const b1 = it.colStart + it.colSpan;
      return a0 < b1 && b0 < a1;
    });
  };

  while (span > 1 && collides(span)) span--;
  if (collides(span)) return items; // anche 1 collide => non cambio

  return items.map((i) => (i.id === itemId ? { ...i, colSpan: span } : i));
};

/**
 * Se non c'è spazio, restringe "l'elemento più vicino" abbastanza (se possibile)
 * e ritorna: items aggiornati + start col dove inserire il nuovo.
 *
 * Strategia: scegli l'item più vicino alla col di drop (centro più vicino),
 * se quell'item ha abbastanza colSpan per liberare `needCols` (senza scendere sotto 1),
 * lo restringi "a destra" e metti il nuovo item nello spazio liberato (alla fine dell'item ristretto).
 */
const makeRoomByShrinkingNearest = (
  items: RowItem[],
  dropCol: number,
  needCols: number
): { nextItems: RowItem[]; insertCol: number } | null => {
  if (needCols <= 0) return null;

  const candidates = items
    .map((it) => {
      const center = it.colStart + it.colSpan / 2;
      const dist = Math.abs(center - (dropCol + 0.5));
      return { it, dist };
    })
    .sort((a, b) => a.dist - b.dist)
    .map((x) => x.it);

  for (const it of candidates) {
    const canShrink = it.colSpan - 1; // non scendo sotto 1
    if (canShrink < needCols) continue;

    const newSpan = it.colSpan - needCols;
    const insertCol = it.colStart + newSpan;

    // insertCol..insertCol+needCols è dentro il vecchio spazio dell'item -> non collide con altri
    if (insertCol < 0 || insertCol + needCols > MAX_COLS) continue;

    const nextItems = items.map((x) => (x.id === it.id ? { ...x, colSpan: newSpan } : x));
    return { nextItems, insertCol };
  }

  return null;
};

export const LayoutBuilder = forwardRef<LayoutBuilderHandle, Props>(
  ({ name, defaultSpan = 1, heightPx = 100 }, ref) => {
    const rowRef = useRef<HTMLDivElement | null>(null);

    const { value, handleChange } = useFormContext({ name, defaultValue: [] });
    const items: RowItem[] = Array.isArray(value) ? value : [];

    const setItems = (updater: RowItem[] | ((prev: RowItem[]) => RowItem[])) => {
      const prev = items;
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      handleChange({ target: { name, value: next } });
    };

    // Drag interno: quale item sto spostando
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Resize: quale item sto ridimensionando
    const [resizing, setResizing] = useState<{
      id: string;
      startClientX: number;
      startSpan: number;
    } | null>(null);

    // Messaggi (es. se già 12 elementi)
    const [notice, setNotice] = useState<string>("");
    const noticeTimerRef = useRef<number | null>(null);
    const showNotice = (msg: string) => {
      setNotice(msg);
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = window.setTimeout(() => setNotice(""), 2500);
    };

    useEffect(() => {
      return () => {
        if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      };
    }, []);

    // Espongo metodi al parent
    useImperativeHandle(ref, () => ({
      getValue: () => items,
      setValue: (newItems) => setItems(newItems),
      clear: () => setItems([]),
    }));

    // Righe verticali per far capire le 12 colonne
    const gridLines = useMemo(() => Array.from({ length: MAX_COLS }, (_, i) => i), []);

    // DRAG & DROP: quando trascini una cosa sopra la row, serve permettere il drop
    const handleDragOverRow = (e: React.DragEvent) => {
      e.preventDefault(); // senza questo, il drop non funziona
    };

    // DRAG & DROP: quando lasci cadere un elemento nella row
    const handleDropOnRow = (e: React.DragEvent) => {
      e.preventDefault();

      const internalId = e.dataTransfer.getData("application/x-layoutbuilder-internal");
      if (internalId) {
        setDraggingId(null);
        return;
      }

      // limite massimo: 12 elementi
      if (items.length >= MAX_ITEMS) {
        showNotice("Hai già 12 elementi nella row: rimuovine uno prima di aggiungerne un altro.");
        return;
      }

      const rowEl = rowRef.current;
      if (!rowEl) return;

      const rowRect = rowEl.getBoundingClientRect();
      const dropCol = clientXToCol(e.clientX, rowRect);

      // Leggo label dall’oggetto trascinato
      const raw = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("label") || "";
      const fieldName = extractFieldName(raw) || "unknown";

      const span = clamp(defaultSpan, 1, MAX_COLS);
      const desiredStart = clamp(dropCol, 0, MAX_COLS - span);

      // 1) Provo normale: metto in uno spot libero
      const free = findFreeSpot(desiredStart, span, items);
      if (free !== null) {
        setItems((prev) => [...prev, { id: uid(), fieldName, colStart: free, colSpan: span }]);
        return;
      }

      // 2) Se pieno (nessun buco), restringo l'elemento più vicino e inserisco sempre
      const room = makeRoomByShrinkingNearest(items, dropCol, span);
      if (!room) {
        // Caso raro: nessun item ha abbastanza span per liberare `span` colonne senza scendere sotto 1
        showNotice("Nessuno spazio: non posso restringere abbastanza gli elementi per inserire questo campo.");
        return;
      }

      setItems((prev) => {
        // ricalcolo su prev per sicurezza
        if (prev.length >= MAX_ITEMS) {
          showNotice("Hai già 12 elementi nella row: rimuovine uno prima di aggiungerne un altro.");
          return prev;
        }

        const roomPrev = makeRoomByShrinkingNearest(prev, dropCol, span);
        if (!roomPrev) {
          showNotice("Nessuno spazio: non posso restringere abbastanza gli elementi per inserire questo campo.");
          return prev;
        }

        const newItem: RowItem = {
          id: uid(),
          fieldName,
          colStart: roomPrev.insertCol,
          colSpan: span,
        };
        return [...roomPrev.nextItems, newItem];
      });
    };

    // DRAG INTERNO: inizio a trascinare un box già dentro la row
    const handleItemDragStart = (id: string) => (e: React.DragEvent) => {
      setDraggingId(id);
      e.dataTransfer.setData("application/x-layoutbuilder-internal", id);
      e.dataTransfer.effectAllowed = "move";
    };

    // DRAG INTERNO: durante il drag sopra la row, aggiorno la posizione a “snap”
    const handleRowDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggingId) return;

      const rowEl = rowRef.current;
      if (!rowEl) return;
      const rect = rowEl.getBoundingClientRect();
      const col = clientXToCol(e.clientX, rect);

      setItems((prev) => tryMoveItem(prev, draggingId, col));
    };

    // DRAG INTERNO: stop drag
    const handleRowDragEnd = () => setDraggingId(null);

    // RESIZE: mouse down sulla maniglia (inizio ridimensionamento)
    const handleResizeMouseDown = (id: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const it = items.find((x) => x.id === id);
      if (!it) return;

      setResizing({
        id,
        startClientX: e.clientX,
        startSpan: it.colSpan,
      });
    };

    // RESIZE: mentre muovo il mouse, trasformo deltaX in deltaColonne
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!resizing) return;
      const rowEl = rowRef.current;
      if (!rowEl) return;

      const rect = rowEl.getBoundingClientRect();
      const colWidth = rect.width / MAX_COLS;

      const deltaX = e.clientX - resizing.startClientX;
      const deltaCols = Math.round(deltaX / colWidth);

      const targetSpan = resizing.startSpan + deltaCols;
      setItems((prev) => resizeItemToFit(prev, resizing.id, targetSpan));
    };

    // RESIZE: stop ridimensionamento
    const handleMouseUp = () => {
      if (resizing) setResizing(null);
    };

    // Rimuovi item
    const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

    return (
      <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        {/* Messaggio */}
        {notice && (
          <div
            style={{
              marginBottom: 8,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.04)",
              fontSize: 12,
              opacity: 0.95,
            }}
          >
            {notice}
          </div>
        )}

        {/* ROW: area droppabile + griglia 12 colonne */}
        <div
          ref={rowRef}
          onDragOver={(e) => {
            // Permetto sia il drop esterno sia il drag interno
            handleDragOverRow(e);
            handleRowDragOver(e);
          }}
          onDrop={handleDropOnRow}
          onDragEnd={handleRowDragEnd}
          style={{
            position: "relative",
            height: heightPx,
            borderRadius: 12,
            border: "2px dashed rgba(255, 255, 255, 0.25)",
            background: "rgba(0,0,0,0.02)",
            overflow: "hidden",
          }}
        >
          {/* Linee griglia */}
          {gridLines.map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${(i / MAX_COLS) * 100}%`,
                width: 1,
                background: "rgba(255, 255, 255, 0.06)",
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Items posizionati a colonne */}
          {items.map((it) => (
            <div
              key={it.id}
              draggable
              onDragStart={handleItemDragStart(it.id)}
              style={{
                position: "absolute",
                top: 12,
                bottom: 12,
                left: `${(it.colStart / MAX_COLS) * 100}%`,
                width: `${(it.colSpan / MAX_COLS) * 100}%`,
                padding: 10,
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.18)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                cursor: draggingId === it.id ? "grabbing" : "grab",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
              }}
              title="Trascina per spostare"
            >
              {/* Testo centrale */}
              <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.9 }}>{it.fieldName}</div>

              {/* Bottone remove (in alto a destra) */}
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                style={{
                  position: "absolute",
                  border: "none",
                  top: 3,
                  right: 3,
                  color: "white",
                  background: "rgba(255, 255, 255, 0.03)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
                title="Rimuovi"
              >
                ×
              </button>

              {/* Maniglia resize */}
              <div
                onMouseDown={handleResizeMouseDown(it.id)}
                style={{
                  position: "absolute",
                  right: 4,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 10,
                  height: 30,
                  borderRadius: 6,
                  background: "rgba(255, 255, 255, 0.12)",
                  cursor: "ew-resize",
                }}
                title="Trascina per ridimensionare"
              />
            </div>
          ))}

          {/* se vuoto */}
          {items.length === 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              Trascina un elemento qui dentro
            </div>
          )}
        </div>
      </div>
    );
  }
);
