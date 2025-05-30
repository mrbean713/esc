import { CartesiaClient, CartesiaError } from "@cartesia/cartesia-js";
import { toast } from 'sonner';

// This is a publishable API key
const CARTESIA_API_KEY = 'sk_car_NQAiuJweqvKRHodeVK4hVw';

// Initialize the Cartesia client
const client = new CartesiaClient({ apiKey: CARTESIA_API_KEY });

export async function cloneVoice(audioBlob: Blob, name: string = 'My Voice Clone'): Promise<string | null> {
  try {
    // Convert Blob to ArrayBuffer for SDK
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Log the request to help with debugging
    console.log('Sending voice cloning request with Cartesia SDK');
    console.log('Audio blob size:', audioBlob.size, 'bytes');
    console.log('Audio blob type:', audioBlob.type);

    // Check if the audio is too small (likely an error in recording)
    if (audioBlob.size < 5000) { // 5KB minimum
      toast.error('Audio recording is too short. Please record at least 5 seconds.');
      return null;
    }

    // Create a File object from the Blob with proper type
    const fileType = audioBlob.type && audioBlob.type !== '' ? audioBlob.type : 'audio/wav';
    const file = new File([new Uint8Array(arrayBuffer)], 'voice-sample.wav', { type: fileType });
    
    // Clone with stability mode for better results
    const response = await client.voices.clone(file, {
      name,
      description: `Voice clone of ${name}`,
      mode: "similarity",
      language: "en",  
      enhance: false   
    });

    console.log('Voice clone created successfully:', response);
    
    if (!response || !response.id) {
      toast.error('Failed to create voice clone. No ID returned.');
      return null;
    }
    
    return response.id;
  } catch (error) {
    console.error('Error cloning voice:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof CartesiaError) {
      errorMessage = `Error ${error.statusCode}: ${error.message}`;
      console.error('API error details:', error.body);
      
      // Provide more helpful error messages
      if (error.statusCode === 400) {
        errorMessage = 'Invalid audio file. Please try recording again.';
      } else if (error.statusCode === 413) {
        errorMessage = 'Audio file is too large. Please record a shorter clip.';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error(`Failed to clone voice: ${errorMessage}`);
    return null;
  }
}

interface GenerateSpeechParams {
  voiceId: string;
  text: string;
}

export async function generateSpeech({ voiceId, text }: GenerateSpeechParams): Promise<Blob | null> {
  try {
    if (!text.trim()) {
      toast.error('Please enter text to generate speech');
      return null;
    }
    
    // Limit text length for API compatibility
    const trimmedText = text.trim().substring(0, 500);
    if (trimmedText.length < text.trim().length) {
      toast.info('Text was trimmed to 500 characters');
    }
    
    // Use the SDK to generate speech
    const audioBytes = await client.tts.bytes({
      modelId: "sonic-2", // Using Sonic-2 model
      transcript: trimmedText,
      voice: {
        mode: "id",
        id: voiceId,
      },
      language: "en",
      outputFormat: {
        container: "wav",
        sampleRate: 44100,
        encoding: "pcm_f32le",
      },
    });
    
    // Convert the ArrayBuffer to a Blob
    return new Blob([audioBytes], { type: 'audio/wav' });
  } catch (error) {
    console.error('Error generating speech:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof CartesiaError) {
      errorMessage = `Error ${error.statusCode}: ${error.message}`;
      console.error('API error details:', error.body);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error(`Failed to generate speech: ${errorMessage}`);
    return null;
  }
}

export async function getVoiceStatus(voiceId: string): Promise<string> {
  try {
    if (!voiceId) {
      console.error('No voice ID provided to check status');
      return 'error';
    }
    
    // Use the SDK to check voice status
    const voice = await client.voices.get(voiceId);
    
    // Log the voice object to see its structure
    console.log('Voice object received:', voice);
    
    // If we got a voice object with an ID, it's ready
    if (voice && voice.id) {
      return "ready";
    }
    
    return 'processing';
  } catch (error) {
    console.error('Error checking voice status:', error);
    
    if (error instanceof CartesiaError) {
      console.error('API error details:', error.body);
      
      // If voice not found (404), it means the clone doesn't exist
      if (error.statusCode === 404) {
        return 'not_found';
      }
    }
    
    return 'error';
  }
}

// Function to speak a welcome message after cloning
export async function speakWelcomeMessage(voiceId: string): Promise<void> {
  if (!voiceId) return;
  
  const welcomeText = "Hello, your voice clone is ready! How do I sound?";
  try {
    const audioBlob = await generateSpeech({
      voiceId,
      text: welcomeText
    });
    
    if (audioBlob) {
      // Create an audio element and play it with mobile-specific attributes
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.setAttribute('playsinline', ''); // For iOS
      audio.setAttribute('webkit-playsinline', ''); // For older iOS
      
      // Play with proper error handling for mobile
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error("Error playing welcome message:", err);
          if (err.name === 'NotAllowedError') {
            toast.error("Couldn't autoplay welcome message. Tap the screen and try again.");
          } else {
            toast.error("Couldn't play welcome message. Please try again.");
          }
        });
      }
    }
  } catch (error) {
    console.error('Error speaking welcome message:', error);
    toast.error("Couldn't play welcome message");
  }
}
