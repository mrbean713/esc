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
    <div className="min-h-screen bg-[#ffffff] flex flex-col px-2 sm:px-4 md:px-8 lg:px-20">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white gap-3">
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter font-gascogne">NESC Labs</h1>
        <div className="flex gap-2 md:gap-3 flex-wrap justify-center sm:justify-end">
          {isLoading ? (
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
          ) : user ? (
            <div className="flex items-center gap-2 md:gap-3 font-manrope flex-wrap justify-center">
              <div className="text-xs sm:text-sm font-medium">
                {user.email}
              </div>
              <Link to="/history">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                >
                  <History className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
                  History
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => signOut()}
              >
                <LogOut className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
                Log Out
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 md:gap-3">
              <InteractiveHoverButton 
                className="text-sm md:text-lg font-manrope"
                onClick={() => setShowAuthModal(true)}
              >
                Log In
              </InteractiveHoverButton>
              <ShimmerButton 
                className="text-sm md:text-lg font-manrope"
                onClick={() => setShowAuthModal(true)}
              >
                Sign Up
              </ShimmerButton>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-2 sm:p-4 md:p-6">
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
