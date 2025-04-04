
export const getAudioDuration = (blob: Blob): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(blob);
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => {
      resolve(0); // Return 0 if we can't determine duration
    };
  });
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const playAudio = async (blob: Blob): Promise<void> => {
  const audio = new Audio(URL.createObjectURL(blob));
  try {
    await audio.play();
  } catch (error) {
    console.error('Error playing audio:', error);
    throw error;
  }
};
