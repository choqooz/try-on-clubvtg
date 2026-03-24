import { getGarmentById } from "@/lib/garments";
import { notFound } from "next/navigation";
import { GarmentTryOnSection } from "@/components/GarmentTryOnSection";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GarmentPage({ params }: Props) {
  const { id } = await params;
  const garment = getGarmentById(id);
  if (!garment) notFound();

  return (
    <main className="min-h-screen bg-background relative">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-100/40 dark:from-indigo-900/20 via-background to-background pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all hover:shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Catalog
          </Link>
        </div>

        <div className="mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wider uppercase mb-4">
            Selected Garment
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6 leading-tight">
            {garment.name}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed border-l-4 border-neutral-200 dark:border-neutral-800 pl-4">
            {garment.description}
          </p>
        </div>

        <GarmentTryOnSection garment={garment} />
      </div>
    </main>
  );
}
