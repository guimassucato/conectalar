'use client'

import { Search, Bell, MapPin, ChevronDown, LayoutGrid } from 'lucide-react'
import { CategoryCard } from '@/components/CategoryCard'
import { ProfessionalCard } from '@/components/ProfessionalCard'
import { BottomNav } from '@/components/BottomNav'

const categories = [
  { label: 'Jardinagem', icon: '🌿' },
  { label: 'Roçagem', icon: '🌾' },
  { label: 'Podas', icon: '✂️' },
  { label: 'Piscinas', icon: '🏊' },
]

const professionals = [
  {
    id: '1',
    name: 'João Silva',
    service: 'Jardinagem',
    rating: 4.9,
    reviews: 122,
    distance: '1,2 km',
    verified: true,
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    service: 'Roçagem',
    rating: 4.8,
    reviews: 98,
    distance: '2,1 km',
    verified: true,
  },
  {
    id: '3',
    name: 'Paulo Santos',
    service: 'Podas e Cortes',
    rating: 4.7,
    reviews: 76,
    distance: '2,8 km',
    verified: true,
  },
]

export default function Home() {
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
            <button className="p-1">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Olá, Carlos! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 mb-4">Como podemos te ajudar hoje?</p>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Que serviço você precisa?"
              className="w-full bg-white rounded-2xl py-3 pl-4 pr-12 text-sm text-gray-600 placeholder-gray-400 shadow-sm border border-gray-100 outline-none focus:ring-2 focus:ring-green-700/20"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-28">
          {/* Categories */}
          <div className="flex gap-3 mt-5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <CategoryCard key={cat.label} icon={cat.icon} label={cat.label} />
            ))}
            <button className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[72px] active:scale-95 transition-transform flex-shrink-0">
              <LayoutGrid className="w-6 h-6 text-gray-500" />
              <span className="text-xs font-medium text-gray-500">Mais</span>
            </button>
          </div>

          {/* Professionals section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Profissionais perto de você</h2>
              <button className="text-sm font-semibold text-green-700">Ver todos</button>
            </div>

            <div className="flex flex-col gap-3">
              {professionals.map((pro) => (
                <ProfessionalCard
                  key={pro.id}
                  professional={pro}
                  onViewProfile={(id) => console.log('Ver perfil:', id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <BottomNav />
      </div>
    </div>
  )
}
