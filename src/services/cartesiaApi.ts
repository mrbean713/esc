
import { CartesiaClient, CartesiaError } from "@cartesia/cartesia-js";
import { toast } from 'sonner';

// This is a publishable API key
const CARTESIA_API_KEY = 'sk_car_lijpob_Qp1Nwrr_wWo3ad';

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

    // Create a File object from the Blob
    const file = new File([new Uint8Array(arrayBuffer)], 'voice.wav', { type: 'audio/wav' });
    
    const response = await client.voices.clone(file, {
      name,
      description: `Voice clone of ${name}`,
      mode: "stability", // Using stability mode as default
      language: "en",    // Default to English
      enhance: true      // Enable enhancement to improve quality
    });

    console.log('Voice clone created successfully:', response);
    return response.id;
  } catch (error) {
    console.error('Error cloning voice:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof CartesiaError) {
      errorMessage = `Error ${error.statusCode}: ${error.message}`;
      console.error('API error details:', error.body);
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
    // Use the SDK to generate speech
    const audioBytes = await client.tts.bytes({
      modelId: "sonic-2", // Using Sonic-2 model as default
      transcript: text,
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
    }
    
    return 'error';
  }
}

// Function to speak a welcome message after cloning
export async function speakWelcomeMessage(voiceId: string): Promise<void> {
  const welcomeText = "Hello, your voice clone is ready! How do I sound?";
  try {
    const audioBlob = await generateSpeech({
      voiceId,
      text: welcomeText
    });
    
    if (audioBlob) {
      // Create an audio element and play it
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play().catch(err => {
        console.error("Error playing welcome message:", err);
        toast.error("Couldn't play welcome message. Try clicking somewhere on the page first.");
      });
    }
  } catch (error) {
    console.error('Error speaking welcome message:', error);
    toast.error("Couldn't play welcome message");
  }
}
