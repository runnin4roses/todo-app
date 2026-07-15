import { useCallback } from 'react';
import { useSoundPreference } from '../context/SoundPreferenceContext';
import { playButtonSound } from '../utils/sounds';

export function useButtonClickSound() {
  const { soundsEnabled } = useSoundPreference();

  const playIfEnabled = useCallback(() => {
    if (soundsEnabled) {
      playButtonSound();
    }
  }, [soundsEnabled]);

  const withClickSound = useCallback(
    <E>(
      handler?: (event: E) => void
    ): ((event: E) => void) | undefined => {
      if (!handler) {
        return undefined;
      }

      return (event: E) => {
        playIfEnabled();
        handler(event);
      };
    },
    [playIfEnabled]
  );

  return { playIfEnabled, withClickSound, soundsEnabled };
}
