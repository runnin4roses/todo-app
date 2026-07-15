import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'todo-app-sounds-enabled';

interface SoundPreferenceContextValue {
  soundsEnabled: boolean;
  toggleSounds: () => void;
}

const SoundPreferenceContext = createContext<SoundPreferenceContextValue | null>(
  null
);

function readStoredPreference() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export function SoundPreferenceProvider({ children }: { children: ReactNode }) {
  const [soundsEnabled, setSoundsEnabled] = useState(readStoredPreference);

  const toggleSounds = useCallback(() => {
    setSoundsEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      soundsEnabled,
      toggleSounds,
    }),
    [soundsEnabled, toggleSounds]
  );

  return (
    <SoundPreferenceContext.Provider value={value}>
      {children}
    </SoundPreferenceContext.Provider>
  );
}

export function useSoundPreference() {
  const context = useContext(SoundPreferenceContext);

  if (!context) {
    throw new Error(
      'useSoundPreference must be used within SoundPreferenceProvider'
    );
  }

  return context;
}
