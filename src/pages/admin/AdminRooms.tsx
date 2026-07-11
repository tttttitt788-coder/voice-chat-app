import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Room } from '@/types'
import { Trash2, Power, PowerOff, Mic, Lock, Globe } from 'lucide-react'

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('rooms').select('*').order('created_at', { ascending: false })
    if (data) setRooms(data as Room[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (room: Room) => {
    await supabase.from('rooms').update({ is_active: !room.is_active }).eq('id', room.id)
    load()
  }

  const deleteRoom = async (room: Room) => {
    if (!confirm(`حذف غرفة "${room.name}"؟`)) return
    await supabase.from('room_seats').delete().eq('room_id', room.id)
    await supabase.from('room_participants').delete().eq('room_id', room.id)
    await supabase.from('messages').delete().eq('room_id', room.id)
    await supabase.from('rooms').delete().eq('id', room.id)
    load()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">إدارة الغرف</h1>
      {loading ? (
        <div className="text-gray-400 text-center py-8">جاري التحميل...</div>
      ) : rooms.length === 0 ? (
        <div className="text-gray-500 text-center py-16"><Mic className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد غرف</p></div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div key={room.id} className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"><Mic className="w-5 h-5 text-rose-400" /></div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{room.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {room.room_type === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    <span>{room.category}</span><span>•</span><span>{room.participant_count} مشارك</span><span>•</span>
                    <span className={room.is_active ? 'text-emerald-400' : 'text-rose-400'}>{room.is_active ? 'نشطة' : 'متوقفة'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(room)} className={`p-2 rounded-xl transition-all ${room.is_active ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`} title={room.is_active ? 'إيقاف' : 'تفعيل'}>
                  {room.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteRoom(room)} className="p-2 rounded-xl bg-slate-800/50 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
