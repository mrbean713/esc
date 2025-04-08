import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { cloneVoice } from '@/services/cartesiaApi';
import { toast } from 'sonner';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { useIsMobile } from '@/hooks/use-mobile';

interface VoiceRecorderPanelProps {
  onAudioReady: (audioBlob: Blob) => void;
  cloneMode?: 'similarity' | 'stability';
}

const VoiceRecorderPanel: React.FC<VoiceRecorderPanelProps> = ({ 
  cloneMode = 'similarity', 
  onAudioReady 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const waveformRef = useRef<WaveSurfer | null>(null);
  const waveformDivRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (waveformDivRef.current) {
      waveformRef.current = WaveSurfer.create({
        container: waveformDivRef.current,
        waveColor: '#121212',
        progressColor: '#FF5252',
        cursorWidth: 0,
        height: isMobile ? 40 : 80,
        normalize: true,
        barWidth: isMobile ? 1 : 4,
        barGap: isMobile ? 1 : 3,
        barRadius: 0,
      });

      waveformRef.current.on('finish', () => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (waveformRef.current) {
        waveformRef.current.destroy();
      }
    };
  }, [isMobile]);

  useEffect(() => {
    if (audioBlob) {
      onAudioReady(audioBlob);
    }
  }, [audioBlob, onAudioReady]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        if (waveformRef.current) {
          waveformRef.current.loadBlob(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const togglePlayback = () => {
    if (!waveformRef.current || !audioBlob) return;
    
    if (isPlaying) {
      waveformRef.current.pause();
      setIsPlaying(false);
    } else {
      waveformRef.current.play();
      setIsPlaying(true);
    }
  };

  const playAudio = () => {
    if (!audioBlob) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audioURL = URL.createObjectURL(audioBlob);
    audioRef.current.src = audioURL;
    
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      audioRef.current!.onended = () => {
        setIsPlaying(false);
      };
    }).catch(error => {
      console.error("Error playing audio:", error);
      toast.error("Failed to play audio");
    });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const getRecommendedText = () => {
    return "A 5 second audio clip is ideal for creating high similarity voice clones.";
  };

  return (
    <div className="space-y-2 md:space-y-6 w-full max-w-full overflow-hidden">
      <div className="text-sm md:text-lg font-bold tracking-tighter">
        {isRecording ? "Recording in progress..." : "Record a voice clip"}
      </div>
      
      {isRecording ? (
        <RainbowButton 
          onClick={stopRecording} 
          className="w-full px-4 py-2 md:px-6 md:py-4 font-white tracking-wide flex items-center justify-center gap-2 md:gap-3 bg-red-500 text-sm md:text-base"
        >
          <span className="flex items-center gap-2">
          <Square className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span>Stop Recording</span>
          </span>
        </RainbowButton>
      ) : (
        <RainbowButton 
          onClick={startRecording} 
          className="w-full px-4 py-2 md:px-6 md:py-4 font-white tracking-wide flex items-center justify-center gap-2 md:gap-3 bg-red-500 text-sm md:text-base"
        >
          <span className="flex items-center gap-2">
            <Mic className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span>Record</span>
          </span>
        </RainbowButton>
      )}
      
      <div className="bg-gray-100 border border-gray-200 rounded-lg md:rounded-xl p-2 md:p-4 text-xs md:text-base font-bold text-center">
        {getRecommendedText()}
      </div>
      
      {audioBlob && (
        <div className="space-y-2 md:space-y-4 w-full max-w-full overflow-hidden">
          <div 
            ref={waveformDivRef} 
            className="w-full border border-gray-200 rounded-lg md:rounded-xl bg-white p-2 md:p-4"
          />
          
          <div className="flex justify-center">
            <button
              className="bg-black border border-gray-200 rounded-lg md:rounded-xl text-white px-3 py-1 md:px-6 md:py-3 text-xs md:text-base font-bold uppercase tracking-wide flex items-center justify-center gap-1 md:gap-3"
              onClick={isPlaying ? stopAudio : playAudio}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3 h-3 md:w-5 md:h-5" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 md:w-5 md:h-5" />
                  Play
                </>
              )}
            </button>
          </div>
          
          <div className="mt-3 md:mt-5 text-left">
            <h4 className="text-xs md:text-sm font-bold uppercase mb-1 md:mb-2">Need something to read? Try this:</h4>
            
            <div className="bg-brutalist-green border-l-2 md:border-l-4 border-brutalist-black p-2 md:p-3 text-xs md:text-base font-medium">
              I'm recording audio to create an instant voice clone.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorderPanel;
