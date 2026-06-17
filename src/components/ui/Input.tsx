interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className={`w-full bg-white rounded-2xl py-3 px-4 text-sm text-gray-800 placeholder-gray-400 border ${
          error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-green-700/20'
        } outline-none focus:ring-2 transition ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
