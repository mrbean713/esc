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
import { RainbowButton } from '@/components/magicui/rainbow-button';

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
    <div className="flex flex-col gap-3 md:gap-8 w-full max-w-screen-sm mx-auto py-2 md:py-12 px-0 sm:px-3 md:px-4">
      {/* Left column - Voice Input */}
      <div className="space-y-2 md:space-y-8">
        <div className="space-y-2 md:space-y-6">
          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
            <div className="flex items-center justify-center w-6 h-6 md:w-12 md:h-12 border border-gray-400 rounded-full text-black text-sm md:text-xl font-black">
              1
            </div>
            <h2 className="text-lg md:text-3xl font-black tracking-tighter">Record your voice</h2>
          </div>
          
          <div className="p-2 sm:p-3 md:p-6 border border-gray-200 rounded-xl shadow-sm bg-white">
            <VoiceRecorderPanel 
              onAudioReady={handleAudioReady} 
              cloneMode="stability"
            />
          </div>
        </div>
      </div>
      
      {/* Right column - Details and TTS */}
      <div className="space-y-2 md:space-y-6">
        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
          <div className="flex items-center justify-center w-6 h-6 md:w-12 md:h-12 border border-gray-400 rounded-full text-black text-sm md:text-xl font-black">
            2
          </div>
          <h2 className="text-lg md:text-3xl font-black tracking-tighter">Clone your voice</h2>
        </div>
        
        <div className="p-2 sm:p-3 md:p-6 border border-gray-200 rounded-xl shadow-sm bg-white space-y-3 md:space-y-6">
          {user && savedVoiceClones.length > 0 && (
            <div className="space-y-1 md:space-y-2">
              <Label className="block text-sm md:text-base font-medium">
                Select an existing voice clone
              </Label>
              <Select value={selectedSavedClone} onValueChange={handleSelectSavedClone}>
                <SelectTrigger className="w-full text-sm md:text-base py-2">
                  <SelectValue placeholder="Select a saved voice clone" />
                </SelectTrigger>
                <SelectContent>
                  {savedVoiceClones.map(clone => (
                    <SelectItem key={clone.id} value={clone.id} className="text-sm md:text-base">
                      {clone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-1 md:space-y-2">
            <Label className="block text-sm md:text-base font-medium">
              Clone name <span className="text-brutalist-red">*</span>
            </Label>
            <Input 
              type="text"
              value={name} 
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError('');
              }} 
              placeholder="My voice clone"
              className={`w-full text-sm md:text-base py-2 ${nameError ? 'border-red-500' : 'border-gray-200'}`}
            />
            {nameError && (
              <p className="text-xs md:text-sm text-red-500">{nameError}</p>
            )}
          </div>
          
          <RainbowButton 
            onClick={handleCloneVoice}
            disabled={isProcessing || !audioBlob || voiceStatus === 'ready'}
            className={`w-full py-2 md:py-4 text-sm md:text-lg ${
              (isProcessing || !audioBlob || voiceStatus === 'ready') ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? 'Processing...' : 'Clone Voice Now'}
          </RainbowButton>

          {voiceStatus === 'processing' && (
            <div className="p-2 md:p-4 border border-yellow-400 bg-yellow-100 rounded-lg">
              <p className="text-xs md:text-base font-bold text-center text-yellow-800">
                Voice clone is processing...
              </p>
            </div>
          )}

          {voiceStatus === 'ready' && (
            <div className="space-y-3 md:space-y-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center justify-center w-6 h-6 md:w-12 md:h-12 border border-gray-400 rounded-full text-black text-sm md:text-xl font-black">
                  3
                </div>
                <h2 className="text-lg md:text-3xl font-black tracking-tighter">Generate speech</h2>
              </div>
              
              <div className="space-y-2 md:space-y-4">
                <Label className="block text-sm md:text-lg font-medium">
                  Enter text to speak with your cloned voice
                </Label>
                <Textarea 
                  value={ttsText} 
                  onChange={(e) => setTtsText(e.target.value)} 
                  placeholder="Type something to say with your cloned voice..."
                  className="min-h-[80px] md:min-h-[120px] text-sm md:text-base border-gray-200"
                />
                
                <Button 
                  onClick={handleTextToSpeech}
                  disabled={isProcessing}
                  className="w-full bg-brutalist-red hover:bg-red-600 text-white flex items-center justify-center gap-1 md:gap-2 py-2 md:py-3 text-sm md:text-base font-medium"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3 h-3 md:w-5 md:h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 md:w-5 md:h-5" />
                      Speak with Cloned Voice
                    </>
                  )}
                </Button>
                
                {playbackProgress > 0 && (
                  <div className="w-full space-y-1">
                    <Progress value={playbackProgress} className="h-2 md:h-3 w-full" />
                    <p className="text-xs md:text-sm text-gray-500 text-center">{Math.round(playbackProgress)}% complete</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Sign up prompt modal */}
      <SignUpPrompt 
        isOpen={showSignUpPrompt} 
        onClose={() => setShowSignUpPrompt(false)}
        onSignUp={handleSignUpPromptAction}
      />
      
      {/* Auth modal */}
      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default VoiceCloneInterface;
