// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Search, Copy, Check, ArrowUpRight, X, Terminal, Image as ImageIcon, LayoutGrid } from "lucide-react";
import Image from "next/image";

// --- KOMPONEN SKELETON (LOADING STATE) ---
const PromptSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden h-full">
      {/* Skeleton Gambar */}
      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Skeleton Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Header: Badge & Icon */}
        <div className="flex justify-between items-start mb-3">
          <div className="h-6 w-20 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-6 w-6 bg-gray-200 rounded-md animate-pulse" />
        </div>

        {/* Title */}
        <div className="h-7 w-3/4 bg-gray-200 rounded mb-4 animate-pulse" />

        {/* Prompt Box Area */}
        <div className="flex-1 bg-gray-100 rounded-lg p-3 border border-gray-50 mb-4 h-24 animate-pulse" />

        {/* Footer: Tags */}
        <div className="flex gap-2 mt-auto pt-3 border-t border-gray-50">
          <div className="h-4 w-12 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 w-10 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

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
    // Timeout kecil agar skeleton terlihat (opsional, bisa dihapus jika ingin instan)
    setTimeout(() => setLoading(false), 800);
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
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    // --- GAYA: CLEAN ARCHITECTURAL (White & Deep Green) ---
    <main className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] font-sans selection:bg-[#133E35] selection:text-white pb-20">
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 border-2 border-[#133E35] flex items-center justify-center rounded text-[#133E35]">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight text-xl uppercase">PartnerPrompt.</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="https://lynk.id/gedeanandaputra" className="bg-[#133E35] text-white px-5 py-2 rounded hover:bg-[#0D2B25] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16">
        {/* --- HERO SECTION --- */}
        <div className="mb-20">
          <h1 className="text-5xl md:text-7xl font-medium text-[#1A1A1A] leading-[0.95] tracking-tight mb-8 uppercase">
            Find Perfect Prompt <br />
            <span className="flex items-center gap-4 flex-wrap">
              <span className="bg-[#133E35] text-white text-lg md:text-2xl px-6 py-2 rounded-full normal-case font-normal tracking-normal flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5" /> Explore Gallery
              </span>
              <span className="text-gray-400">— Built for Creators</span>
            </span>
          </h1>

          {/* Search & Filter Bar */}
          <div className="border-t border-b border-gray-200 py-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-0 top-3 text-[#133E35] w-5 h-5" />
              <input
                type="text"
                placeholder="Search keyword..."
                className="w-full bg-transparent border-none outline-none py-2 pl-8 text-lg placeholder-gray-400 focus:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
            <div className="flex-1 w-full overflow-x-auto no-scrollbar">
              <div className="flex gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-sm font-medium transition-colors whitespace-nowrap hover:text-[#133E35] ${selectedCategory === cat ? "text-[#133E35] underline underline-offset-8 decoration-2" : "text-gray-400"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- GRID GALLERY --- */}
        {loading ? (
          // STATE: LOADING (SKELETON)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {[...Array(6)].map((_, i) => (
              <PromptSkeleton key={i} />
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          // STATE: EMPTY (TIDAK ADA DATA)
          <div className="text-center py-24 bg-white border border-dashed border-gray-300 rounded-2xl">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Terminal className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Prompt tidak ditemukan</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.</p>
          </div>
        ) : (
          // STATE: DATA LOADED (NEW CARD DESIGN)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {filteredPrompts.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPrompt(item)}
                className="group relative flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#133E35]/30 transition-all duration-300 cursor-pointer"
              >
                {/* Image Area with Overlay */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50">
                      <ImageIcon className="w-10 h-10 opacity-20" />
                    </div>
                  )}

                  {/* Dark Overlay & Button on Hover */}
                  <div className="absolute inset-0 bg-[#133E35]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-white/90 text-[#133E35] px-5 py-2 rounded-full font-medium text-xs shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                      View Details <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Header: Category Badge & Copy Button */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block px-2.5 py-1 bg-[#133E35]/5 text-[#133E35] text-[10px] font-bold uppercase tracking-wider rounded-md border border-[#133E35]/10">{item.category}</span>
                    <button
                      onClick={(e) => handleCopy(e, item.prompt_text, item.id)}
                      className={`p-1.5 rounded-md transition-all duration-200 ${copiedId === item.id ? "bg-green-50 text-green-600" : "text-gray-400 hover:bg-gray-100 hover:text-[#1A1A1A]"}`}
                      title="Copy Prompt"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-lg text-[#1A1A1A] mb-3 leading-snug group-hover:text-[#133E35] transition-colors line-clamp-1">{item.title}</h3>

                  {/* Prompt Preview (Code Style) */}
                  <div className="relative bg-gray-50 rounded-lg p-3 border border-gray-100 mb-4 flex-1 group/code">
                    <p className="font-mono text-xs text-gray-600 line-clamp-3 leading-relaxed opacity-80 group-hover/code:opacity-100 transition-opacity">{item.prompt_text}</p>
                  </div>

                  {/* Footer: Tags */}
                  <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-gray-50">
                    {item.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase tracking-wide">
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

      {/* --- MODAL DETAIL (Clean White) --- */}
      {selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm transition-all" onClick={() => setSelectedPrompt(null)}>
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedPrompt(null)} className="absolute top-6 right-6 z-10 bg-white p-2 rounded-full text-black hover:bg-black hover:text-white transition-colors border border-gray-200 shadow-sm">
              <X className="w-5 h-5" />
            </button>

            {/* Kiri: Gambar Full */}
            <div className="w-full md:w-3/5 bg-[#F5F5F5] relative h-[40vh] md:h-auto flex items-center justify-center p-4">
              <div className="relative w-full h-full">{selectedPrompt.image_url && <Image src={selectedPrompt.image_url} alt={selectedPrompt.title} fill className="object-contain" />}</div>
            </div>

            {/* Kanan: Detail Info */}
            <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col bg-white overflow-y-auto border-l border-gray-100">
              <div className="mb-8">
                <span className="text-[#133E35] font-bold text-xs uppercase tracking-widest mb-3 block border-b border-gray-200 pb-2">{selectedPrompt.category} / Collection</span>
                <h2 className="text-3xl md:text-4xl font-medium text-[#1A1A1A] leading-tight mb-4">{selectedPrompt.title}</h2>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 uppercase tracking-wider">
                  {selectedPrompt.tags?.map((tag, i) => (
                    <span key={i}>#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="flex-1 mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Prompt Specification</h4>
                <div className="bg-[#F9FAFB] p-6 border border-gray-100 h-full max-h-[300px] overflow-y-auto rounded-lg">
                  <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{selectedPrompt.prompt_text}</p>
                </div>
              </div>

              <button
                onClick={(e) => handleCopy(e, selectedPrompt.prompt_text, selectedPrompt.id)}
                className={`w-full py-4 px-6 font-bold flex justify-center items-center gap-3 transition-all text-sm uppercase tracking-wider rounded-lg ${
                  copiedId === selectedPrompt.id ? "bg-[#133E35] text-white" : "bg-[#1A1A1A] text-white hover:bg-[#133E35]"
                }`}
              >
                {copiedId === selectedPrompt.id ? (
                  <>
                    <Check className="w-5 h-5" /> Copied to Clipboard
                  </>
                ) : (
                  <>
                    Copy Prompt Script <ArrowUpRight className="w-5 h-5" />
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
