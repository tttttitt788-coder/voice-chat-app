import { useAdminAuthStore } from '@/stores/admin-auth'
import { useNavigate, Link, Outlet } from 'react-router-dom'
import { LayoutDashboard, Mic, Users, Gift, Settings, LogOut, Shield } from 'lucide-react'

export default function AdminLayout() {
  const { admin, signOut } = useAdminAuthStore()
  const navigate = useNavigate()

  const handleSignOut = () => { signOut(); navigate('/admin/login') }

  const navItems = [
    { path: '/admin', label: 'الرئيسية', icon: LayoutDashboard },
    { path: '/admin/rooms', label: 'الغرف', icon: Mic },
    { path: '/admin/users', label: 'المستخدمون', icon: Users },
    { path: '/admin/gifts', label: 'الهدايا', icon: Gift },
    { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className="w-64 bg-slate-900/50 border-l border-slate-800/50 flex flex-col">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">لوحة التحكم</h1>
              <p className="text-gray-500 text-xs">{admin?.name || 'مشرف'}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.path} to={item.path} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-gray-400 hover:text-white hover:bg-slate-800/50"
                style={{ textDecoration: 'none' }}>
                <Icon className="w-5 h-5" /><span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-800/50">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all">
            <LogOut className="w-5 h-5" /><span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  )
}
