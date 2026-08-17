// app/brokers/[broker]/layout.tsx - CORRECT VERSION (SIMPLE LAYOUT)
import React from "react";

export default function BrokerLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}