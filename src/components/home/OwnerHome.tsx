'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutGrid } from 'lucide-react'
import { CategoryCard } from '@/components/CategoryCard'
import { ProfessionalCard } from '@/components/ProfessionalCard'
import { supabase } from '@/lib/supabase'

const categories = [
  { label: 'Jardinagem', icon: '🌿' },
  { label: 'Roçagem', icon: '🌾' },
  { label: 'Podas', icon: '✂️' },
  { label: 'Piscinas', icon: '🏊' },
]

interface Professional {
  id: string
  name: string
  service: string
  rating: number
  reviews: number
  distance: string
  verified: boolean
  avatarUrl?: string
}

interface Props {
  userId: string
}

export function OwnerHome({ userId }: Props) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfessionals(null)
  }, [])

  async function fetchProfessionals(category: string | null) {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('id, full_name, service, rating, reviews_count, avatar_url')
      .eq('role', 'professional')

    if (category) query = query.ilike('service', `%${category}%`)

    const { data } = await query.order('rating', { ascending: false }).limit(20)

    setProfessionals(
      (data ?? []).map((p) => ({
        id: p.id,
        name: p.full_name ?? 'Profissional',
        service: p.service ?? 'Serviços gerais',
        rating: Number(p.rating) || 0,
        reviews: p.reviews_count ?? 0,
        distance: '—',
        verified: true,
        avatarUrl: p.avatar_url ?? undefined,
      })),
    )
    setLoading(false)
  }

  function handleCategory(label: string) {
    const next = selectedCategory === label ? null : label
    setSelectedCategory(next)
    fetchProfessionals(next)
  }

  return (
    <>
      {/* Categories */}
      <div className="flex gap-3 mt-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <div key={cat.label} className="relative flex-shrink-0">
            <CategoryCard
              icon={cat.icon}
              label={cat.label}
              onClick={() => handleCategory(cat.label)}
              active={selectedCategory === cat.label}
            />
          </div>
        ))}
        <button className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[72px] active:scale-95 transition-transform flex-shrink-0">
          <LayoutGrid className="w-6 h-6 text-gray-500" />
          <span className="text-xs font-medium text-gray-500">Mais</span>
        </button>
      </div>

      {/* Professionals */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">
            {selectedCategory ? `Profissionais de ${selectedCategory}` : 'Profissionais perto de você'}
          </h2>
          {selectedCategory && (
            <button
              onClick={() => { setSelectedCategory(null); fetchProfessionals(null) }}
              className="text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Limpar filtro
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-24 animate-pulse" />
            ))}
          </div>
        ) : professionals.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-sm">
              Nenhum profissional encontrado{selectedCategory ? ` para ${selectedCategory}` : ''}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {professionals.map((pro) => (
              <ProfessionalCard
                key={pro.id}
                professional={pro}
                onViewProfile={(id) => router.push(`/profissional/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
