import { NewsManager } from "@/components/admin/news-manager";

export default function NewsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kelola Berita</h1>
      <p className="text-sm text-gray-600 mb-4">
        Maksimal 3 berita terbaru tampil di landing page. Belum ada halaman detail berita.
      </p>
      <NewsManager />
    </div>
  );
}
