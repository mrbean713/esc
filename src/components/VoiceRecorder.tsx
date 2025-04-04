
import React, { useRef, useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { cloneVoice, generateSpeech, getVoiceStatus, speakWelcomeMessage } from '@/services/cartesiaApi';
import { toast } from 'sonner';

import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { getAudioDuration } from '@/utils/audioUtils';
import WaveformVisualizer from '@/components/voice/WaveformVisualizer';
import RecordingControls from '@/components/voice/RecordingControls';
import AudioPlayback from '@/components/voice/AudioPlayback';
import VoiceCloneButton from '@/components/voice/VoiceCloneButton';
import SpeechGeneration from '@/components/voice/SpeechGeneration';
import WelcomeDialog from '@/components/voice/WelcomeDialog';

const VoiceRecorder = () => {
  // State for voice cloning process
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sampleText, setSampleText] = useState('Hello, this is my cloned voice. How does it sound?');
  const [generatedAudio, setGeneratedAudio] = useState<Blob | null>(null);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  
  // References
  const waveformDivRef = useRef<HTMLDivElement>(null);
  const statusCheckIntervalRef = useRef<number | null>(null);
  
  // Custom hook for recording functionality
  const { 
    isRecording, 
    audioBlob, 
    startRecording, 
    stopRecording, 
    handleFileUpload 
  } = useVoiceRecorder({ waveformRef: waveformDivRef });

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);

  const handleCloneVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioBlob) {
      toast.error('Please record or upload audio first');
      return;
    }

    const audioDuration = await getAudioDuration(audioBlob);
    if (audioDuration < 30) {
      toast.warning('Please record at least 30 seconds of audio for better results');
    }

    setIsProcessing(true);
    const newVoiceId = await cloneVoice(audioBlob);
    
    if (newVoiceId) {
      setVoiceId(newVoiceId);
      setVoiceStatus('processing');
      toast.success('Voice cloning started. This may take a few minutes.');
      
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
      
      statusCheckIntervalRef.current = window.setInterval(async () => {
        const status = await getVoiceStatus(newVoiceId);
        setVoiceStatus(status);
        
        if (status === 'ready') {
          if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current);
            statusCheckIntervalRef.current = null;
          }
          toast.success('Voice clone is ready!');
          setIsProcessing(false);
          
          // Show the welcome dialog
          setShowWelcomeDialog(true);
          
          // Speak the welcome message
          await speakWelcomeMessage(newVoiceId);
        } else if (status === 'error') {
          if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current);
            statusCheckIntervalRef.current = null;
          }
          toast.error('Error creating voice clone.');
          setIsProcessing(false);
        }
      }, 5000); // Check every 5 seconds
    } else {
      setIsProcessing(false);
    }
  };

  const handleGenerateSpeech = async () => {
    if (!voiceId || voiceStatus !== 'ready') {
      toast.error('Voice clone is not ready yet');
      return;
    }

    setIsProcessing(true);
    const speechBlob = await generateSpeech({
      voiceId,
      text: sampleText,
    });

    if (speechBlob) {
      setGeneratedAudio(speechBlob);
      toast.success('Speech generated successfully!');
    }
    setIsProcessing(false);
  };

  return (
    <Card className="w-full max-w-2xl p-6 space-y-6 backdrop-blur-sm bg-white/90 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Create Your AI Voice Clone</h2>
        <p className="text-sm text-gray-500">Record or upload your voice to create a personalized AI voice</p>
      </div>

      <WaveformVisualizer 
        waveformRef={waveformDivRef} 
        playbackProgress={playbackProgress}
      />

      <RecordingControls
        isRecording={isRecording}
        isProcessing={isProcessing}
        startRecording={startRecording}
        stopRecording={stopRecording}
        handleFileUpload={handleFileUpload}
      />

      {audioBlob && (
        <div className="space-y-4 animate-fade-up">
          <AudioPlayback 
            audioBlob={audioBlob} 
            onProgressChange={setPlaybackProgress}
          />
          
          <VoiceCloneButton
            isProcessing={isProcessing}
            voiceStatus={voiceStatus}
            onSubmit={handleCloneVoice}
          />
        </div>
      )}

      {voiceId && voiceStatus === 'ready' && (
        <SpeechGeneration
          sampleText={sampleText}
          isProcessing={isProcessing}
          onTextChange={setSampleText}
          onGenerateSpeech={handleGenerateSpeech}
        />
      )}

      {generatedAudio && (
        <div className="flex justify-center animate-fade-up">
          <AudioPlayback 
            audioBlob={generatedAudio}
            onProgressChange={setPlaybackProgress}
          />
        </div>
      )}
      
      <WelcomeDialog 
        open={showWelcomeDialog} 
        onOpenChange={setShowWelcomeDialog} 
      />
    </Card>
  );
};

export default VoiceRecorder;
