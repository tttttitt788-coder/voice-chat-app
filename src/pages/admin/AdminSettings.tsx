import { useState } from 'react'
import { useAdminAuthStore } from '@/stores/admin-auth'
import { Shield, Mail, Plus } from 'lucide-react'

export default function AdminSettings() {
  const { admin } = useAdminAuthStore()
  const [showCreate, setShowCreate] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', name: '', role: 'moderator' })
  const [msg, setMsg] = useState('')

  const createAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) return
    setMsg('')
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ action: 'create_admin', ...newAdmin, admin_token: admin?.id }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'فشل إنشاء المشرف') }
      setMsg('تم إنشاء المشرف بنجاح')
      setShowCreate(false)
      setNewAdmin({ email: '', password: '', name: '', role: 'moderator' })
    } catch (err: any) {
      setMsg(err.message || 'فشل')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">الإعدادات</h1>
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6 max-w-md mb-6">
        <h2 className="text-white font-semibold mb-4">معلومات المشرف</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-600 flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
            <div><p className="text-white font-semibold text-sm">{admin?.name}</p><p className="text-gray-500 text-xs">{admin?.role}</p></div>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm"><Mail className="w-4 h-4" /><span>{admin?.email}</span></div>
        </div>
      </div>
      {admin?.role === 'super_admin' && (
        <div className="max-w-md">
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-all">
            <Plus className="w-4 h-4" /><span>إضافة مشرف جديد</span>
          </button>
          {showCreate && (
            <div className="mt-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 p-5 space-y-3">
              <div><label className="text-gray-400 text-sm mb-1.5 block">الاسم</label>
                <input type="text" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50" /></div>
              <div><label className="text-gray-400 text-sm mb-1.5 block">البريد الإلكتروني</label>
                <input type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50" /></div>
              <div><label className="text-gray-400 text-sm mb-1.5 block">كلمة المرور</label>
                <input type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50" /></div>
              <div><label className="text-gray-400 text-sm mb-1.5 block">الدور</label>
                <select value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50">
                  <option value="moderator">مشرف</option><option value="admin">أدمن</option>
                </select></div>
              <button onClick={createAdmin} className="w-full bg-emerald-500 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-600 transition-all">إنشاء</button>
            </div>
          )}
          {msg && <p className="mt-3 text-emerald-400 text-sm">{msg}</p>}
        </div>
      )}
    </div>
  )
}
