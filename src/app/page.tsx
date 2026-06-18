'use client'

import { useEffect, useState } from 'react'
import { Bell, MapPin, ChevronDown } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { OwnerHome } from '@/components/home/OwnerHome'
import { GardenerHome } from '@/components/home/GardenerHome'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState<string | null>(null)
  const [unreadNotif, setUnreadNotif] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserName(profile.full_name?.split(' ')[0] ?? '')
        setRole(profile.role)
      }

      // unread notifications count for bell icon
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
      setUnreadNotif(count ?? 0)

      setReady(true)
    }
    init()
  }, [])

  return (
    <div className="min-h-screen bg-[#f2f4f0] flex justify-center">
      <div className="w-full max-w-md relative min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-[#f2f4f0] pt-12 px-5 pb-2">
          <div className="flex items-center justify-between mb-4">
            <button className="flex items-center gap-1.5 text-gray-700">
              <MapPin className="w-4 h-4 text-green-700" />
              <span className="text-sm font-medium">Maringá - PR</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <button
              className="p-1 relative"
              onClick={() => role === 'professional' && router.push('/notificacoes')}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadNotif > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-green-700 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotif > 9 ? '9+' : unreadNotif}
                </span>
              )}
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {userName ? `Olá, ${userName}! 👋` : 'Olá! 👋'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 mb-2">
            {role === 'professional' ? 'Bem-vindo ao seu painel' : 'Como podemos te ajudar hoje?'}
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-28">
          {ready && role === 'professional' ? (
            <GardenerHome userId={userId} />
          ) : ready ? (
            <OwnerHome userId={userId} />
          ) : (
            // skeleton while loading role
            <div className="flex flex-col gap-3 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
              ))}
            </div>
          )}
        </div>

        <BottomNav role={role ?? undefined} />
      </div>
    </div>
  )
}
