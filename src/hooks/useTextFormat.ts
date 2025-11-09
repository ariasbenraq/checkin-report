// src/hooks/useTextFormat.ts
import { useCallback, useMemo, useState } from 'react';
import { type TextFormat, applyTextFormat, cycleFormat } from '../utils/textFormatter';

export function useTextFormat(initial: TextFormat = 'capitalize') {
  const [format, setFormat] = useState<TextFormat>(initial);

  const toggleFormat = useCallback(() => {
    setFormat((f) => cycleFormat(f));
  }, []);

  const formatText = useCallback(
    (text: string) => applyTextFormat(text, format),
    [format]
  );

  const api = useMemo(
    () => ({ format, setFormat, toggleFormat, formatText }),
    [format, toggleFormat, formatText]
  );

  return api;
}
