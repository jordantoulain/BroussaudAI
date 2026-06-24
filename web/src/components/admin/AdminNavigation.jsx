'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, MessageSquare, Star, FileText, Settings } from 'lucide-react'

/**
 * Navigation entre les pages d'administration
 * 
 * @returns {JSX.Element}
 */
export default function AdminNavigation() {
  const pathname = usePathname()

  const navItems = [
    { 
      label: 'Dashboard', 
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      match: (path) => path === '/admin/dashboard' || path === '/admin'
    },
    { 
      label: 'Membres', 
      href: '/admin/members',
      icon: Users,
      match: (path) => path.startsWith('/admin/members')
    },
    { 
      label: 'Conversations', 
      href: '/admin/conversations',
      icon: MessageSquare,
      match: (path) => path.startsWith('/admin/conversations')
    },
    { 
      label: 'Avis', 
      href: '/admin/reviews',
      icon: Star,
      match: (path) => path.startsWith('/admin/reviews')
    },
    { 
      label: 'Documents', 
      href: '/admin/documents',
      icon: FileText,
      match: (path) => path.startsWith('/admin/documents')
    },
    { 
      label: 'System Prompt', 
      href: '/admin/system-prompt',
      icon: Settings,
      match: (path) => path.startsWith('/admin/system-prompt')
    }
  ]

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = item.match(pathname)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-neutral-300 text-neutral-800' 
                : 'text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
