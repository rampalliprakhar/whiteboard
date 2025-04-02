import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { socket } from '@/socket'
import Menu from '@/components/Menu'
import Tools from '@/components/Tools'
import Board from '@/components/Board'

export default function CollaborativeSession() {
  const router = useRouter()
  const { sessionId } = router.query
  
  useEffect(() => {
    if (sessionId) {
      socket.emit('joinSession', sessionId)
      
      // Subscribe to real-time changes
      const channel = supabase
        .channel(`session:${sessionId}`)
        .subscribe()
        
      return () => {
        channel.unsubscribe()
      }
    }
  }, [sessionId])

  return (
    <>
      <Menu />
      <Tools />
      <Board sessionId={sessionId} />
    </>
  )
}