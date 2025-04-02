import Link from 'next/link'
import { COLORS } from '@/constant'
import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'

export default function Home() {
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const createNewSession = async () => {
    try {
        const { data, error } = await supabase
            .from('whiteboard_sessions')
            .insert({
                created_by: user?.id || 'anonymous',
                data: {}
            })
            .select('id')
            .single()

        if (error) throw error
        
        if (data) {
            window.location.href = `/collaborative/${data.id}`
        }
    } catch (error) {
        console.error('Error creating session:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-mainBackground">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Whiteboard App</h1>
        <p className="text-xl text-mainText">Choose your drawing mode</p>
      </div>

      <div className="flex gap-8">
        <Link href="/single">
          <div className="p-8 bg-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <h2 className="text-2xl font-bold mb-3">Single User Mode</h2>
            <ul className="text-left">
              <li>✓ Full drawing capabilities</li>
              <li>✓ Local state management</li>
              <li>✓ Save & export features</li>
            </ul>
          </div>
        </Link>

        <div 
          onClick={createNewSession}
          className="p-8 bg-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
          <h2 className="text-2xl font-bold mb-3">Start Collaboration</h2>
          <ul className="text-left">
            <li>✓ Real-time collaboration</li>
            <li>✓ Shareable link</li>
            <li>✓ Multiple users support</li>
          </ul>
        </div>
      </div>
    </div>
  )
}