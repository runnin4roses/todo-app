const COMPLETION_SOUND_URL = '/UI-click.wav';
const BUTTON_SOUND_URL = '/billiards.wav';
const COMPLETION_SOUND_VOLUME = 1;
const BUTTON_SOUND_VOLUME = 0.5;

const audioCache = new Map<string, HTMLAudioElement>();

function getAudio(url: string, volume: number) {
  let audio = audioCache.get(url);

  if (!audio) {
    audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = volume;
    audioCache.set(url, audio);
  }

  return audio;
}

function playSound(url: string, volume: number) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const audio = getAudio(url, volume);
    audio.volume = volume;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Browsers can still block playback outside a user gesture.
    });
  } catch {
    // Ignore unsupported environments.
  }
}

export function playCompletionSound() {
  playSound(COMPLETION_SOUND_URL, COMPLETION_SOUND_VOLUME);
}

export function playButtonSound() {
  playSound(BUTTON_SOUND_URL, BUTTON_SOUND_VOLUME);
}
