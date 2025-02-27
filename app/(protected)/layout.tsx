"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleNewChat = () => {
    // In a real app, this would create a new conversation
    console.log("Creating new chat from protected layout");
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar onNewChat={handleNewChat} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </ProtectedRoute>
  );
} 