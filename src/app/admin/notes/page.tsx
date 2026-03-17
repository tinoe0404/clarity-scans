import { Metadata } from "next";
import { requireAdmin } from "@/lib/requireAdmin";
import NotesScreen from "@/components/admin/NotesScreen";
import { getAllNotes, getNotesSummary } from "@/lib/queries/radiographerNotes";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Scan Notes — ClarityScans Admin",
};

export default async function NotesPage() {
  // Protect route
  await requireAdmin();

  // Load initial data directly via server-side DB queries to avoid loopback API fetches
  const [notesData, summary] = await Promise.all([
    getAllNotes(1, 10),
    getNotesSummary("week")
  ]);

  return (
    <NotesScreen 
      initialNotes={notesData.rows}
      initialSummary={summary}
      initialTotal={notesData.total}
    />
  );
}
