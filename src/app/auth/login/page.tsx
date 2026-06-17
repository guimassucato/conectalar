'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(field: 'email' | 'password', value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const e: { email?: string; password?: string } = {}
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'E-mail inválido'
    if (!form.password) e.password = 'Informe a senha'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length > 0) { setErrors(v); return }

    setLoading(true)
    setServerError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setServerError('E-mail ou senha incorretos')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#f2f4f0] flex justify-center">
      <div className="w-full max-w-md flex flex-col px-5 pt-14">
        <Link href="/" className="flex items-center gap-1 text-gray-500 mb-10 w-fit">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Voltar</span>
        </Link>

        {/* Logo / marca */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center">
            <span className="text-white text-lg">🌿</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ConectaLar</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bem-vindo de volta</h1>
        <p className="text-sm text-gray-500 mb-8">Entre na sua conta para continuar</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="joao@email.com"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Sua senha"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
          />

          <div className="flex justify-end">
            <Link href="/auth/esqueci-senha" className="text-sm font-medium text-green-700">
              Esqueci minha senha
            </Link>
          </div>

          {serverError && (
            <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl px-4 py-2">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white font-semibold py-3.5 rounded-2xl mt-2 active:scale-95 transition-all hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Não tem conta?{' '}
          <Link href="/auth/cadastro" className="font-semibold text-green-700">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
