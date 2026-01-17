// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Search, Copy, Check, ArrowUpRight, X, Terminal, Image as ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const categories = ["All", "Professional", "Casual", "Nature", "Beach", "Urban", "Fashion", "Couple", "Traditional", "Sport", "Portrait"];

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    let { data, error } = await supabase.from("prompts").select("*").order("created_at", { ascending: false });

    if (error) console.log("Error:", error);
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

  const handleCopy = (e, text, id) => {
    e.stopPropagation(); // Mencegah modal terbuka saat klik copy
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] font-sans selection:bg-[#133E35] selection:text-white pb-20">
      {/* --- HEADER --- */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 bg-[#133E35] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#133E35]/20">P</div>
            <span className="font-bold tracking-tight text-xl text-[#1A1A1A]">PartnerPrompt.</span>
          </div>
          <a href="/admin" className="text-xs font-medium text-gray-500 hover:text-[#133E35] transition-colors border border-gray-200 px-3 py-1.5 rounded-full hover:border-[#133E35]">
            Upload Mode
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* --- HERO --- */}
        <div className="mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#133E35] font-bold text-sm tracking-widest uppercase mb-4">
              <Sparkles className="w-4 h-4" /> Curated Collection
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-[1.1] tracking-tight">
              Visual <br /> Architecture.
            </h1>
          </div>
          <p className="text-gray-500 max-w-md leading-relaxed text-sm md:text-base mb-2">Temukan prompt AI photorealistic berkualitas tinggi. Dirancang untuk kebutuhan profesional dan kreatif.</p>
        </div>

        {/* --- CONTROLS --- */}
        <div className="sticky top-[73px] z-30 bg-[#FAFAFA]/95 backdrop-blur-sm py-4 mb-8 -mx-6 px-6 border-b border-gray-100/50">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-4 h-4 group-focus-within:text-[#133E35] transition-colors" />
              <input
                type="text"
                placeholder="Cari (misal: 'office', 'suit')..."
                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-[#133E35] focus:ring-1 focus:ring-[#133E35] transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full overflow-x-auto no-scrollbar pb-1">
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                      selectedCategory === cat ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-lg shadow-black/10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-[#1A1A1A]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- CARD GRID YANG BARU --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[#133E35] rounded-full animate-spin"></div>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
            <Terminal className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Prompt tidak ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrompts.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPrompt(item)}
                className="group bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-gray-100 hover:border-gray-200 cursor-pointer flex flex-col"
              >
                {/* 1. IMAGE AREA */}
                <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-gray-100 mb-4">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  {/* Badge Category */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#133E35] shadow-sm">{item.category}</div>
                </div>

                {/* 2. TEXT AREA */}
                <div className="px-2 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-[#1A1A1A] leading-tight group-hover:text-[#133E35] transition-colors pr-2">{item.title}</h3>
                    <button
                      onClick={(e) => handleCopy(e, item.prompt_text, item.id)}
                      className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all ${copiedId === item.id ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-[#1A1A1A] hover:text-white"}`}
                      title="Copy Prompt"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* --- PROMPT BOX YANG JELAS --- */}
                  <div className="bg-[#F5F7F6] rounded-xl p-3 mb-4 border border-gray-100 group-hover:border-[#133E35]/20 transition-colors flex-1">
                    <p className="font-mono text-xs text-gray-600 leading-relaxed line-clamp-3">{item.prompt_text}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {item.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] font-medium text-gray-400 bg-white border border-gray-100 px-2 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL DETAIL (Tetap sama tapi dipoles dikit) --- */}
      {selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-md transition-all" onClick={() => setSelectedPrompt(null)}>
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative rounded-[2rem] animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedPrompt(null)} className="absolute top-5 right-5 z-10 bg-white p-2 rounded-full text-black hover:bg-black hover:text-white transition-colors shadow-lg">
              <X className="w-5 h-5" />
            </button>

            {/* Kiri: Gambar Full */}
            <div className="w-full md:w-1/2 bg-[#F0F2F5] relative h-[40vh] md:h-auto flex items-center justify-center p-6">
              <div className="relative w-full h-full shadow-2xl rounded-2xl overflow-hidden">{selectedPrompt.image_url && <Image src={selectedPrompt.image_url} alt={selectedPrompt.title} fill className="object-cover" />}</div>
            </div>

            {/* Kanan: Detail Info */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-white overflow-y-auto">
              <div className="mb-8">
                <span className="text-[#133E35] font-bold text-xs uppercase tracking-widest mb-2 block">{selectedPrompt.category} Collection</span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] leading-tight mb-4">{selectedPrompt.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedPrompt.tags?.map((tag, i) => (
                    <span key={i} className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1 mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prompt Script</h4>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Monospace</span>
                </div>
                <div className="bg-[#1A1A1A] p-6 rounded-2xl text-gray-300 shadow-inner overflow-y-auto max-h-[250px]">
                  <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">{selectedPrompt.prompt_text}</p>
                </div>
              </div>

              <button
                onClick={(e) => handleCopy(e, selectedPrompt.prompt_text, selectedPrompt.id)}
                className={`w-full py-4 px-6 rounded-xl font-bold flex justify-center items-center gap-3 transition-all text-sm uppercase tracking-wider ${
                  copiedId === selectedPrompt.id ? "bg-green-600 text-white shadow-lg shadow-green-200" : "bg-[#133E35] text-white hover:bg-[#0D2B25] shadow-xl shadow-[#133E35]/20"
                }`}
              >
                {copiedId === selectedPrompt.id ? (
                  <>
                    <Check className="w-5 h-5" /> Copied to Clipboard
                  </>
                ) : (
                  <>
                    Copy Prompt <ArrowUpRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
