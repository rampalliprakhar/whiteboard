import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { socket } from '@/socket'
import Menu from '@/components/Menu'
import Tools from '@/components/Tools'
import Board from '@/components/Board'

export default function CollaborativeSession() {
  const router = useRouter();
  const { sessionId } = router.query;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const initSession = async () => {
      try {
        const session = {
          id: sessionId,
          created_by: 'anonymous',
          data: {},
          created_at: new Date().toISOString()
        };

        await supabase
          .from('whiteboard_sessions')
          .upsert(session, { onConflict: 'id' });

        socket.emit('joinSession', sessionId);
        setIsReady(true);
      } catch (error) {
        console.error('Session initialization failed:', error);
      }
    };

    initSession();

    return () => {
      socket.emit('leaveSession', sessionId);
    };
  }, [sessionId]);

  if (!isReady || !sessionId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="collaborative-session">
      <Menu />
      <Tools />
      <Board sessionId={sessionId} />
    </div>
  );
}