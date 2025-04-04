
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VoiceCloneInterface from '@/components/VoiceCloneInterface';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { LogOut, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, signOut, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b-4 border-brutalist-black flex items-center justify-between bg-white">
        <h1 className="text-4xl font-black uppercase tracking-tighter">ESC Labs</h1>
        <div className="flex gap-3">
          {isLoading ? (
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">
                {user.email}
              </div>
              <Link to="/history">
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <History className="w-4 h-4 mr-2" />
                  Voice History
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button 
                className="brutal-button-secondary text-lg"
                onClick={() => setShowAuthModal(true)}
              >
                Log In
              </button>
              <button 
                className="brutal-button-primary text-lg"
                onClick={() => setShowAuthModal(true)}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        <VoiceCloneInterface />
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
      />
    </div>
  );
};

export default Index;
