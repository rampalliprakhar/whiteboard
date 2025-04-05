import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { socket } from '@/socket'
import Menu from '@/components/Menu'
import Tools from '@/components/Tools'
import Board from '@/components/Board'

export default function CollaborativeSession() {
  const router = useRouter()
  const { sessionId } = router.query
  const [activeUsers, setActiveUsers] = useState(0)
  
  useEffect(() => {
    if (!sessionId) return

    // Initialize session tracking
    const initSession = async () => {
      const session = {
        id: sessionId,
        last_active: new Date().toISOString(),
        active: true
      }

      await supabase.from('sessions').upsert(session)
    }

    // Setting up real-time subscription
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        setActiveUsers(Object.keys(presenceState).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user: socket.id })
        }
      })

    // Join socket.io room
    socket.emit('joinSession', sessionId)
    initSession()

    return () => {
      channel.unsubscribe()
      socket.emit('leaveSession', sessionId)
    }
  }, [sessionId])

  return (
    <div className="collaborative-session">
      <Menu />
      <Tools />
      <Board sessionId={sessionId} />
      {activeUsers > 0 && (
        <div className="active-users">
          Active users: {activeUsers}
        </div>
      )}
    </div>
  )
}