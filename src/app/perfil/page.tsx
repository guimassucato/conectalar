'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Camera, Eye, EyeOff, LogOut, CheckCircle2, Pencil, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { maskPhone, maskCEP } from '@/lib/masks'
import { BottomNav } from '@/components/BottomNav'

interface Profile {
  full_name: string
  email: string
  phone: string
  avatar_url: string
  cep: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  country: string
}

type Section = 'info' | 'address' | 'password' | null

export default function PerfilPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<Profile>({
    full_name: '', email: '', phone: '', avatar_url: '',
    cep: '', street: '', number: '', neighborhood: '', city: '', state: '', country: 'Brasil',
  })
  const [editing, setEditing] = useState<Section>(null)
  const [draft, setDraft] = useState<Partial<Profile>>({})
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cepLoading, setCepLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url, cep, street, number, neighborhood, city, state, country')
        .eq('id', user.id)
        .single()

      setProfile({
        full_name: data?.full_name ?? '',
        email: user.email ?? '',
        phone: data?.phone ? maskPhone(data.phone) : '',
        avatar_url: data?.avatar_url ?? '',
        cep: data?.cep ? `${data.cep.slice(0,5)}-${data.cep.slice(5)}` : '',
        street: data?.street ?? '',
        number: data?.number ?? '',
        neighborhood: data?.neighborhood ?? '',
        city: data?.city ?? '',
        state: data?.state ?? '',
        country: data?.country ?? 'Brasil',
      })
    }
    load()
  }, [])

  function startEdit(section: Section) {
    setEditing(section)
    setDraft({ ...profile })
    setErrors({})
    setSuccess('')
  }

  function cancelEdit() {
    setEditing(null)
    setDraft({})
    setPassword({ current: '', next: '', confirm: '' })
    setErrors({})
  }

  function draftChange(field: keyof Profile, value: string) {
    let v = value
    if (field === 'phone') v = maskPhone(value)
    if (field === 'cep') {
      v = maskCEP(value)
      if (v.replace(/\D/g, '').length === 8) fetchCEP(v.replace(/\D/g, ''))
    }
    setDraft((p) => ({ ...p, [field]: v }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  async function fetchCEP(cep: string) {
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setDraft((p) => ({
          ...p,
          street: data.logradouro || p.street,
          neighborhood: data.bairro || p.neighborhood,
          city: data.localidade || p.city,
          state: data.uf || p.state,
        }))
      }
    } finally {
      setCepLoading(false)
    }
  }

  async function saveInfo() {
    const e: Record<string, string> = {}
    if (!draft.full_name?.trim() || draft.full_name.trim().split(' ').length < 2)
      e.full_name = 'Informe nome e sobrenome'
    if (!draft.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = 'E-mail inválido'
    if ((draft.phone ?? '').replace(/\D/g, '').length < 10)
      e.phone = 'Número inválido'
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ full_name: draft.full_name, phone: draft.phone!.replace(/\D/g, '') })
      .eq('id', userId!)

    if (draft.email !== profile.email) {
      await supabase.auth.updateUser({ email: draft.email })
    }

    setSaving(false)
    if (!profileErr) {
      setProfile((p) => ({ ...p, ...draft }))
      setEditing(null)
      flash('Informações atualizadas!')
    }
  }

  async function saveAddress() {
    const e: Record<string, string> = {}
    if ((draft.cep ?? '').replace(/\D/g, '').length !== 8) e.cep = 'CEP inválido'
    if (!draft.street?.trim()) e.street = 'Obrigatório'
    if (!draft.number?.trim()) e.number = 'Obrigatório'
    if (!draft.city?.trim()) e.city = 'Obrigatório'
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        cep: draft.cep!.replace(/\D/g, ''),
        street: draft.street,
        number: draft.number,
        neighborhood: draft.neighborhood,
        city: draft.city,
        state: draft.state,
        country: draft.country,
      })
      .eq('id', userId!)

    setSaving(false)
    if (!error) {
      setProfile((p) => ({ ...p, ...draft }))
      setEditing(null)
      flash('Endereço atualizado!')
    }
  }

  async function savePassword() {
    const e: Record<string, string> = {}
    const strong = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    if (!password.next || !strong.test(password.next))
      e.next = 'A senha não atende aos requisitos'
    if (password.next !== password.confirm)
      e.confirm = 'As senhas não coincidem'
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: password.next })
    setSaving(false)
    if (!error) {
      setEditing(null)
      setPassword({ current: '', next: '', confirm: '' })
      flash('Senha alterada!')
    } else {
      setErrors({ next: error.message })
    }
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setAvatarUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!uploadErr) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
      setProfile((p) => ({ ...p, avatar_url: publicUrl }))
      flash('Foto atualizada!')
    }
    setAvatarUploading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  function flash(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  const initials = profile.full_name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[#f2f4f0] flex justify-center">
      <div className="w-full max-w-md flex flex-col pb-28">
        {/* Header */}
        <div className="bg-[#f2f4f0] pt-12 px-5 pb-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </button>
          <h1 className="text-base font-bold text-gray-900">Meu perfil</h1>
          <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 text-sm active:scale-95 transition-transform">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center pt-4 pb-6 px-5">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-green-700 font-bold text-3xl">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-green-700 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform disabled:opacity-60"
            >
              {avatarUploading
                ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Camera className="w-4 h-4 text-white" />
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <p className="font-bold text-gray-900 text-lg">{profile.full_name || '—'}</p>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>

        {success && (
          <div className="mx-5 mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            {success}
          </div>
        )}

        <div className="flex flex-col gap-3 px-5">
          {/* Info section */}
          <Section
            title="Informações pessoais"
            onEdit={() => startEdit('info')}
            editing={editing === 'info'}
            onCancel={cancelEdit}
          >
            {editing === 'info' ? (
              <div className="flex flex-col gap-3 mt-3">
                <Input
                  label="Nome completo"
                  value={draft.full_name ?? ''}
                  onChange={(e) => draftChange('full_name', e.target.value)}
                  error={errors.full_name}
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={draft.email ?? ''}
                  onChange={(e) => draftChange('email', e.target.value)}
                  error={errors.email}
                />
                <Input
                  label="Telefone"
                  value={draft.phone ?? ''}
                  onChange={(e) => draftChange('phone', e.target.value)}
                  error={errors.phone}
                />
                <button
                  onClick={saveInfo}
                  disabled={saving}
                  className="w-full bg-green-700 text-white font-semibold py-3 rounded-2xl active:scale-[0.97] transition-all hover:bg-green-800 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                >
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Salvar
                </button>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-1.5">
                <InfoRow label="Nome" value={profile.full_name} />
                <InfoRow label="E-mail" value={profile.email} />
                <InfoRow label="Telefone" value={profile.phone || '—'} />
              </div>
            )}
          </Section>

          {/* Address section */}
          <Section
            title="Endereço"
            onEdit={() => startEdit('address')}
            editing={editing === 'address'}
            onCancel={cancelEdit}
          >
            {editing === 'address' ? (
              <div className="flex flex-col gap-3 mt-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">CEP</label>
                  <div className="relative">
                    <input
                      value={draft.cep ?? ''}
                      onChange={(e) => draftChange('cep', e.target.value)}
                      placeholder="00000-000"
                      inputMode="numeric"
                      className={`w-full bg-white rounded-2xl py-3 px-4 pr-10 text-sm text-gray-800 placeholder-gray-400 border ${errors.cep ? 'border-red-400' : 'border-gray-200 focus:ring-green-700/20'} outline-none focus:ring-2 transition`}
                    />
                    {cepLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-700/30 border-t-green-700 rounded-full animate-spin" />}
                  </div>
                  {errors.cep && <p className="text-xs text-red-500">{errors.cep}</p>}
                </div>
                <Input label="Rua" value={draft.street ?? ''} onChange={(e) => draftChange('street', e.target.value)} error={errors.street} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Número" value={draft.number ?? ''} onChange={(e) => draftChange('number', e.target.value)} error={errors.number} />
                  <Input label="Bairro" value={draft.neighborhood ?? ''} onChange={(e) => draftChange('neighborhood', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Cidade" value={draft.city ?? ''} onChange={(e) => draftChange('city', e.target.value)} error={errors.city} />
                  <Input label="Estado" value={draft.state ?? ''} onChange={(e) => draftChange('state', e.target.value)} />
                </div>
                <Input label="País" value={draft.country ?? ''} onChange={(e) => draftChange('country', e.target.value)} />
                <button
                  onClick={saveAddress}
                  disabled={saving}
                  className="w-full bg-green-700 text-white font-semibold py-3 rounded-2xl active:scale-[0.97] transition-all hover:bg-green-800 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                >
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Salvar endereço
                </button>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-1.5">
                <InfoRow label="CEP" value={profile.cep || '—'} />
                <InfoRow label="Rua" value={profile.street ? `${profile.street}, ${profile.number}` : '—'} />
                <InfoRow label="Bairro" value={profile.neighborhood || '—'} />
                <InfoRow label="Cidade" value={profile.city ? `${profile.city} - ${profile.state}` : '—'} />
              </div>
            )}
          </Section>

          {/* Password section */}
          <Section
            title="Senha"
            onEdit={() => startEdit('password')}
            editing={editing === 'password'}
            onCancel={cancelEdit}
          >
            {editing === 'password' ? (
              <div className="flex flex-col gap-3 mt-3">
                {(['next', 'confirm'] as const).map((field) => (
                  <div key={field} className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      {field === 'next' ? 'Nova senha' : 'Confirmar nova senha'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPw[field] ? 'text' : 'password'}
                        placeholder={field === 'next' ? 'Mín. 8 caracteres' : 'Repita a senha'}
                        value={password[field]}
                        onChange={(e) => {
                          setPassword((p) => ({ ...p, [field]: e.target.value }))
                          setErrors((p) => ({ ...p, [field]: '' }))
                        }}
                        className={`w-full bg-white rounded-2xl py-3 px-4 pr-11 text-sm text-gray-800 placeholder-gray-400 border ${errors[field] ? 'border-red-400' : 'border-gray-200 focus:ring-green-700/20'} outline-none focus:ring-2 transition`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors[field] && <p className="text-xs text-red-500">{errors[field]}</p>}
                  </div>
                ))}
                <p className="text-xs text-gray-400">Mín. 8 caracteres, letra maiúscula, minúscula, número e caractere especial.</p>
                <button
                  onClick={savePassword}
                  disabled={saving}
                  className="w-full bg-green-700 text-white font-semibold py-3 rounded-2xl active:scale-[0.97] transition-all hover:bg-green-800 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                >
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Alterar senha
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-2">••••••••</p>
            )}
          </Section>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function Section({
  title, children, onEdit, editing, onCancel,
}: {
  title: string
  children: React.ReactNode
  onEdit: () => void
  editing: boolean
  onCancel: () => void
}) {
  return (
    <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        {editing ? (
          <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 active:scale-90 transition-transform">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={onEdit} className="p-1 text-green-700 hover:text-green-800 active:scale-90 transition-transform">
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-700 font-medium">{value}</span>
    </div>
  )
}
