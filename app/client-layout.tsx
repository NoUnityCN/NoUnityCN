"use client"

import React, { useState } from "react"
import { SidebarWrapper } from "@/components/sidebar-wrapper"
import { SidebarButton } from "@/components/sidebar-button"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {children}
      <SidebarButton onClick={toggleSidebar} />
      <SidebarWrapper isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  )
} 