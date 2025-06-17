
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserVoiceClones, getGeneratedSpeeches } from '@/services/voiceCloneService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Play, Clock, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatDistance } from 'date-fns';

interface VoiceClone {
  id: string;
  name: string;
  voice_id: string;
  created_at: string;
}

interface GeneratedSpeech {
  id: string;
  text: string;
  created_at: string;
  voice_clone_id: string;
}

const History = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [voiceClones, setVoiceClones] = useState<VoiceClone[]>([]);
  const [speeches, setSpeeches] = useState<Record<string, GeneratedSpeech[]>>({});
  const [expandedClone, setExpandedClone] = useState<string | null>(null);
  const [isLoadingClones, setIsLoadingClones] = useState(true);
  const [isLoadingSpeeches, setIsLoadingSpeeches] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      toast.error('Please log in to view your voice history');
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchVoiceClones = async () => {
      if (!user) return;
      
      try {
        setIsLoadingClones(true);
        const clones = await getUserVoiceClones();
        setVoiceClones(clones);
      } catch (error) {
        console.error('Error fetching voice clones:', error);
        toast.error('Failed to load your voice clones');
      } finally {
        setIsLoadingClones(false);
      }
    };

    fetchVoiceClones();
  }, [user]);

  const handleToggleExpand = async (cloneId: string) => {
    if (expandedClone === cloneId) {
      setExpandedClone(null);
      return;
    }
    
    setExpandedClone(cloneId);
    
    if (!speeches[cloneId]) {
      try {
        setIsLoadingSpeeches(true);
        const cloneSpeeches = await getGeneratedSpeeches(cloneId);
        setSpeeches(prev => ({
          ...prev,
          [cloneId]: cloneSpeeches
        }));
      } catch (error) {
        console.error('Error fetching speeches:', error);
        toast.error('Failed to load generated speeches');
      } finally {
        setIsLoadingSpeeches(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] p-6 flex items-center justify-center">
        <div className="loader animate-spin h-12 w-12 border-1 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b-4 flex items-center justify-between bg-white">
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          <a href="/">FLAIR AI Voice Clone</a>
        </h1>
        <div className="flex gap-3">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">{user.email}</div>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-brutalist-blue border-1 border-brutalist-black text-white text-xl font-black shadow-brutal-sm">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Your Voice History</h2>
          </div>
          
          <div className="p-6 border-1 border-brutalist-black bg-white shadow-brutal">
            {isLoadingClones ? (
              <div className="flex justify-center py-10">
                <div className="loader animate-spin h-10 w-10 border-1 border-brutalist-black border-t-transparent rounded-full"></div>
              </div>
            ) : voiceClones.length === 0 ? (
              <div className="text-center py-10">
                <Mic className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-500">You haven't created any voice clones yet</p>
                <Button 
                  className="mt-4 brutal-button-primary"
                  onClick={() => navigate('/')}
                >
                  Create Your First Voice Clone
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voiceClones.map((clone) => (
                    <React.Fragment key={clone.id}>
                      <TableRow className="hover:bg-gray-100">
                        <TableCell className="font-medium">{clone.name}</TableCell>
                        <TableCell>{formatDate(clone.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleExpand(clone.id)}
                          >
                            {expandedClone === clone.id ? 'Hide History' : 'Show History'}
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {expandedClone === clone.id && (
                        <TableRow>
                          <TableCell colSpan={3} className="p-0">
                            <div className="bg-gray-50 p-4 border-t border-gray-200">
                              <h4 className="text-sm font-semibold mb-2">Generated Speeches</h4>
                              
                              {isLoadingSpeeches ? (
                                <div className="flex justify-center py-4">
                                  <div className="loader animate-spin h-6 w-6 border-2 border-brutalist-black border-t-transparent rounded-full"></div>
                                </div>
                              ) : speeches[clone.id]?.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {speeches[clone.id].map((speech) => (
                                    <div 
                                      key={speech.id} 
                                      className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded"
                                    >
                                      <div className="flex-1 truncate pr-4">
                                        <p className="text-sm">{speech.text}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {formatDate(speech.created_at)}
                                        </p>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        disabled // Currently we don't store audio URLs
                                      >
                                        <Play className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 py-2">No speeches have been generated with this voice yet.</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
