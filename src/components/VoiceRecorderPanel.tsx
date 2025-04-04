import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { cloneVoice } from '@/services/cartesiaApi';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (waveformDivRef.current) {
      waveformRef.current = WaveSurfer.create({
        container: waveformDivRef.current,
        waveColor: '#121212',
        progressColor: '#FF5252',
        cursorWidth: 0,
        height: 80,
        normalize: true,
        barWidth: 4,
        barGap: 3,
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
  }, []);

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
    <div className="space-y-6">
      <div className="text-lg font-bold uppercase tracking-tighter">
        {isRecording ? "Recording in progress..." : "Record a voice clip"}
      </div>
      
      {isRecording ? (
        <button 
          onClick={stopRecording} 
          className="w-full border-4 border-brutalist-black bg-brutalist-red text-white px-6 py-4 font-black uppercase tracking-wide shadow-brutal hover:shadow-brutal-hover hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <Square className="w-6 h-6" />
          Stop Recording
        </button>
      ) : (
        <button 
          onClick={startRecording} 
          className="w-full border-4 border-brutalist-black bg-brutalist-red text-white px-6 py-4 font-black uppercase tracking-wide shadow-brutal hover:shadow-brutal-hover hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <Mic className="w-6 h-6" />
          Record
        </button>
      )}
      
      <div className="bg-brutalist-yellow border-4 border-brutalist-black p-4 font-bold text-center">
        {getRecommendedText()}
      </div>
      
      {audioBlob && (
        <div className="space-y-6">
          <div 
            ref={waveformDivRef} 
            className="w-full border-4 border-brutalist-black bg-white p-4"
          />
          
          <div className="flex justify-center">
            <button
              className="border-4 border-brutalist-black bg-brutalist-blue text-white px-6 py-3 font-black uppercase tracking-wide shadow-brutal hover:shadow-brutal-hover hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3"
              onClick={isPlaying ? stopAudio : playAudio}
            >
              {isPlaying ? (
                <>
                  <Square className="w-5 h-5" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Play
                </>
              )}
            </button>
          </div>
          
          <div className="text-lg font-bold uppercase tracking-tighter mt-6">
            Need something to read? Try this:
          </div>
          
          <div className="bg-brutalist-green border-4 border-l-8 border-brutalist-black p-4 text-lg font-bold">
            I'm recording audio to create an instant voice clone.
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorderPanel;
