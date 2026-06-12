interface CategoryCardProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

export function CategoryCard({ icon, label, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[72px] active:scale-95 transition-transform"
    >
      <div className="text-2xl">{icon}</div>
      <span className="text-xs font-medium text-green-700 text-center leading-tight">{label}</span>
    </button>
  )
}
