'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ClipboardList } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'

export default function OrcamentosPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f2f4f0] flex justify-center">
      <div className="w-full max-w-md flex flex-col pb-28">
        <div className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-900 text-lg">Orçamentos</h1>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 px-5 mt-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-green-700" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Em breve</h2>
          <p className="text-sm text-gray-400">
            A listagem completa de orçamentos será implementada em breve.
          </p>
        </div>
      </div>

      <BottomNav role="professional" />
    </div>
  )
}
