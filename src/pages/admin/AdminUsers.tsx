import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import { Ban, CheckCircle, Coins, User } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'guest' | 'registered'>('all')

  const load = async () => {
    setLoading(true)
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (filter === 'guest') query = query.eq('is_guest', true)
    if (filter === 'registered') query = query.eq('is_guest', false)
    const { data } = await query
    if (data) setUsers(data as Profile[])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const toggleBan = async (user: Profile) => {
    await supabase.from('profiles').update({ is_banned: !user.is_banned }).eq('id', user.id)
    load()
  }

  const addCoins = async (user: Profile) => {
    const amount = prompt(`إضافة عملات إلى ${user.username}`, '100')
    if (!amount) return
    const num = Number(amount)
    if (isNaN(num) || num <= 0) return
    await supabase.from('profiles').update({ coins: user.coins + num }).eq('id', user.id)
    load()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">إدارة المستخدمين</h1>
      <div className="flex gap-2 mb-4">
        {(['all', 'registered', 'guest'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-blue-500 text-white' : 'bg-slate-800/50 text-gray-400 hover:text-white'}`}>
            {f === 'all' ? 'الكل' : f === 'guest' ? 'الضيوف' : 'المسجلون'}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-gray-400 text-center py-8">جاري التحميل...</div>
      ) : users.length === 0 ? (
        <div className="text-gray-500 text-center py-16"><User className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا يوجد مستخدمون</p></div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-emerald-600/30 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-sm">{user.username}</h3>
                    {user.is_guest && <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full">ضيف</span>}
                    {user.is_banned && <span className="bg-rose-500/20 text-rose-300 text-xs px-2 py-0.5 rounded-full">محظور</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5"><Coins className="w-3 h-3 text-amber-400" /><span>{user.coins} عملة</span><span>•</span><span>المستوى {user.level}</span></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => addCoins(user)} className="p-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all" title="إضافة عملات"><Coins className="w-4 h-4" /></button>
                <button onClick={() => toggleBan(user)} className={`p-2 rounded-xl transition-all ${user.is_banned ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'}`} title={user.is_banned ? 'رفع الحظر' : 'حظر'}>
                  {user.is_banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
