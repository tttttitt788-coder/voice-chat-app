export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  coins: number
  level: number
  total_coins_received: number
  gifts_sent_count: number
  gifts_received_count: number
  is_banned: boolean
  is_guest: boolean
  guest_session_id: string | null
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  name: string
  description: string | null
  category: string
  room_type: 'public' | 'private'
  owner_id: string
  max_seats: number
  participant_count: number
  background_url: string | null
  is_locked: boolean
  password: string | null
  is_active: boolean
  is_recording: boolean
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface RoomSeat {
  id: string
  room_id: string
  seat_number: number
  user_id: string | null
  is_muted: boolean
  is_locked: boolean
  seat_role: 'owner' | 'admin' | 'speaker' | 'listener'
  occupied_at: string | null
  created_at: string
}

export interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'gift' | 'system'
  gift_id: string | null
  is_deleted: boolean
  created_at: string
}

export interface Gift {
  id: string
  name: string
  icon_url: string
  coin_price: number
  animation_url: string | null
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: string
  is_active: boolean
  created_at: string
}

export interface GiftTransaction {
  id: string
  gift_id: string
  sender_id: string
  receiver_id: string
  room_id: string | null
  quantity: number
  total_coins: number
  message: string | null
  created_at: string
}

export interface RoomParticipant {
  id: string
  room_id: string
  user_id: string
  is_speaker: boolean
  is_moderator: boolean
  joined_at: string
  left_at: string | null
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'moderator'
  is_active: boolean
  last_login_at: string | null
  created_at: string
}

export const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: '🌐' },
  { id: 'chat', label: 'دردشة', icon: '💬' },
  { id: 'music', label: 'موسيقى', icon: '🎵' },
  { id: 'gaming', label: 'ألعاب', icon: '🎮' },
  { id: 'education', label: 'تعليم', icon: '📚' },
  { id: 'religion', label: 'ديني', icon: '🕌' },
  { id: 'sports', label: 'رياضة', icon: '⚽' },
  { id: 'comedy', label: 'كوميدي', icon: '😂' },
] as const

export const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-gray-500/20', border: 'border-gray-500/40', text: 'text-gray-300', glow: 'shadow-gray-500/20' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-300', glow: 'shadow-blue-500/20' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-300', glow: 'shadow-purple-500/20' },
  legendary: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-300', glow: 'shadow-amber-500/20' },
}
