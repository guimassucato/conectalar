'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronRight, Bell, Clock, CheckCircle2, XCircle, HelpCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Orcamento {
  id: string
  service: string
  status: string
  created_at: string
  owner: { full_name: string } | null
}

interface Notification {
  id: string
  title: string
  body: string | null
  read: boolean
  created_at: string
}

interface Props {
  userId: string
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending:   { label: 'Aguardando', icon: HelpCircle,    color: 'text-yellow-700', bg: 'bg-yellow-50' },
  accepted:  { label: 'Aceito',     icon: CheckCircle2,  color: 'text-green-700',  bg: 'bg-green-50'  },
  rejected:  { label: 'Recusado',   icon: XCircle,       color: 'text-red-600',    bg: 'bg-red-50'    },
  completed: { label: 'Concluído',  icon: CheckCircle2,  color: 'text-blue-700',   bg: 'bg-blue-50'   },
}

export function GardenerHome({ userId }: Props) {
  const router = useRouter()
  const [available, setAvailable] = useState(true)
  const [togglingAvail, setTogglingAvail] = useState(false)
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingOrc, setLoadingOrc] = useState(true)
  const [loadingNotif, setLoadingNotif] = useState(true)

  useEffect(() => {
    async function load() {
      // availability
      const { data: profile } = await supabase
        .from('profiles')
        .select('available')
        .eq('id', userId)
        .single()
      if (profile) setAvailable(profile.available ?? true)

      // orcamentos
      const { data: orc } = await supabase
        .from('orcamentos')
        .select('id, service, status, created_at, owner:owner_id(full_name)')
        .eq('gardener_id', userId)
        .order('created_at', { ascending: false })
        .limit(3)
      setOrcamentos(
        (orc ?? []).map((o) => ({
          ...o,
          owner: Array.isArray(o.owner) ? o.owner[0] ?? null : o.owner,
        }))
      )
      setLoadingOrc(false)

      // notifications
      const { data: notif } = await supabase
        .from('notifications')
        .select('id, title, body, read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3)
      setNotifications(notif ?? [])
      setUnreadCount((notif ?? []).filter((n) => !n.read).length)
      setLoadingNotif(false)
    }
    load()
  }, [userId])

  async function toggleAvailable() {
    setTogglingAvail(true)
    const next = !available
    await supabase.from('profiles').update({ available: next }).eq('id', userId)
    setAvailable(next)
    setTogglingAvail(false)
  }

  return (
    <>
      {/* Availability widget */}
      <div
        className={`mt-2 rounded-2xl p-4 flex items-center justify-between transition-colors duration-300 ${
          available ? 'bg-green-700' : 'bg-gray-300'
        }`}
      >
        <div>
          <p className={`text-sm font-bold ${available ? 'text-white' : 'text-gray-600'}`}>
            {available ? '🟢 Disponível para serviços' : '⚫ Indisponível no momento'}
          </p>
          <p className={`text-xs mt-0.5 ${available ? 'text-green-100' : 'text-gray-500'}`}>
            {available ? 'Clientes podem te encontrar' : 'Você não aparece nas buscas'}
          </p>
        </div>
        <button
          onClick={toggleAvailable}
          disabled={togglingAvail}
          className="flex-shrink-0 active:scale-90 transition-transform disabled:opacity-60"
          aria-label="Alternar disponibilidade"
        >
          {togglingAvail ? (
            <span className={`w-5 h-5 border-2 rounded-full animate-spin ${available ? 'border-white/30 border-t-white' : 'border-gray-400/30 border-t-gray-600'}`} />
          ) : available ? (
            <ToggleRight className="w-10 h-10 text-white" />
          ) : (
            <ToggleLeft className="w-10 h-10 text-gray-600" />
          )}
        </button>
      </div>

      {/* Próximos agendamentos widget */}
      <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-700" />
            <p className="text-sm font-bold text-gray-900">Próximos agendamentos</p>
          </div>
        </div>
        <div className="flex flex-col items-center py-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-400">Nenhum agendamento por enquanto</p>
          <p className="text-xs text-gray-300 mt-0.5">Os serviços agendados aparecerão aqui</p>
        </div>
      </div>

      {/* Últimos orçamentos */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Últimos orçamentos</h2>
          <button
            onClick={() => router.push('/orcamentos')}
            className="flex items-center gap-0.5 text-sm font-semibold text-green-700"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loadingOrc ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl h-16 animate-pulse" />)}
          </div>
        ) : orcamentos.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
            <p className="text-sm text-gray-400">Nenhum orçamento recebido ainda</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {orcamentos.map((orc) => {
              const st = statusConfig[orc.status] ?? statusConfig.pending
              const Icon = st.icon
              return (
                <button
                  key={orc.id}
                  onClick={() => router.push('/orcamentos')}
                  className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform w-full text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{orc.service}</p>
                    {orc.owner && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{orc.owner.full_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${st.color} ${st.bg}`}>
                      <Icon className="w-3 h-3" />
                      {st.label}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(orc.created_at)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Últimas notificações */}
      <div className="mt-4 mb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">Notificações</h2>
            {unreadCount > 0 && (
              <span className="bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => router.push('/notificacoes')}
            className="flex items-center gap-0.5 text-sm font-semibold text-green-700"
          >
            Ver todas <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loadingNotif ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl h-14 animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
            <p className="text-sm text-gray-400">Nenhuma notificação ainda</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => router.push('/notificacoes')}
                className={`rounded-2xl px-4 py-3 shadow-sm border flex items-start gap-3 active:scale-[0.98] transition-transform w-full text-left ${
                  n.read ? 'bg-white border-gray-100' : 'bg-green-50 border-green-100'
                }`}
              >
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? 'bg-gray-300' : 'bg-green-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.body}</p>}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {timeAgo(n.created_at)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
