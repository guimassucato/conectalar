'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell, Clock, CheckCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BottomNav } from '@/components/BottomNav'

interface Notification {
  id: string
  title: string
  body: string | null
  read: boolean
  type: string
  created_at: string
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

export default function NotificacoesPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('notifications')
        .select('id, title, body, read, type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setNotifications(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    if (!userId) return
    setMarkingAll(true)
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setMarkingAll(false)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-[#f2f4f0] flex justify-center">
      <div className="w-full max-w-md flex flex-col pb-28">
        {/* Header */}
        <div className="px-5 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Notificações</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500">{unreadCount} não lida{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1 text-xs font-semibold text-green-700 active:scale-95 transition-transform disabled:opacity-60"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas
            </button>
          )}
        </div>

        {/* List */}
        <div className="px-5 flex flex-col gap-2">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-16 animate-pulse" />
            ))
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">Nenhuma notificação ainda</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.read && markAsRead(n.id)}
                className={`rounded-2xl px-4 py-3 shadow-sm border flex items-start gap-3 active:scale-[0.98] transition-all w-full text-left ${
                  n.read ? 'bg-white border-gray-100' : 'bg-green-50 border-green-100'
                }`}
              >
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? 'bg-gray-200' : 'bg-green-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {timeAgo(n.created_at)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <BottomNav role="professional" />
    </div>
  )
}
