import Link from "next/link";

export default function GarmentNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Garment not found</h1>
      <p className="text-neutral-500">This garment does not exist in our catalog.</p>
      <Link href="/" className="text-blue-600 hover:underline">← Back to catalog</Link>
    </div>
  );
}
