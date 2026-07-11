import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { X, Lock, Globe, Mic } from 'lucide-react'

interface Props {
  onClose: () => void
  onCreated: (roomId: string) => void
}

export default function CreateRoomModal({ onClose, onCreated }: Props) {
  const { profile } = useAuthStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('chat')
  const [roomType, setRoomType] = useState<'public' | 'private'>('public')
  const [password, setPassword] = useState('')
  const [maxSeats, setMaxSeats] = useState(8)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim() || !profile) return
    setLoading(true)
    setError('')
    try {
      const { data, error: insertError } = await supabase
        .from('rooms')
        .insert({
          name: name.trim(), description: description.trim() || null, category, room_type: roomType,
          owner_id: profile.id, max_seats: maxSeats, password: roomType === 'private' ? password : null,
          is_locked: roomType === 'private' && !!password, is_active: true,
        })
        .select().single()
      if (insertError) throw insertError
      const seats = Array.from({ length: maxSeats }, (_, i) => ({
        room_id: data.id, seat_number: i + 1, seat_role: i === 0 ? 'owner' : 'listener',
        user_id: i === 0 ? profile.id : null, occupied_at: i === 0 ? new Date().toISOString() : null,
      }))
      await supabase.from('room_seats').insert(seats)
      await supabase.from('room_participants').insert({ room_id: data.id, user_id: profile.id, is_speaker: true, is_moderator: true })
      onCreated(data.id)
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الغرفة')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">إنشاء غرفة جديدة</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-700/50 text-gray-400 hover:text-white transition-all"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">اسم الغرفة</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: غرفة الدردشة الليلية" maxLength={50}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">الوصف (اختياري)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف مختصر للغرفة" maxLength={200}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">التصنيف</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-rose-500/50 transition-all">
              <option value="chat">دردشة</option><option value="music">موسيقى</option><option value="gaming">ألعاب</option>
              <option value="education">تعليم</option><option value="religion">ديني</option><option value="sports">رياضة</option><option value="comedy">كوميدي</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">نوع الغرفة</label>
            <div className="flex gap-2">
              <button onClick={() => setRoomType('public')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${roomType === 'public' ? 'bg-blue-500 text-white' : 'bg-slate-900/50 text-gray-400'}`}>
                <Globe className="w-4 h-4" /><span>عامة</span>
              </button>
              <button onClick={() => setRoomType('private')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${roomType === 'private' ? 'bg-amber-500 text-white' : 'bg-slate-900/50 text-gray-400'}`}>
                <Lock className="w-4 h-4" /><span>خاصة</span>
              </button>
            </div>
          </div>
          {roomType === 'private' && (
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">كلمة المرور (اختياري)</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة مرور الغرفة"
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all" />
            </div>
          )}
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">عدد المقاعد: {maxSeats}</label>
            <input type="range" min={4} max={20} value={maxSeats} onChange={(e) => setMaxSeats(Number(e.target.value))} className="w-full accent-rose-500" />
          </div>
          {error && <div className="text-rose-400 text-sm text-center bg-rose-500/10 rounded-xl py-2">{error}</div>}
          <button onClick={handleCreate} disabled={loading || !name.trim()} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-rose-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50">
            <Mic className="w-5 h-5" /><span>{loading ? 'جاري الإنشاء...' : 'إنشاء الغرفة'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
