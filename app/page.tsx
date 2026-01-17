// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient"; // Pastikan path ini benar
import { Search, Copy, Check, Image as ImageIcon, Terminal } from "lucide-react";
import Image from "next/image"; // <--- Tambah ini

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from("prompts")
      .select("*")
      // 1. Urutkan dulu (Terbaru di atas)
      .order("created_at", { ascending: false })
      // 2. POTONG DISINI (Ambil index 0 sampai 19 = 20 item)
      .range(0, 19);

    if (error) console.log("Error loading prompts:", error);
    else {
      setPrompts(data || []);
      setFilteredPrompts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let result = prompts;

    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((item) => item.title.toLowerCase().includes(lowerQuery) || item.prompt_text.toLowerCase().includes(lowerQuery) || (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))));
    }

    setFilteredPrompts(result);
  }, [searchQuery, selectedCategory, prompts]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ["All", "Realistic", "Anime", "3D Render", "Logo Design", "Architecture"];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">Prompt Koleksi</h1>
        <p className="text-slate-400 text-lg mb-8">Kumpulan prompt AI terbaik. Copy & Create.</p>

        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari prompt..."
            className="w-full bg-slate-900 border border-slate-700 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <p className="text-center text-slate-500 animate-pulse">Loading prompts...</p>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <Terminal className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Belum ada prompt, Boss.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((item) => (
              <div key={item.id} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col">
                <div className="relative aspect-video bg-slate-800 overflow-hidden">
                  {/* GANTI DARI SINI */}
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill // Fitur ajaib: Mengisi kotak parent-nya otomatis
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-600">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                  {/* SAMPAI SINI */}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-xs px-2 py-1 rounded text-white border border-white/10">{item.category}</span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-white truncate mb-2">{item.title}</h3>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-400 text-sm font-mono mb-4 flex-1">
                    <p className="line-clamp-3 leading-relaxed">{item.prompt_text}</p>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex gap-2">
                      {item.tags?.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleCopy(item.prompt_text, item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${copiedId === item.id ? "bg-green-500 text-white" : "bg-slate-100 text-slate-900 hover:bg-white"}`}
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-4 h-4" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
