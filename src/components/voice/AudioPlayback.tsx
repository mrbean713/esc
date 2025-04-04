
import React, { useState, useRef, useEffect } from 'react';

interface AudioPlaybackProps {
  audioBlob: Blob | null;
  onProgressChange?: (progress: number) => void;
}

const AudioPlayback: React.FC<AudioPlaybackProps> = ({ audioBlob, onProgressChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    const updateProgress = () => {
      if (audioElement.duration > 0) {
        const currentProgress = (audioElement.currentTime / audioElement.duration) * 100;
        if (onProgressChange) {
          onProgressChange(currentProgress);
        }
      }
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onProgressChange) {
        onProgressChange(0);
      }
    };
    
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);
    
    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [onProgressChange]);
  
  if (!audioBlob) return null;
  
  return (
    <div className="flex justify-center">
      <audio 
        ref={audioRef}
        controls 
        src={URL.createObjectURL(audioBlob)} 
        className="w-full max-w-md" 
        onTimeUpdate={() => {
          if (audioRef.current && onProgressChange) {
            const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            onProgressChange(progress);
          }
        }}
      />
    </div>
  );
};

export default AudioPlayback;
