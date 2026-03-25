import { useState } from 'react';

const SESSION_KEY = 'gemini-api-key';

export function useSessionKey(): [string, (key: string) => void] {
  const [key, setKeyState] = useState<string>(
    () => sessionStorage.getItem(SESSION_KEY) ?? ''
  );
  const setKey = (newKey: string) => {
    sessionStorage.setItem(SESSION_KEY, newKey);
    setKeyState(newKey);
  };
  return [key, setKey];
}
