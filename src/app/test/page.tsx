// app/test/page.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function TestPage() {
  const [firms, setFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getPropFirms();
        if (response.success) {
          setFirms(response.data || []);
          console.log("✅ Prop firms data:", response.data);
        }
      } catch (error) {
        console.error("❌ Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4">Loading test data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔧 Prop Firms Test Page</h1>
      <p className="text-zinc-400 mb-8">Testing navigation and data fetching</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Stats</h2>
          <p>Total Firms: {firms.length}</p>
          <p>First Firm ID: {firms[0]?.id || "N/A"}</p>
          <p>First Firm Name: {firms[0]?.name || "N/A"}</p>
          <p>First Firm Slug: {firms[0]?.slug || "NO SLUG"}</p>
        </div>
        
        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Test Links</h2>
          <div className="space-y-3">
            <Link 
              href="/prop-firms/1" 
              className="block bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-center"
            >
              Test: /prop-firms/1 (ID)
            </Link>
            <Link 
              href="/prop-firms/ftmo" 
              className="block bg-purple-600 hover:bg-purple-700 p-3 rounded-lg text-center"
            >
              Test: /prop-firms/ftmo (Slug)
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">All Prop Firms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {firms.slice(0, 6).map((firm) => (
            <div key={firm.id} className="bg-zinc-800 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{firm.name}</h3>
                  <p className="text-sm text-zinc-400">ID: {firm.id}</p>
                  <p className="text-sm text-zinc-400">Slug: {firm.slug || "NO SLUG"}</p>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={`/prop-firms/${firm.id}`}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                  >
                    ID Link
                  </Link>
                  {firm.slug && (
                    <Link 
                      href={`/prop-firms/${firm.slug}`}
                      className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm"
                    >
                      Slug Link
                    </Link>
                  )}
                </div>
              </div>
              <div className="mt-3 text-xs text-zinc-500">
                <p>Rating: {firm.rating || "N/A"}</p>
                <p>Programs: {firm.programs?.length || 0}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <h3 className="font-bold text-red-400">Debug Info (Check Console)</h3>
          <p className="text-sm text-zinc-400">Open browser console (F12) to see the data structure</p>
          <button 
            onClick={() => console.log("Full firms data:", firms)}
            className="mt-2 bg-red-700 hover:bg-red-800 px-4 py-2 rounded text-sm"
          >
            Log Data to Console
          </button>
        </div>
      </div>
    </div>
  );
}