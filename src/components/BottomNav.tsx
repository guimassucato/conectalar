'use client'

import { Home, Search, MessageSquare, User, Plus, ClipboardList } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/', icon: Home, label: 'Início' },
  { href: '/buscar', icon: Search, label: 'Buscar' },
  { href: '/mensagens', icon: MessageSquare, label: 'Conversas' },
  { href: '/perfil', icon: User, label: 'Perfil' },
]

interface Props {
  role?: string
}

export function BottomNav({ role }: Props) {
  const pathname = usePathname()
  const isGardener = role === 'professional'

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 pb-safe max-w-md mx-auto">
      {navItems.slice(0, 2).map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 py-3 px-4">
            <Icon className={`w-5 h-5 ${active ? 'text-green-700' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-medium ${active ? 'text-green-700' : 'text-gray-400'}`}>
              {label}
            </span>
          </Link>
        )
      })}

      {isGardener ? (
        <Link href="/orcamentos" className="flex flex-col items-center -mt-5">
          <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <span className="text-[10px] font-medium text-gray-500 mt-1">Orçamentos</span>
        </Link>
      ) : (
        <Link href="/pedir-servico" className="flex flex-col items-center -mt-5">
          <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Plus className="w-7 h-7 text-white" />
          </div>
          <span className="text-[10px] font-medium text-gray-500 mt-1">Pedir serviço</span>
        </Link>
      )}

      {navItems.slice(2).map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 py-3 px-4">
            <Icon className={`w-5 h-5 ${active ? 'text-green-700' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-medium ${active ? 'text-green-700' : 'text-gray-400'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
