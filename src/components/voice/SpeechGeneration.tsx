
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, RefreshCcw } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

interface SpeechGenerationProps {
  sampleText: string;
  isProcessing: boolean;
  onTextChange: (text: string) => void;
  onGenerateSpeech: () => void;
}

const SpeechGeneration: React.FC<SpeechGenerationProps> = ({
  sampleText,
  isProcessing,
  onTextChange,
  onGenerateSpeech,
}) => {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Speak with Your Cloned Voice</h3>
        <Textarea
          value={sampleText}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full min-h-[120px] p-3 border rounded-md"
          placeholder="Enter text for your cloned voice to speak..."
        />
      </div>
      
      <Button 
        onClick={onGenerateSpeech}
        className="w-full py-6"
        disabled={isProcessing}
        size="lg"
      >
        {isProcessing ? (
          <>
            <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
            Generating Speech...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Generate & Play Speech
          </>
        )}
      </Button>
    </div>
  );
};

export default SpeechGeneration;
