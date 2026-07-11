import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Gift } from '@/types'
import { RARITY_COLORS } from '@/types'
import { X, Coins } from 'lucide-react'

interface Props {
  onClose: () => void
  onSend: (giftId: string, receiverId: string, quantity: number) => void
  receiverId: string | null
  receiverName?: string
}

export default function GiftPanel({ onClose, onSend, receiverId, receiverName }: Props) {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    supabase.from('gifts').select('*').eq('is_active', true).order('coin_price').then(({ data }) => { if (data) setGifts(data as Gift[]) })
  }, [])

  const handleSend = () => {
    if (!selected || !receiverId) return
    onSend(selected, receiverId, quantity)
  }

  const selectedGift = gifts.find(g => g.id === selected)
  const totalCost = selectedGift ? selectedGift.coin_price * quantity : 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-slate-800/95 backdrop-blur-xl rounded-t-3xl border-t border-slate-700/50 p-5 animate-slideUp max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">إرسال هدية</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-700/50 text-gray-400 hover:text-white transition-all"><X className="w-5 h-5" /></button>
        </div>
        {receiverName && <p className="text-gray-400 text-sm mb-4 text-center">إرسال إلى: <span className="text-rose-300 font-semibold">{receiverName}</span></p>}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
          {gifts.map((gift) => {
            const rarity = RARITY_COLORS[gift.rarity] || RARITY_COLORS.common
            const isSelected = selected === gift.id
            return (
              <button key={gift.id} onClick={() => setSelected(gift.id)}
                className={`relative rounded-2xl border p-3 flex flex-col items-center gap-2 transition-all ${rarity.bg} ${rarity.border} ${isSelected ? 'ring-2 ring-rose-500 scale-105' : 'hover:scale-105'}`}>
                <div className="w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center text-2xl">{gift.icon_url || '🎁'}</div>
                <p className="text-white text-xs font-semibold text-center truncate w-full">{gift.name}</p>
                <div className="flex items-center gap-1"><Coins className="w-3 h-3 text-amber-400" /><span className="text-amber-300 text-xs font-semibold">{gift.coin_price}</span></div>
              </button>
            )
          })}
        </div>
        {selectedGift && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label className="text-gray-400 text-sm">الكمية: {quantity}</label>
              <div className="flex gap-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg bg-slate-700/50 text-white hover:bg-slate-700 transition-all">-</button>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg bg-slate-700/50 text-white hover:bg-slate-700 transition-all">+</button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3">
              <span className="text-gray-400 text-sm">الإجمالي</span>
              <div className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-amber-400" /><span className="text-amber-300 font-bold">{totalCost}</span></div>
            </div>
            <button onClick={handleSend} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all">إرسال الهدية</button>
          </div>
        )}
      </div>
    </div>
  )
}
