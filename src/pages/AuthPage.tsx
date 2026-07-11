import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'
import { Mic, Mail, Lock, User, UserRound, Sparkles } from 'lucide-react'

export default function AuthPage() {
  const { signIn, signUp, signInAsGuest, loading, error } = useAuthStore()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password, username)
      }
      navigate('/')
    } catch (err: any) {
      setLocalError(err.message || 'حدث خطأ')
    }
  }

  const handleGuest = async () => {
    setLocalError('')
    try {
      await signInAsGuest()
      navigate('/')
    } catch (err: any) {
      setLocalError(err.message || 'حدث خطأ')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 mb-4 shadow-lg shadow-rose-500/30">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">غرف صوتية</h1>
          <p className="text-gray-400">دردشات، أغاني، ألعاب ومزيد</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl">
          <div className="flex gap-2 mb-6 p-1 bg-slate-900/50 rounded-2xl">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'signin' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'signup' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pr-11 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pr-11 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pr-11 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all"
              />
            </div>

            {(localError || error) && (
              <div className="text-rose-400 text-sm text-center bg-rose-500/10 rounded-xl py-2 px-3">
                {localError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري...' : mode === 'signin' ? 'دخول' : 'إنشاء حساب'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-700/50" />
            <span className="text-gray-500 text-xs">أو</span>
            <div className="flex-1 h-px bg-slate-700/50" />
          </div>

          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl border border-slate-600/50 hover:border-amber-500/50 transition-all disabled:opacity-50"
          >
            <UserRound className="w-5 h-5 text-amber-400" />
            <span>الدخول كضيف</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          بدخولك فإنك توافق على شروط الاستخدام وسياسة الخصوصية
        </p>
      </div>
    </div>
  )
}
