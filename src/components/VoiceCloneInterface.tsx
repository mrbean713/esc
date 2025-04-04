
import React, { useState, useEffect } from 'react';
import VoiceRecorderPanel from './VoiceRecorderPanel';
import { cloneVoice, generateSpeech, getVoiceStatus, speakWelcomeMessage } from '@/services/cartesiaApi';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Play, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import SignUpPrompt from './voice/SignUpPrompt';
import { useAuth } from '@/contexts/AuthContext';
import { processAndSaveVoiceClone, saveGeneratedSpeech, getUserVoiceClones } from '@/services/voiceCloneService';
import AuthModal from './auth/AuthModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceClone {
  id: string;
  name: string;
  voice_id: string;
  created_at: string;
}

const VoiceCloneInterface = () => {
  const { user } = useAuth();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [ttsText, setTtsText] = useState('Hello, this is my cloned voice speaking to you.');
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasUsedTTS, setHasUsedTTS] = useState(false);
  const [currentVoiceCloneId, setCurrentVoiceCloneId] = useState<string | null>(null);
  const [savedVoiceClones, setSavedVoiceClones] = useState<VoiceClone[]>([]);
  const [selectedSavedClone, setSelectedSavedClone] = useState<string>('');
  
  // Fetch user's saved voice clones when logged in
  useEffect(() => {
    if (user) {
      fetchSavedVoiceClones();
    }
  }, [user]);

  const fetchSavedVoiceClones = async () => {
    try {
      const clones = await getUserVoiceClones();
      setSavedVoiceClones(clones || []);
    } catch (error) {
      console.error('Failed to fetch voice clones:', error);
    }
  };
  
  const handleAudioReady = (blob: Blob) => {
    setAudioBlob(blob);
  };

  const handleSelectSavedClone = (value: string) => {
    if (!value) return;
    
    setSelectedSavedClone(value);
    const selectedClone = savedVoiceClones.find(clone => clone.id === value);
    
    if (selectedClone) {
      setVoiceId(selectedClone.voice_id);
      setVoiceStatus('ready');
      setCurrentVoiceCloneId(selectedClone.id);
      toast.success(`Loaded voice clone: ${selectedClone.name}`);
    }
  };
  
  const validateName = () => {
    if (!name.trim()) {
      setNameError('Voice clone name is required');
      return false;
    }
    setNameError('');
    return true;
  };
  
  const handleCloneVoice = async () => {
    if (!audioBlob) {
      toast.error('Please record or upload audio first');
      return;
    }

    if (!validateName()) {
      return;
    }
    
    setIsProcessing(true);

    try {
      // If user is logged in, save to database
      if (user) {
        toast.loading('Processing voice clone. This may take a few minutes.');
        const { voiceId: newVoiceId, savedClone } = await processAndSaveVoiceClone(audioBlob, name);
        
        if (newVoiceId) {
          setVoiceId(newVoiceId);
          setVoiceStatus('ready');
          setCurrentVoiceCloneId(savedClone.id);
          toast.dismiss();
          toast.success('Voice clone is ready!');
          
          // Speak the welcome message
          await speakWelcomeMessage(newVoiceId);
          
          // Update the list of saved clones
          await fetchSavedVoiceClones();
        }
      } else {
        // For non-logged in users, just use the Cartesia API directly
        const newVoiceId = await cloneVoice(audioBlob, name);
        
        if (newVoiceId) {
          setVoiceId(newVoiceId);
          setVoiceStatus('processing');
          toast.success('Voice cloning started. This may take a few minutes.');
          
          // Set up an interval to check the voice status
          const statusCheckInterval = setInterval(async () => {
            const status = await getVoiceStatus(newVoiceId);
            setVoiceStatus(status);
            
            if (status === 'ready') {
              clearInterval(statusCheckInterval);
              toast.success('Voice clone is ready!');
              
              // Speak the welcome message
              await speakWelcomeMessage(newVoiceId);
            } else if (status === 'error') {
              clearInterval(statusCheckInterval);
              toast.error('Error creating voice clone.');
            }
          }, 5000); // Check every 5 seconds
        }
      }
    } catch (error) {
      console.error('Voice cloning error:', error);
      toast.error('Failed to clone voice');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextToSpeech = async () => {
    if (!voiceId || voiceStatus !== 'ready') {
      toast.error('Voice clone is not ready yet');
      return;
    }

    if (!ttsText.trim()) {
      toast.error('Please enter some text for speech generation');
      return;
    }

    setIsProcessing(true);
    try {
      const speechBlob = await generateSpeech({
        voiceId,
        text: ttsText,
      });

      if (speechBlob) {
        // If user is logged in, save the generated speech
        if (user && currentVoiceCloneId) {
          await saveGeneratedSpeech(currentVoiceCloneId, ttsText);
        }

        // Create an audio element and play it
        const audio = new Audio(URL.createObjectURL(speechBlob));
        
        // Set up progress tracking
        audio.addEventListener('timeupdate', () => {
          if (audio.duration > 0) {
            setPlaybackProgress((audio.currentTime / audio.duration) * 100);
          }
        });
        
        audio.addEventListener('ended', () => {
          setPlaybackProgress(0);
          
          // Show signup prompt after first TTS usage for non-logged in users
          if (!hasUsedTTS && !user) {
            setHasUsedTTS(true);
            setShowSignUpPrompt(true);
          }
        });
        
        await audio.play();
        toast.success('Speech generated and playing');
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error('Failed to generate speech');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleProgressChange = (progress: number) => {
    setPlaybackProgress(progress);
  };

  const handleSignUpPromptAction = () => {
    setShowSignUpPrompt(false);
    setShowAuthModal(true);
  };
  
  const resetVoiceClone = () => {
    setVoiceId(null);
    setVoiceStatus('');
    setCurrentVoiceCloneId(null);
    setSelectedSavedClone('');
    setName('');
    setAudioBlob(null);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left column - Voice Input */}
      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 bg-brutalist-red border-4 border-brutalist-black text-white text-xl font-black shadow-brutal-sm">
              1
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Record Your Voice</h2>
          </div>
          
          <div className="p-6 border-4 border-brutalist-black bg-white shadow-brutal">
            <VoiceRecorderPanel 
              onAudioReady={handleAudioReady} 
              cloneMode="stability"
            />
          </div>
        </div>
      </div>
      
      {/* Right column - Details and TTS */}
      <div className="lg:col-span-5 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 bg-brutalist-purple border-4 border-brutalist-black text-white text-xl font-black shadow-brutal-sm">
            2
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Clone & Speak</h2>
        </div>
        
        <div className="p-6 border-4 border-brutalist-black bg-white shadow-brutal space-y-6">
          {user && savedVoiceClones.length > 0 && (
            <div className="space-y-2">
              <Label className="brutal-label block">
                Use Existing Clone
              </Label>
              <Select value={selectedSavedClone} onValueChange={handleSelectSavedClone}>
                <SelectTrigger className="brutal-input w-full">
                  <SelectValue placeholder="Select a saved voice clone" />
                </SelectTrigger>
                <SelectContent>
                  {savedVoiceClones.map((clone) => (
                    <SelectItem key={clone.id} value={clone.id}>
                      {clone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-1">
                Or create a new clone below
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="brutal-label block">
              Clone Name <span className="text-brutalist-red">*</span>
            </Label>
            <Input 
              type="text"
              value={name} 
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError('');
              }} 
              placeholder="My voice clone"
              className={`brutal-input w-full ${nameError ? 'border-red-500' : ''}`}
            />
            {nameError && (
              <p className="text-sm text-red-500">{nameError}</p>
            )}
          </div>
          
          <button 
            onClick={handleCloneVoice}
            disabled={isProcessing || !audioBlob || voiceStatus === 'ready'}
            className={`brutal-button-primary w-full py-4 text-lg ${
              (isProcessing || !audioBlob || voiceStatus === 'ready') ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? 'Processing...' : 'Clone Voice Now'}
          </button>

          {voiceStatus === 'processing' && (
            <div className="p-4 border-4 border-brutalist-black bg-brutalist-yellow">
              <p className="font-bold text-center">
                Voice clone is processing...
              </p>
            </div>
          )}

          {playbackProgress > 0 && (
            <div className="w-full space-y-1">
              <Progress value={playbackProgress} className="h-3 w-full" />
              <p className="text-xs text-gray-500 text-center">{Math.round(playbackProgress)}% complete</p>
            </div>
          )}

          {voiceStatus === 'ready' && (
            <div className="space-y-4">
              <div className="p-4 border-4 border-brutalist-black bg-brutalist-green">
                <p className="font-bold text-center">
                  Voice clone is ready!
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="brutal-label block">
                  Text to Speech
                </Label>
                <Textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Enter text for your voice to speak..."
                  className="brutal-input w-full min-h-[100px]"
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleTextToSpeech}
                  disabled={isProcessing || voiceStatus !== 'ready'}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Speak with My Voice
                </Button>
                
                <Button
                  variant="outline"
                  onClick={resetVoiceClone}
                  title="Create a new voice clone"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SignUpPrompt
        open={showSignUpPrompt}
        onOpenChange={setShowSignUpPrompt}
        onSignUp={handleSignUpPromptAction}
      />

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default VoiceCloneInterface;
