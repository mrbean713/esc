import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VoiceCloneInterface from '@/components/VoiceCloneInterface';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { LogOut, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';

const Index = () => {
  const { user, signOut, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col px-20">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
        <h1 className="text-4xl font-black uppercase tracking-tighter font-gascogne">ESC Labs</h1>
        <div className="flex gap-3">
          {isLoading ? (
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
          ) : user ? (
            <div className="flex items-center gap-3 font-manrope">
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
              <InteractiveHoverButton 
                className="text-lg font-manrope"
                onClick={() => setShowAuthModal(true)}
              >
                Log In
              </InteractiveHoverButton>
              <ShimmerButton 
                className="text-lg font-manrope"
                onClick={() => setShowAuthModal(true)}
              >
                Sign Up
              </ShimmerButton>
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
