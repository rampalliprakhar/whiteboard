import Link from 'next/link'
import { COLORS } from '@/constant'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-mainBackground">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Whiteboard App</h1>
        <p className="text-xl text-mainText">Choose your drawing mode</p>
      </div>

      <div className="flex gap-8">
        <Link href="/single">
          <div className="p-8 bg-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer" style={{borderColor: COLORS.BLUE}}>
            <h2 className="text-2xl font-bold mb-3">Single User Mode</h2>
            <ul className="text-left">
              <li>✓ Full drawing capabilities</li>
              <li>✓ Local state management</li>
              <li>✓ Save & export features</li>
              <li>✓ Perfect for personal use</li>
            </ul>
          </div>
        </Link>

        <Link href="/collaborative">
          <div className="p-8 bg-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer" style={{borderColor: COLORS.GREEN}}>
            <h2 className="text-2xl font-bold mb-3">Multi User Mode</h2>
            <ul className="text-left">
              <li>✓ Real-time collaboration</li>
              <li>✓ Multiple users support</li>
              <li>✓ Live drawing updates</li>
              <li>✓ User presence indicators</li>
            </ul>
          </div>
        </Link>
      </div>
    </div>
  )
}