// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Upload, Save, Image as ImageIcon, ArrowLeft, Lock, Pencil, Trash2, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminPage() {
  // --- PASSWORD RAHASIA (GANTI DISINI!) ---
  const SECRET_CODE = "admin123";

  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // Menyimpan ID item yang sedang diedit
  const [promptList, setPromptList] = useState([]); // Menyimpan daftar semua prompt

  // State Form
  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [category, setCategory] = useState("All");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null); // URL gambar lama (untuk mode edit)

  // 1. Fetch Data saat Login Sukses
  useEffect(() => {
    if (isAuthenticated) {
      fetchPrompts();
    }
  }, [isAuthenticated]);

  const fetchPrompts = async () => {
    // Ambil data dari Supabase, urutkan dari yang terbaru
    let { data, error } = await supabase.from("prompts").select("*").order("created_at", { ascending: false });

    if (data) setPromptList(data);
  };

  // 2. Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === SECRET_CODE) setIsAuthenticated(true);
    else alert("Password salah, Boss!");
  };

  // 3. Handle Gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 4. --- FITUR EDIT (KLIK PENSIL) ---
  const handleEditClick = (item) => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll ke atas
    setEditingId(item.id); // Set mode edit

    // Isi form dengan data lama
    setTitle(item.title);
    setPromptText(item.prompt_text);
    setCategory(item.category);
    setTags(item.tags ? item.tags.join(", ") : "");
    setCurrentImageUrl(item.image_url); // Simpan URL lama

    // Reset upload baru
    setImageFile(null);
    setPreviewUrl(null);
  };

  // 5. --- FITUR BATAL EDIT ---
  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setPromptText("");
    setCategory("Realistic");
    setTags("");
    setImageFile(null);
    setPreviewUrl(null);
    setCurrentImageUrl(null);
  };

  // 6. --- FITUR DELETE (KLIK SAMPAH) ---
  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus prompt ini selamanya?")) return;

    const { error } = await supabase.from("prompts").delete().eq("id", id);

    if (error) alert("Gagal hapus: " + error.message);
    else {
      alert("Terhapus!");
      fetchPrompts(); // Refresh tabel
    }
  };

  // 7. --- SUBMIT (Bisa INSERT atau UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let publicUrl = currentImageUrl; // Default pakai gambar lama

      // A. Jika user upload gambar BARU
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        // Upload ke Storage
        const { error: uploadError } = await supabase.storage.from("images").upload(fileName, imageFile);
        if (uploadError) throw uploadError;

        // Ambil URL baru
        const { data } = supabase.storage.from("images").getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }

      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const payload = {
        title,
        prompt_text: promptText,
        image_url: publicUrl,
        category,
        tags: tagArray,
      };

      if (editingId) {
        // --- MODE UPDATE ---
        const { error } = await supabase.from("prompts").update(payload).eq("id", editingId);
        if (error) throw error;
        alert("Data berhasil diupdate!");
      } else {
        // --- MODE CREATE ---
        if (!publicUrl) throw new Error("Gambar wajib diupload!");
        const { error } = await supabase.from("prompts").insert([payload]);
        if (error) throw error;
        alert("Data berhasil ditambahkan!");
      }

      handleCancelEdit(); // Reset form
      fetchPrompts(); // Refresh list di bawah
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- TAMPILAN LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl">
          <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl text-white font-bold mb-4">Admin Access</h2>
          <input
            type="password"
            placeholder="Password..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold transition-all">Buka Dashboard</button>
        </form>
      </div>
    );
  }

  // --- TAMPILAN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header Nav */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Lihat Website
          </Link>
          <button onClick={() => setIsAuthenticated(false)} className="text-red-400 text-sm hover:underline">
            Logout
          </button>
        </div>

        {/* --- FORM SECTION --- */}
        <div className={`bg-slate-900 border ${editingId ? "border-yellow-500/50" : "border-slate-800"} rounded-2xl p-6 md:p-8 shadow-2xl mb-12 transition-all`}>
          <div className="flex items-center gap-3 mb-6">
            {editingId ? (
              <div className="bg-yellow-500 p-2 rounded-lg text-black">
                <Pencil className="w-6 h-6" />
              </div>
            ) : (
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Upload className="w-6 h-6" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-white">{editingId ? "Edit Mode" : "Upload Baru"}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KOLOM KIRI: INPUT TEKS */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Judul</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Contoh: Cyberpunk City"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Kategori</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none">
                      <option>Professional</option>
                      <option>Casual</option>
                      <option>Nature</option>
                      <option>Beach</option>
                      <option>Urban</option>
                      <option>Fashion</option>
                      <option>Couple</option>
                      <option>Traditional</option>
                      <option>Sport</option>
                      <option>Portrait</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tags</label>
                    <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none" placeholder="neon, dark, 8k" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Prompt</label>
                  <textarea
                    rows={4}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none font-mono text-sm"
                    placeholder="Paste prompt AI..."
                  />
                </div>
              </div>

              {/* KOLOM KANAN: GAMBAR */}
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Preview Gambar</label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl h-[280px] flex flex-col justify-center items-center relative overflow-hidden bg-slate-950 hover:bg-slate-900 transition-colors group">
                  <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />

                  {previewUrl ? (
                    <img src={previewUrl} className="h-full w-full object-contain p-2" />
                  ) : currentImageUrl ? (
                    <div className="text-center w-full h-full relative">
                      <img src={currentImageUrl} className="h-full w-full object-contain opacity-60 p-2" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-bold">Klik untuk ganti</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Klik / Drag Gambar</p>
                    </div>
                  )}
                </div>
                {editingId && currentImageUrl && !previewUrl && <p className="text-xs text-center text-slate-500 mt-2">*Gambar lama tetap dipakai jika tidak diganti</p>}
              </div>
            </div>

            {/* TOMBOL AKSI */}
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                disabled={loading}
                className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2 ${loading ? "bg-slate-700" : editingId ? "bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/20" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"}`}
              >
                {loading ? (
                  <RefreshCw className="animate-spin w-5 h-5" />
                ) : editingId ? (
                  <>
                    <Save className="w-5 h-5" /> Update Perubahan
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Simpan Data
                  </>
                )}
              </button>

              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="px-6 py-4 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-bold flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- TABLE LIST SECTION --- */}
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-xl font-bold text-white">Daftar Prompt Anda</h3>
          <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">{promptList.length} items</span>
        </div>

        <div className="space-y-3">
          {promptList.length === 0 && <p className="text-slate-500 text-center py-10">Belum ada data...</p>}

          {promptList.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-600 transition-all group">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-16 h-16 bg-slate-950 rounded-lg overflow-hidden relative flex-shrink-0 border border-slate-800">{item.image_url && <Image src={item.image_url} alt={item.title} fill className="object-cover" />}</div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">{item.title}</h4>
                  <p className="text-xs text-slate-500 truncate max-w-[200px] md:max-w-md">{item.prompt_text}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">{item.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pl-4">
                <button onClick={() => handleEditClick(item)} className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition-all" title="Edit">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Hapus">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
