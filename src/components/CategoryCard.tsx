interface CategoryCardProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
}

export function CategoryCard({ icon, label, onClick, active }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl p-4 shadow-sm border min-w-[72px] active:scale-95 transition-all duration-150 ${
        active
          ? 'bg-green-700 border-green-700'
          : 'bg-white border-gray-100 hover:border-green-200'
      }`}
    >
      <div className="text-2xl">{icon}</div>
      <span className={`text-xs font-medium text-center leading-tight ${active ? 'text-white' : 'text-green-700'}`}>
        {label}
      </span>
    </button>
  )
}
