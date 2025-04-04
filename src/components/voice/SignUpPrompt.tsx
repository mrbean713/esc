
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SignUpPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignUp: () => void;
}

const SignUpPrompt: React.FC<SignUpPromptProps> = ({ open, onOpenChange, onSignUp }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter">Save Your Voice Clone</DialogTitle>
          <DialogDescription>
            Sign up to save your voice clone and access it anytime. Create unlimited voice clones and text-to-speech content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <div className="bg-brutalist-green border-l-4 border-brutalist-black p-3">
              <p className="font-bold">Your voice clone is ready! Sign up to keep it forever.</p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <Button 
            className="w-full sm:w-auto brutal-button-primary bg-brutalist-blue"
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
