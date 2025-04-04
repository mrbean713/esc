
import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import AuthForm from './AuthForm';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <AuthForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
