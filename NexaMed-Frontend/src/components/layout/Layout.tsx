import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner'
import { cn } from '@/lib/utils'

interface LayoutProps {
  title: string
  description?: string
}

export function Layout({ title, description }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <Header title={title} description={description} />
        <SubscriptionBanner />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
