import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import type { Room, RoomSeat, Profile } from '@/types'
import { ArrowRight, Mic, MicOff, Lock, Unlock, Send, Gift, Crown, Shield, Users, Volume2 } from 'lucide-react'
import RoomChat from '@/components/RoomChat'
import GiftPanel from '@/components/GiftPanel'

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuthStore()
  const [room, setRoom] = useState<Room | null>(null)
  const [seats, setSeats] = useState<RoomSeat[]>([])
  const [loading, setLoading] = useState(true)
  const [showGifts, setShowGifts] = useState(false)
  const [giftReceiver, setGiftReceiver] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})

  const loadRoom = useCallback(async () => {
    if (!roomId) return
    const { data } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle()
    if (data) setRoom(data as Room)
  }, [roomId])

  const loadSeats = useCallback(async () => {
    if (!roomId) return
    const { data } = await supabase.from('room_seats').select('*').eq('room_id', roomId).order('seat_number')
    if (data) setSeats(data as RoomSeat[])
  }, [roomId])

  const loadProfiles = useCallback(async (seatsData: RoomSeat[]) => {
    const userIds = seatsData.filter(s => s.user_id).map(s => s.user_id!)
    if (userIds.length === 0) return
    const { data } = await supabase.from('profiles').select('*').in('id', userIds)
    if (data) {
      const map: Record<string, Profile> = {}
      data.forEach(p => { map[p.id] = p as Profile })
      setProfiles(map)
    }
  }, [])

  useEffect(() => {
    (async () => {
      setLoading(true)
      await loadRoom()
      await loadSeats()
      setLoading(false)
    })()
  }, [roomId])

  useEffect(() => {
    loadProfiles(seats)
  }, [seats])

  useEffect(() => {
    if (!roomId) return
    const channel = supabase.channel(`room-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_seats', filter: `room_id=eq.${roomId}` }, () => loadSeats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, () => loadRoom())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId, loadSeats, loadRoom])

  const isOwner = room?.owner_id === profile?.id
  const mySeat = seats.find(s => s.user_id === profile?.id)

  const takeSeat = async (seatNumber: number) => {
    if (!profile || !roomId) return
    const seat = seats.find(s => s.seat_number === seatNumber)
    if (seat?.user_id) return
    if (mySeat) {
      await supabase.from('room_seats').update({ user_id: null, is_muted: false, occupied_at: null }).eq('id', mySeat.id)
    }
    await supabase.from('room_seats')
      .update({ user_id: profile.id, occupied_at: new Date().toISOString(), is_muted: false })
      .eq('room_id', roomId).eq('seat_number', seatNumber)
    loadSeats()
  }

  const leaveSeat = async () => {
    if (!mySeat) return
    await supabase.from('room_seats').update({ user_id: null, is_muted: false, occupied_at: null, is_locked: false }).eq('id', mySeat.id)
    loadSeats()
  }

  const toggleMute = async () => {
    if (!mySeat) return
    await supabase.from('room_seats').update({ is_muted: !mySeat.is_muted }).eq('id', mySeat.id)
    loadSeats()
  }

  const toggleLockSeat = async (seat: RoomSeat) => {
    if (!isOwner) return
    await supabase.from('room_seats').update({ is_locked: !seat.is_locked }).eq('id', seat.id)
    loadSeats()
  }

  const kickFromSeat = async (seat: RoomSeat) => {
    if (!isOwner || !seat.user_id) return
    await supabase.from('room_seats').update({ user_id: null, is_muted: false, occupied_at: null }).eq('id', seat.id)
    loadSeats()
  }

  const sendGift = async (giftId: string, receiverId: string, quantity: number) => {
    if (!profile || !roomId) return
    const { data: gift } = await supabase.from('gifts').select('*').eq('id', giftId).maybeSingle()
    if (!gift) return
    const totalCoins = gift.coin_price * quantity
    if (profile.coins < totalCoins) { alert('لا تملك عملات كافية'); return }
    await supabase.from('profiles').update({ coins: profile.coins - totalCoins, gifts_sent_count: profile.gifts_sent_count + 1 }).eq('id', profile.id)
    const receiver = profiles[receiverId]
    if (receiver) {
      await supabase.from('profiles').update({
        coins: receiver.coins + totalCoins,
        gifts_received_count: receiver.gifts_received_count + 1,
        total_coins_received: receiver.total_coins_received + totalCoins,
      }).eq('id', receiverId)
    }
    await supabase.from('gift_transactions').insert({ gift_id: giftId, sender_id: profile.id, receiver_id: receiverId, room_id: roomId, quantity, total_coins: totalCoins })
    await supabase.from('messages').insert({
      room_id: roomId, sender_id: profile.id,
      content: `🎁 أرسل ${profile.username} ${gift.name} إلى ${receiver?.username || 'مستخدم'}`,
      message_type: 'gift', gift_id: giftId,
    })
    refreshProfile()
    setShowGifts(false)
    setGiftReceiver(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-gray-400">
        <p className="mb-4">الغرفة غير موجودة</p>
        <button onClick={() => navigate('/')} className="text-rose-400 hover:text-rose-300">العودة للرئيسية</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-slate-800/50 text-gray-400 hover:text-white transition-all">
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold">{room.name}</h1>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Users className="w-3.5 h-3.5" />
              <span>{room.participant_count} مشارك</span>
              {room.room_type === 'private' && <Lock className="w-3.5 h-3.5 text-amber-400" />}
            </div>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 pb-32">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          {seats.map((seat) => {
            const seatUser = seat.user_id ? profiles[seat.user_id] : null
            const isMySeat = seat.user_id === profile?.id
            const canManage = isOwner && seat.user_id && !isMySeat
            return (
              <div
                key={seat.id}
                className={`relative aspect-square rounded-2xl border p-3 flex flex-col items-center justify-center transition-all ${
                  seat.is_locked ? 'bg-slate-900/80 border-slate-700/30'
                  : seat.user_id ? 'bg-slate-800/50 border-slate-700/50'
                  : 'bg-slate-800/20 border-slate-700/30 hover:border-rose-500/30 cursor-pointer'
                }`}
                onClick={() => !seat.is_locked && !seat.user_id && takeSeat(seat.seat_number)}
              >
                {seat.seat_role === 'owner' && <div className="absolute top-1 right-1"><Crown className="w-4 h-4 text-amber-400" /></div>}
                {seat.seat_role === 'admin' && <div className="absolute top-1 right-1"><Shield className="w-4 h-4 text-blue-400" /></div>}
                {seat.is_locked && <Lock className="w-6 h-6 text-gray-600" />}
                {seatUser && !seat.is_locked && (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500/30 to-pink-600/30 flex items-center justify-center mb-1">
                      <span className="text-white font-bold text-sm">{seatUser.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="text-white text-xs font-semibold truncate max-w-full">{seatUser.username}</p>
                    {seat.is_muted ? <MicOff className="w-3.5 h-3.5 text-rose-400 mt-1" /> : seat.user_id && <Mic className="w-3.5 h-3.5 text-emerald-400 mt-1" />}
                  </>
                )}
                {!seat.user_id && !seat.is_locked && (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-700/30 flex items-center justify-center mb-1"><span className="text-gray-600 text-lg">+</span></div>
                    <p className="text-gray-500 text-xs">مقعد {seat.seat_number}</p>
                  </>
                )}
                {isOwner && (
                  <div className="absolute bottom-1 left-1 flex gap-1">
                    {seat.user_id && canManage && (
                      <button onClick={(e) => { e.stopPropagation(); kickFromSeat(seat) }} className="p-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all">
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); toggleLockSeat(seat) }} className="p-1 rounded-lg bg-slate-700/50 text-gray-400 hover:text-white transition-all">
                      {seat.is_locked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    </button>
                  </div>
                )}
                {seat.user_id && !isMySeat && (
                  <button onClick={(e) => { e.stopPropagation(); setGiftReceiver(seat.user_id); setShowGifts(true) }} className="absolute bottom-1 right-1 p-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all">
                    <Gift className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {mySeat && (
          <div className="flex gap-2 mb-4">
            <button onClick={toggleMute} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${mySeat.is_muted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {mySeat.is_muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{mySeat.is_muted ? 'إلغاء كتم' : 'كتم المايك'}</span>
            </button>
            <button onClick={leaveSeat} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-slate-800/50 text-gray-400 border border-slate-700/50 hover:text-rose-400 hover:border-rose-500/30 transition-all">
              <span>ترك المقعد</span>
            </button>
          </div>
        )}

        <RoomChat roomId={room.id} profile={profile} />
      </div>

      {showGifts && (
        <GiftPanel
          onClose={() => { setShowGifts(false); setGiftReceiver(null) }}
          onSend={sendGift}
          receiverId={giftReceiver}
          receiverName={giftReceiver ? profiles[giftReceiver]?.username : undefined}
        />
      )}
    </div>
  )
}
