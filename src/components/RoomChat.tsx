import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Message, Profile } from '@/types'
import { Send, Gift } from 'lucide-react'

interface Props {
  roomId: string
  profile: Profile | null
}

export default function RoomChat({ roomId, profile }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [senders, setSenders] = useState<Record<string, Profile>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadMessages = async () => {
    const { data } = await supabase.from('messages').select('*').eq('room_id', roomId).eq('is_deleted', false).order('created_at', { ascending: true }).limit(100)
    if (data) {
      setMessages(data as Message[])
      const senderIds = [...new Set(data.map(m => m.sender_id))]
      if (senderIds.length > 0) {
        const { data: profilesData } = await supabase.from('profiles').select('*').in('id', senderIds)
        if (profilesData) {
          const map: Record<string, Profile> = {}
          profilesData.forEach(p => { map[p.id] = p as Profile })
          setSenders(map)
        }
      }
    }
  }

  useEffect(() => {
    loadMessages()
    const channel = supabase.channel(`chat-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
        const newMsg = payload.new as Message
        if (newMsg.sender_id && !senders[newMsg.sender_id]) {
          supabase.from('profiles').select('*').eq('id', newMsg.sender_id).maybeSingle().then(({ data }) => {
            if (data) setSenders(prev => ({ ...prev, [data.id]: data as Profile }))
          })
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !profile) return
    const content = input.trim()
    setInput('')
    await supabase.from('messages').insert({ room_id: roomId, sender_id: profile.id, content, message_type: 'text' })
  }

  return (
    <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Gift className="w-4 h-4 text-amber-400" /><span>المحادثة</span>
        </h3>
      </div>
      <div ref={scrollRef} className="h-64 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">لا توجد رسائل بعد</p>
        ) : (
          messages.map((msg) => {
            const sender = senders[msg.sender_id]
            const isMe = msg.sender_id === profile?.id
            const isGift = msg.message_type === 'gift'
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${isGift ? 'bg-amber-500/15 border border-amber-500/30' : isMe ? 'bg-rose-500/20 text-white' : 'bg-slate-700/50 text-gray-200'}`}>
                  {!isMe && sender && <p className="text-xs font-semibold text-rose-300 mb-0.5">{sender.username}</p>}
                  <p className={`text-sm ${isGift ? 'text-amber-200' : ''}`}>{msg.content}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className="flex gap-2 p-3 border-t border-slate-700/50">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="اكتب رسالة..."
          className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all text-sm" />
        <button onClick={sendMessage} disabled={!input.trim()} className="p-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-30 transition-all">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
