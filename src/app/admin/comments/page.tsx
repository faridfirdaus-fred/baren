import { CommentsManager } from "@/components/admin/comments-manager";

export default function CommentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kelola Komentar</h1>
      <CommentsManager />
    </div>
  );
}
