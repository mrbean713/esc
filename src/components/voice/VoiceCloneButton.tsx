
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCcw } from 'lucide-react';

interface VoiceCloneButtonProps {
  isProcessing: boolean;
  voiceStatus: string;
  onSubmit: (e: React.FormEvent) => void;
}

const VoiceCloneButton: React.FC<VoiceCloneButtonProps> = ({
  isProcessing,
  voiceStatus,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <Button 
        type="submit"
        className="w-full"
        disabled={isProcessing || voiceStatus === 'processing'}
      >
        {isProcessing && !voiceStatus ? (
          <>
            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : voiceStatus === 'processing' ? (
          <>
            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
            Cloning Voice...
          </>
        ) : (
          'Clone Voice'
        )}
      </Button>
    </form>
  );
};

export default VoiceCloneButton;
