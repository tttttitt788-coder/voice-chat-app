import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Gift } from '@/types'
import { RARITY_COLORS } from '@/types'
import { Plus, Trash2, Edit3, X, Coins } from 'lucide-react'

export default function AdminGifts() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Gift | null>(null)
  const [form, setForm] = useState({ name: '', icon_url: '', coin_price: 10, rarity: 'common', category: 'general' })

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('gifts').select('*').order('coin_price')
    if (data) setGifts(data as Gift[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', icon_url: '', coin_price: 10, rarity: 'common', category: 'general' }); setShowForm(true) }
  const openEdit = (gift: Gift) => { setEditing(gift); setForm({ name: gift.name, icon_url: gift.icon_url, coin_price: gift.coin_price, rarity: gift.rarity, category: gift.category }); setShowForm(true) }

  const save = async () => {
    if (!form.name.trim()) return
    if (editing) { await supabase.from('gifts').update(form).eq('id', editing.id) }
    else { await supabase.from('gifts').insert({ ...form, is_active: true }) }
    setShowForm(false); load()
  }

  const remove = async (gift: Gift) => {
    if (!confirm(`حذف هدية "${gift.name}"؟`)) return
    await supabase.from('gifts').update({ is_active: false }).eq('id', gift.id)
    load()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">إدارة الهدايا</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-all">
          <Plus className="w-4 h-4" /><span>هدية جديدة</span>
        </button>
      </div>
      {loading ? (
        <div className="text-gray-400 text-center py-8">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {gifts.filter(g => g.is_active).map((gift) => {
            const rarity = RARITY_COLORS[gift.rarity] || RARITY_COLORS.common
            return (
              <div key={gift.id} className={`relative rounded-2xl border p-4 ${rarity.bg} ${rarity.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center text-2xl">{gift.icon_url || '🎁'}</div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(gift)} className="p-1.5 rounded-lg bg-slate-700/50 text-gray-400 hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(gift)} className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-sm">{gift.name}</h3>
                <div className="flex items-center gap-1 mt-1"><Coins className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-300 text-sm font-semibold">{gift.coin_price}</span></div>
                <p className={`text-xs mt-1 ${rarity.text}`}>{gift.rarity}</p>
              </div>
            )
          })}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-slate-800/95 rounded-3xl border border-slate-700/50 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">{editing ? 'تعديل هدية' : 'هدية جديدة'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-700/50 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-gray-400 text-sm mb-1.5 block">الاسم</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50" /></div>
              <div><label className="text-gray-400 text-sm mb-1.5 block">الأيقونة (إيموجي)</label>
                <input type="text" value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} placeholder="🎁" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50" /></div>
              <div><label className="text-gray-400 text-sm mb-1.5 block">السعر (عملة)</label>
                <input type="number" value={form.coin_price} onChange={(e) => setForm({ ...form, coin_price: Number(e.target.value) })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50" /></div>
              <div><label className="text-gray-400 text-sm mb-1.5 block">الندرة</label>
                <select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50">
                  <option value="common">عادي</option><option value="rare">نادر</option><option value="epic">ملحمي</option><option value="legendary">أسطوري</option>
                </select></div>
              <button onClick={save} className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-all">{editing ? 'حفظ' : 'إنشاء'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
