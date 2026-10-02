import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { assignmentsRepo } from '@/database';
import { extractTextFromImage, isTextRecognitionAvailable } from '@/services/ocr';
import { deleteImported, pickPhoto } from '@/services/files';
import { initialScanState, scanReducer, type ScanEvent } from '@/scan/machine';
import { parseAssignment } from '@/scan/parser';
import { normalizeScanLanguage, type ScanLanguage } from '@/scan/language';
import type { ScanState } from '@/scan/types';

/**
 * Drives one scan, from photo to saved assignment.
 *
 * The screens are deliberately dumb: they render whatever `state.kind` says and send events. All of
 * the sequencing — take a photo, run recognition, decide whether the result is worth trusting, save
 * — lives here, so the two screens cannot disagree about where the flow is.
 *
 * Recognition is kicked off by an EFFECT on entering `processing`, not by the button handler. That
 * is what makes a double tap harmless (the machine ignores a second `usePhoto`) and what lets the
 * screen stay responsive while it runs.
 */
export function useScanAssignment() {
  const [state, dispatch] = useReducer(scanReducer, initialScanState);
  const [language, setLanguage] = useState<ScanLanguage>('');
  const [saving, setSaving] = useState(false);
  /** Photos imported during this scan, so an abandoned one can be cleaned up. */
  const imported = useRef<Set<string>>(new Set());
  const cancelled = useRef(false);

  useEffect(() => {
    return () => {
      cancelled.current = true;
    };
  }, []);

  const send = useCallback((event: ScanEvent) => dispatch(event), []);

  const capture = useCallback(async (source: 'camera' | 'library') => {
    const picked = await pickPhoto(source);
    // Null means cancelled or refused. pickPhoto has already explained refusal, and cancelling is
    // an ordinary thing to do, so neither is an error state — the screen simply stays put.
    if (!picked) return;
    imported.current.add(picked.uri);
    dispatch({ type: 'photoTaken', imageUri: picked.uri });
  }, []);

  // ---- recognition ---------------------------------------------------------------------------
  useEffect(() => {
    if (state.kind !== 'processing') return;
    let alive = true;
    const uri = state.imageUri;

    void (async () => {
      const outcome = await extractTextFromImage(uri, language);
      if (!alive || cancelled.current) return;
      if (outcome.ok) {
        dispatch({ type: 'ocrDone', text: outcome.result.text, confident: outcome.result.confident });
      } else {
        dispatch({ type: 'ocrFailed', reason: outcome.reason });
      }
    })();

    return () => {
      alive = false;
    };
  }, [state, language]);

  /**
   * Keeps the scan as an assignment.
   *
   * The ORIGINAL text and the EDITED text are stored separately (see scan/types.ts): `description`
   * is what the grown-up has corrected it to, `scanText` is what the engine read. The parser's
   * reading is stored beside them and replaces neither.
   */
  const save = useCallback(
    async (opts: { title: string; text: string; originalText: string; keepPhoto: boolean }) => {
      if (saving) return null;
      setSaving(true);
      try {
        const parsed = parseAssignment(opts.text);
        const photo = opts.keepPhoto ? imageOfState(state) : null;
        // A photo of a child's schoolwork is only kept when the family asked to keep it.
        if (!opts.keepPhoto) cleanUp(imported.current);

        const id = await assignmentsRepo.create({
          subjectId: null,
          title: opts.title.trim() || parsed.title,
          description: opts.text,
          kind: 'assignment',
          dateAssigned: today(),
          // Due TODAY by default, and this is a deliberate choice rather than an oversight. School
          // Mode's "Today's assignments" lists what is due by today, so a scan saved with no due
          // date is invisible in the one place a parent will look for it — which makes the whole
          // feature feel broken. A parent scanning a worksheet is almost always scanning tonight's
          // homework; if they are not, the date is editable in Parent Mode like any other.
          dueDate: today(),
          priority: 'medium',
          status: 'todo',
          notes: '',
          photoUri: photo,
          attachmentUri: null,
          attachmentName: null,
          scanText: opts.originalText,
          scanLanguage: normalizeScanLanguage(language),
          scanType: parsed.type,
        });
        if (photo) imported.current.delete(photo);
        dispatch({ type: 'saved', assignmentId: id });
        return id;
      } finally {
        setSaving(false);
      }
    },
    [state, language, saving],
  );

  /** Throws away any photo this scan imported. Called when the flow is abandoned. */
  const discard = useCallback(() => {
    cleanUp(imported.current);
    dispatch({ type: 'reset' });
  }, []);

  return {
    state,
    send,
    capture,
    save,
    discard,
    saving,
    language,
    setLanguage,
    /** False in Expo Go and on the web; the screens offer manual entry instead of a dead button. */
    canRecognise: isTextRecognitionAvailable(),
  };
}

/** Local date as 'YYYY-MM-DD' — the family's today, not UTC's. */
function today(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function imageOfState(state: ScanState): string | null {
  return 'imageUri' in state ? state.imageUri : null;
}

function cleanUp(uris: Set<string>): void {
  uris.forEach((uri) => deleteImported(uri));
  uris.clear();
}
