import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Mic, Users, Gift, Coins, TrendingUp, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ rooms: 0, activeRooms: 0, users: 0, guests: 0, gifts: 0, totalCoins: 0, transactions: 0 })

  useEffect(() => {
    (async () => {
      const [roomsRes, giftsRes, txRes] = await Promise.all([
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('gifts').select('*', { count: 'exact', head: true }),
        supabase.from('gift_transactions').select('total_coins', { count: 'exact' }),
      ])
      const totalCoins = txRes.data?.reduce((sum, t) => sum + (t.total_coins || 0), 0) || 0
      const { count: activeCount } = await supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('is_active', true)
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: guestCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_guest', true)
      setStats({ rooms: roomsRes.count || 0, activeRooms: activeCount || 0, users: userCount || 0, guests: guestCount || 0, gifts: giftsRes.count || 0, totalCoins, transactions: txRes.count || 0 })
    })()
  }, [])

  const cards = [
    { label: 'إجمالي الغرف', value: stats.rooms, icon: Mic, color: 'from-rose-500 to-pink-600' },
    { label: 'الغرف النشطة', value: stats.activeRooms, icon: Activity, color: 'from-emerald-500 to-teal-600' },
    { label: 'إجمالي المستخدمين', value: stats.users, icon: Users, color: 'from-blue-500 to-indigo-600' },
    { label: 'المستخدمون الضيوف', value: stats.guests, icon: Users, color: 'from-amber-500 to-orange-600' },
    { label: 'الهدايا المتاحة', value: stats.gifts, icon: Gift, color: 'from-purple-500 to-fuchsia-600' },
    { label: 'معاملات الهدايا', value: stats.transactions, icon: TrendingUp, color: 'from-cyan-500 to-blue-600' },
    { label: 'إجمالي العملات', value: stats.totalCoins, icon: Coins, color: 'from-yellow-500 to-amber-600' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">نظرة عامة</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-5">
              <div className={'w-12 h-12 rounded-xl bg-gradient-to-br ' + card.color + ' flex items-center justify-center mb-3'}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm mb-1">{card.label}</p>
              <p className="text-white text-2xl font-bold">{card.value.toLocaleString()}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
