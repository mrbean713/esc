import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import AuthForm from './AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6">
        <AuthForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
