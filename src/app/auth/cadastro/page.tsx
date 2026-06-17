'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Leaf, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { maskCPF, maskPhone, validateCPF, validateAge } from '@/lib/masks'

type Role = 'owner' | 'gardener' | null

interface FormData {
  fullName: string
  email: string
  cpf: string
  phone: string
  birthDate: string
  gender: string
  password: string
  confirmPassword: string
}

interface Errors {
  [key: string]: string
}

const genderOptions = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
  { value: 'other', label: 'Outro' },
  { value: 'prefer_not_to_say', label: 'Prefiro não informar' },
]

export default function CadastroPage() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'form'>('role')
  const [role, setRole] = useState<Role>(null)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    cpf: '',
    phone: '',
    birthDate: '',
    gender: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Errors>({})

  function handleChange(field: keyof FormData, value: string) {
    let v = value
    if (field === 'cpf') v = maskCPF(value)
    if (field === 'phone') v = maskPhone(value)
    setForm((prev) => ({ ...prev, [field]: v }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const e: Errors = {}
    if (!form.fullName.trim() || form.fullName.trim().split(' ').length < 2)
      e.fullName = 'Informe o nome completo'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = 'E-mail inválido'
    if (!validateCPF(form.cpf))
      e.cpf = 'CPF inválido'
    if (form.phone.replace(/\D/g, '').length < 10)
      e.phone = 'Celular inválido'
    if (!validateAge(form.birthDate))
      e.birthDate = 'Você precisa ter pelo menos 18 anos'
    if (!form.gender)
      e.gender = 'Selecione o gênero'
    if (form.password.length < 6)
      e.password = 'A senha deve ter pelo menos 6 caracteres'
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'As senhas não coincidem'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setServerError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
      },
    })

    if (signUpError || !data.user) {
      setServerError(signUpError?.message ?? 'Erro ao criar conta')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      full_name: form.fullName,
      cpf: form.cpf.replace(/\D/g, ''),
      phone: form.phone.replace(/\D/g, ''),
      birth_date: form.birthDate,
      gender: form.gender,
    })

    if (profileError) {
      setServerError(profileError.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-[#f2f4f0] flex justify-center">
        <div className="w-full max-w-md flex flex-col px-5 pt-14">
          <Link href="/auth/login" className="flex items-center gap-1 text-gray-500 mb-8 w-fit">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Criar conta</h1>
          <p className="text-sm text-gray-500 mb-8">Você é quem no ConectaLar?</p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => { setRole('owner'); setStep('form') }}
              className="bg-white rounded-2xl p-5 border-2 border-transparent hover:border-green-700 transition-all shadow-sm flex items-center gap-4 active:scale-95"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-green-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Dono de residência</p>
                <p className="text-xs text-gray-500 mt-0.5">Quero contratar profissionais para minha casa</p>
              </div>
            </button>

            <button
              onClick={() => { setRole('gardener'); setStep('form') }}
              className="bg-white rounded-2xl p-5 border-2 border-transparent hover:border-green-700 transition-all shadow-sm flex items-center gap-4 active:scale-95"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-6 h-6 text-green-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Jardineiro</p>
                <p className="text-xs text-gray-500 mt-0.5">Quero oferecer meus serviços na plataforma</p>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Já tem conta?{' '}
            <Link href="/auth/login" className="font-semibold text-green-700">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f2f4f0] flex justify-center">
      <div className="w-full max-w-md flex flex-col px-5 pt-14 pb-10">
        <button
          onClick={() => setStep('role')}
          className="flex items-center gap-1 text-gray-500 mb-6 w-fit"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center">
            {role === 'gardener' ? (
              <Leaf className="w-4 h-4 text-white" />
            ) : (
              <Home className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
            {role === 'gardener' ? 'Jardineiro' : 'Dono de residência'}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Seus dados</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome completo"
            placeholder="João da Silva"
            value={form.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            error={errors.fullName}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="joao@email.com"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
          />
          <Input
            label="CPF"
            placeholder="000.000.000-00"
            inputMode="numeric"
            value={form.cpf}
            onChange={(e) => handleChange('cpf', e.target.value)}
            error={errors.cpf}
          />
          <Input
            label="Celular"
            placeholder="(44) 99999-0000"
            inputMode="numeric"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
          />
          <Input
            label="Data de nascimento"
            type="date"
            value={form.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            error={errors.birthDate}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
              .toISOString()
              .split('T')[0]}
          />
          <Select
            label="Gênero"
            options={genderOptions}
            value={form.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            error={errors.gender}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
          />
          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
            value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
          />

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
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link href="/auth/login" className="font-semibold text-green-700">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
