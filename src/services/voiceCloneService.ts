
import { supabase } from '@/integrations/supabase/client';
import { cloneVoice, generateSpeech, getVoiceStatus } from '@/services/cartesiaApi';

interface SaveVoiceCloneParams {
  name: string;
  voiceId: string;
  userId: string;
}

export async function saveVoiceClone({ name, voiceId, userId }: SaveVoiceCloneParams) {
  const { data, error } = await supabase
    .from('voice_clones')
    .insert({
      name,
      voice_id: voiceId,
      user_id: userId
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving voice clone:', error);
    throw error;
  }

  return data;
}

export async function getUserVoiceClones() {
  const { data, error } = await supabase
    .from('voice_clones')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching voice clones:', error);
    throw error;
  }

  return data;
}

export async function saveGeneratedSpeech(voiceCloneId: string, text: string) {
  const { data, error } = await supabase
    .from('generated_speeches')
    .insert({
      voice_clone_id: voiceCloneId,
      text
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving generated speech:', error);
    throw error;
  }

  return data;
}

export async function getGeneratedSpeeches(voiceCloneId: string) {
  const { data, error } = await supabase
    .from('generated_speeches')
    .select('*')
    .eq('voice_clone_id', voiceCloneId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching generated speeches:', error);
    throw error;
  }

  return data;
}

export async function processAndSaveVoiceClone(audioBlob: Blob, name: string) {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Step 1: Clone the voice using Cartesia API
    const voiceId = await cloneVoice(audioBlob, name);
    
    if (!voiceId) {
      throw new Error('Failed to clone voice');
    }
    
    // Step 2: Wait for voice clone to be ready
    let status = 'processing';
    while (status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      status = await getVoiceStatus(voiceId);
      
      if (status === 'error') {
        throw new Error('Voice cloning failed');
      }
    }
    
    // Step 3: Save the voice clone to Supabase with the user's ID
    const savedClone = await saveVoiceClone({ 
      name, 
      voiceId,
      userId: user.id
    });
    
    return {
      voiceId,
      savedClone
    };
  } catch (error) {
    console.error('Error processing and saving voice clone:', error);
    throw error;
  }
}
