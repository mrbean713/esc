
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RainbowButton } from '@/components/magicui/rainbow-button';

type AuthMode = 'signin' | 'signup';

interface AuthFormProps {
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        toast.success('Account created! Check your email for the confirmation link.');
        onSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success('Signed in successfully!');
        onSuccess();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6 bg-white/90 border-none">
      <h2 className="text-2xl font-black tracking-tighter mb-6">
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className=" block">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className=""
          />
        </div>
        
        <div className="space-y-2">
          <label className="block">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className=""
            minLength={6}
          />
        </div>
        
        <RainbowButton 
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading 
            ? 'Processing...' 
            : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </RainbowButton>
        
        <div className="text-center mt-4">
          <button 
            type="button"
            onClick={toggleMode}
            className="text-sm underline"
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"}
          </button>
        </div>
      </form>
    </Card>
  );
};

export default AuthForm;
