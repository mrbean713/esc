
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Upload } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isProcessing,
  startRecording,
  stopRecording,
  handleFileUpload,
}) => {
  return (
    <div className="flex justify-center gap-4 flex-wrap">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? "destructive" : "default"}
        className="transition-all duration-300 hover:scale-105"
        disabled={isProcessing}
      >
        {isRecording ? (
          <>
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Start Recording
          </>
        )}
      </Button>

      <div className="relative">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
          id="audio-upload"
          disabled={isProcessing}
        />
        <Button
          variant="outline"
          className="transition-all duration-300 hover:scale-105"
          onClick={() => document.getElementById('audio-upload')?.click()}
          disabled={isProcessing}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Audio
        </Button>
      </div>
    </div>
  );
};

export default RecordingControls;
