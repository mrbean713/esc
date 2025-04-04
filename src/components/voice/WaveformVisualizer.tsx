
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface WaveformVisualizerProps {
  waveformRef: React.RefObject<HTMLDivElement>;
  playbackProgress?: number;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  waveformRef,
  playbackProgress = 0
}) => {
  return (
    <div className="space-y-2 w-full">
      <div 
        ref={waveformRef} 
        className="w-full h-20 bg-gray-50 rounded-lg transition-all duration-300 animate-fade-up"
      />
      
      {playbackProgress > 0 && (
        <div className="w-full space-y-1">
          <Progress 
            value={playbackProgress} 
            className="h-2 w-full"
          />
          <p className="text-xs text-gray-500 text-right">{Math.round(playbackProgress)}%</p>
        </div>
      )}
    </div>
  );
};

export default WaveformVisualizer;
