'use client';

import { useState } from 'react';
import { Sidebar, SidebarItem } from './sidebar';
import { TopBar } from './top-bar';

interface PortalLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
}

export function PortalLayout({ children, sidebarItems }: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        items={sidebarItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
