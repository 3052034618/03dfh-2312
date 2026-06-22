import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, Stethoscope, PhoneOutgoing, BarChart3, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '工作台' },
  { to: '/customers', icon: Users, label: '客户档案' },
  { to: '/schedule', icon: Calendar, label: '预约排班' },
  { to: '/treatments', icon: Stethoscope, label: '治疗记录' },
  { to: '/follow-ups', icon: PhoneOutgoing, label: '回访任务' },
  { to: '/dashboard', icon: BarChart3, label: '运营看板' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-100 flex flex-col z-30">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-200">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-serif font-semibold text-sm text-slate-800 leading-tight">光子嫩肤</h1>
          <p className="text-[10px] text-slate-400 leading-tight">疗程管理工作台</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              )}
            >
              <item.icon className={cn('w-[18px] h-[18px]', isActive ? 'text-primary-600' : 'text-slate-400')} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-700">王</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">王雅琳 医生</p>
            <p className="text-[10px] text-slate-400">皮肤科主治</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
