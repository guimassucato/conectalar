'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Star, BadgeCheck, MapPin, Phone, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProfessionalProfile {
  id: string
  full_name: string
  service: string
  rating: number
  reviews_count: number
  city: string
  state: string
  avatar_url: string | null
  phone: string | null
}

export default function ProfissionalPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [pro, setPro] = useState<ProfessionalProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, service, rating, reviews_count, city, state, avatar_url, phone')
        .eq('id', id)
        .eq('role', 'professional')
        .single()
      setPro(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f4f0] flex justify-center">
        <div className="w-full max-w-md pt-12 px-5">
          <div className="h-48 bg-white rounded-3xl animate-pulse mb-4" />
          <div className="h-24 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!pro) {
    return (
      <div className="min-h-screen bg-[#f2f4f0] flex items-center justify-center">
        <p className="text-gray-400">Profissional não encontrado.</p>
      </div>
    )
  }

  const initials = pro.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

  return (
    <div className="min-h-screen bg-[#f2f4f0] flex justify-center">
      <div className="w-full max-w-md flex flex-col pb-10">
        {/* Top bar */}
        <div className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-900">Perfil do profissional</h1>
        </div>

        {/* Profile card */}
        <div className="mx-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-green-100 flex items-center justify-center mb-3">
            {pro.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pro.avatar_url} alt={pro.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-green-700 font-bold text-3xl">{initials}</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{pro.full_name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{pro.service ?? 'Serviços gerais'}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-800">{pro.rating > 0 ? pro.rating.toFixed(1) : '—'}</span>
            <span className="text-sm text-gray-400">({pro.reviews_count} avaliações)</span>
          </div>
          {(pro.city || pro.state) && (
            <div className="flex items-center gap-1 mt-2 text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">{[pro.city, pro.state].filter(Boolean).join(' - ')}</span>
            </div>
          )}
          <div className="flex items-center gap-1 mt-1">
            <BadgeCheck className="w-4 h-4 text-green-600 fill-green-100" />
            <span className="text-xs font-semibold text-green-700 tracking-wide">VERIFICADO</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mx-5 flex flex-col gap-3">
          <button className="w-full bg-green-700 text-white font-semibold py-3.5 rounded-2xl active:scale-[0.97] transition-all hover:bg-green-800 flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Enviar mensagem
          </button>
          {pro.phone && (
            <button className="w-full bg-white text-green-700 font-semibold py-3.5 rounded-2xl border border-green-200 active:scale-[0.97] transition-all hover:bg-green-50 flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              Ligar
            </button>
          )}
        </div>

        {/* Placeholder for future content */}
        <div className="mx-5 mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-900 mb-2">Avaliações</p>
          <p className="text-xs text-gray-400">As avaliações serão exibidas em breve.</p>
        </div>
      </div>
    </div>
  )
}
