// @ts-nocheck
"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Upload, Save, Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State untuk Form
  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [category, setCategory] = useState("Realistic");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Handle Gambar dipilih
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Logic Upload ke Supabase (The Magic)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !promptText || !imageFile) {
      alert("Isi semua data dulu, Boss!");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Gambar ke Storage
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`; // Nama file unik
      const { error: uploadError } = await supabase.storage.from("images").upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // 2. Ambil Public URL gambarnya
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(fileName);

      // 3. Masukkan Data ke Database
      const tagArray = tags.split(",").map((tag) => tag.trim()); // Ubah "kucing, lucu" jadi ['kucing', 'lucu']

      const { error: insertError } = await supabase.from("prompts").insert([
        {
          title: title,
          prompt_text: promptText,
          image_url: publicUrl,
          category: category,
          tags: tagArray,
        },
      ]);

      if (insertError) throw insertError;

      alert("Sukses! Prompt berhasil ditambahkan.");
      router.push("/"); // Kembali ke halaman utama
    } catch (error) {
      console.error(error);
      alert("Gagal upload: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center text-slate-500 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Galeri
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-6 text-white flex items-center gap-2">
            <span className="bg-blue-600 p-2 rounded-lg">
              <Upload className="w-6 h-6" />
            </span>
            Upload Prompt Baru
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Judul */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Judul Gambar</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Misal: Cyberpunk Samurai"
              />
            </div>

            {/* Input Kategori & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Realistic</option>
                  <option>Anime</option>
                  <option>3D Render</option>
                  <option>Logo Design</option>
                  <option>Architecture</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Tags (Pisahkan koma)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="merah, malam, hujan"
                />
              </div>
            </div>

            {/* Input Prompt */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Prompt Asli</label>
              <textarea
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                placeholder="Paste prompt AI kamu disini..."
              />
            </div>

            {/* Upload Image Area */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Upload Gambar Hasil</label>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:bg-slate-800/50 transition-colors relative">
                <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <p>Klik atau drag gambar kesini</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all ${
                loading ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
              }`}
            >
              {loading ? (
                "Sedang Upload..."
              ) : (
                <>
                  <Save className="w-5 h-5" /> Simpan ke Koleksi
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
