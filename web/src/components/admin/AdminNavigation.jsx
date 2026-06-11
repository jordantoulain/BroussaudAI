'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
      match: (path) => path === '/admin/dashboard' || path === '/admin'
    },
    { 
      label: 'Membres', 
      href: '/admin/members',
      match: (path) => path.startsWith('/admin/members')
    },
    { 
      label: 'Conversations', 
      href: '/admin/conversations',
      match: (path) => path.startsWith('/admin/conversations')
    },
    { 
      label: 'Documents', 
      href: '/admin/documents',
      match: (path) => path.startsWith('/admin/documents')
    }
  ]

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = item.match(pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-neutral-300 text-neutral-800' 
                : 'text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
