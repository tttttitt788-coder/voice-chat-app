import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import type { Room } from '@/types'
import { CATEGORIES } from '@/types'
import { Mic, Search, Plus, Users, Lock, Globe, LogOut, Coins, Flame } from 'lucide-react'
import CreateRoomModal from '@/components/CreateRoomModal'

export default function HomePage() {
  const { profile, signOut, refreshProfile } = useAuthStore()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showCreate, setShowCreate] = useState(false)

  const loadRooms = async () => {
    setLoading(true)
    try {
      let query = supabase.from('rooms').select('*').eq('is_active', true).order('created_at', { ascending: false })
      if (category !== 'all') query = query.eq('category', category)
      if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)
      const { data, error } = await query
      if (!error && data) setRooms(data as Room[])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadRooms()
    refreshProfile()
  }, [category, search])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">غرف صوتية</h1>
              <p className="text-gray-500 text-xs">أهلاً، {profile?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 font-semibold text-sm">{profile?.coins ?? 0}</span>
            </div>
            {profile?.is_guest && (
              <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/30">
                ضيف
              </span>
            )}
            <button
              onClick={() => { signOut(); navigate('/auth') }}
              className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-gray-400 hover:text-rose-400 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="ابحث عن غرفة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 pr-11 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                category === cat.id
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="w-full mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold py-3 rounded-2xl shadow-lg shadow-rose-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>إنشاء غرفة جديدة</span>
        </button>

        {!loading && rooms.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-white font-bold">غرف رائجة</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {rooms.slice(0, 5).map((room) => (
                <button
                  key={room.id}
                  onClick={() => navigate(`/room/${room.id}`)}
                  className="flex-shrink-0 w-44 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 hover:border-rose-500/30 hover:bg-slate-800 transition-all text-right"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/30 to-pink-600/30 flex items-center justify-center mb-3">
                    <Mic className="w-6 h-6 text-rose-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1 truncate">{room.name}</h3>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span>{room.participant_count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-white font-bold mb-3">جميع الغرف</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800/30 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد غرف متاحة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => navigate(`/room/${room.id}`)}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 hover:border-rose-500/30 hover:bg-slate-800 transition-all text-right animate-fadeIn"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/30 to-pink-600/30 flex items-center justify-center">
                      <Mic className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{room.name}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">{room.category}</p>
                    </div>
                  </div>
                  {room.room_type === 'private' ? (
                    <Lock className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                {room.description && (
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">{room.description}</p>
                )}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{room.participant_count} / {room.max_seats}</span>
                  </div>
                  <div className="flex items-center gap-1 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>انضم</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={(roomId) => { setShowCreate(false); navigate(`/room/${roomId}`) }}
        />
      )}
    </div>
  )
}
