'use client';

import { useState, useEffect } from 'react';

type SSEStatus = 'idle' | 'connecting' | 'streaming' | 'done' | 'error';

export function useSSE(url: string | null) {
  const [data, setData] = useState<string[]>([]);
  const [status, setStatus] = useState<SSEStatus>('idle');

  useEffect(() => {
    if (!url) return;
    let attempts = 0;
    let es: EventSource;

    function connect() {
      es = new EventSource(url!);
      setStatus('connecting');

      es.onmessage = (e) => {
        setData(prev => [...prev, e.data]);
        setStatus('streaming');
      };

      es.onerror = () => {
        es.close();
        if (attempts < 3) {
          attempts++;
          setTimeout(connect, 1000 * attempts);
        } else {
          setStatus('error');
        }
      };

      es.addEventListener('done', () => {
        es.close();
        setStatus('done');
      });
    }

    connect();
    return () => es?.close();
  }, [url]);

  function reset() {
    setData([]);
    setStatus('idle');
  }

  return { data, status, reset };
}
