import { Star, BadgeCheck } from 'lucide-react'
import Image from 'next/image'

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

interface ProfessionalCardProps {
  professional: Professional
  onViewProfile?: (id: string) => void
}

export function ProfessionalCard({ professional, onViewProfile }: ProfessionalCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        {professional.avatarUrl ? (
          <Image
            src={professional.avatarUrl}
            alt={professional.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
            {professional.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-gray-900 text-sm">{professional.name}</p>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{professional.distance}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{professional.service}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-gray-700">{professional.rating}</span>
          <span className="text-xs text-gray-400">({professional.reviews})</span>
        </div>
        {professional.verified && (
          <div className="flex items-center gap-1 mt-1">
            <BadgeCheck className="w-3.5 h-3.5 text-green-600 fill-green-100" />
            <span className="text-xs font-semibold text-green-700 tracking-wide">VERIFICADO</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onViewProfile?.(professional.id)}
        className="flex-shrink-0 bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform hover:bg-green-800"
      >
        Ver perfil
      </button>
    </div>
  )
}
