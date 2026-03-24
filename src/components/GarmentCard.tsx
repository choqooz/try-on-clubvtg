"use client";

import Link from "next/link";
import { useState } from "react";
import type { Garment } from "@/lib/garments";

interface GarmentCardProps {
  garment: Garment;
}

export function GarmentCard({ garment }: GarmentCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/garment/${garment.id}`} className="group relative block overflow-hidden rounded-3xl bg-card border border-border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      {/* Image area */}
      <div className="aspect-4/5 bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 ease-out">
            {'👕'}
          </div>
        ) : (
          <img
            src={garment.previewUrl}
            alt={garment.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            onError={() => setImgError(true)}
          />
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover text panel — inside the image, not below it */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <h3 className="text-base font-bold text-white mb-1">{garment.name}</h3>
          <p className="text-sm text-white/80 line-clamp-2">{garment.description}</p>
          <div className="mt-2 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-white/90">
            Try Now <span className="ml-1">→</span>
          </div>
        </div>
      </div>

      {/* Static text below image — collapses on hover via grid trick */}
      <div className="grid transition-all duration-300 group-hover:[grid-template-rows:0fr] [grid-template-rows:1fr]">
        <div className="overflow-hidden">
          <div className="p-4 transition-opacity duration-300 group-hover:opacity-0">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{garment.name}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">{garment.description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
