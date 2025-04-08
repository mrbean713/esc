import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SignUpPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
}

const SignUpPrompt: React.FC<SignUpPromptProps> = ({ isOpen, onClose, onSignUp }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-black tracking-tighter">Save Your Voice Clone</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Sign up to save your voice clone and access it anytime. Create unlimited voice clones and text-to-speech content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-2 sm:py-4">
          <div className="flex flex-col space-y-2">
            <div className="bg-brutalist-green border-l-4 border-brutalist-black p-2 sm:p-3">
              <p className="text-sm sm:text-base font-bold">Your voice clone is ready! Sign up to keep it forever.</p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto text-sm sm:text-base py-2"
          >
            Maybe Later
          </Button>
          <Button 
            className="w-full sm:w-auto bg-brutalist-blue text-sm sm:text-base py-2"
            onClick={onSignUp}
          >
            Create Free Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpPrompt;
