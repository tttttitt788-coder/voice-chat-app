import { useState } from 'react'
import { useAdminAuthStore } from '@/stores/admin-auth'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const { login, loading, error } = useAdminAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err: any) {
      setLocalError(err.message || 'فشل تسجيل الدخول')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-emerald-600 mb-4 shadow-lg shadow-blue-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">لوحة التحكم</h1>
          <p className="text-gray-400 text-sm">تسجيل دخول المشرف</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pr-11 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all" />
            </div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pr-11 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all" />
            </div>
            {(localError || error) && <div className="text-rose-400 text-sm text-center bg-rose-500/10 rounded-xl py-2 px-3">{localError || error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
              {loading ? 'جاري...' : 'دخول لوحة التحكم'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
