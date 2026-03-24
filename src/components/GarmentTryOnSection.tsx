"use client";

import { useState } from "react";
import type { Garment } from "@/lib/garments";
import { TRY_ON_STATUS } from "@/lib/types";
import type { TryOnStatus } from "@/lib/types";
import { ImageUploader } from "@/components/ImageUploader";
import { ResultViewer } from "@/components/ResultViewer";

interface GarmentTryOnSectionProps {
  garment: Garment;
}

export function GarmentTryOnSection({ garment }: GarmentTryOnSectionProps) {
  const [status, setStatus] = useState<TryOnStatus>(TRY_ON_STATUS.IDLE);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

      {/* Left Column: Upload (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-10">
        <div className="bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-2">Step 1: Upload Photo</h2>
          <p className="text-neutral-500 mb-8">Upload a clear, front-facing photo of yourself to begin the magic try-on process.</p>

          <ImageUploader
            garmentId={garment.id}
            onPreviewReady={(url) => setOriginalUrl(url)}
            onUploadStart={() => {
              setStatus(TRY_ON_STATUS.LOADING);
              setErrorMsg(null);
              setResultUrl(null);
            }}
            onUploadSuccess={(url) => {
              setStatus(TRY_ON_STATUS.SUCCESS);
              setResultUrl(url);
            }}
            onUploadError={(err) => {
              setStatus(TRY_ON_STATUS.ERROR);
              setErrorMsg(err);
            }}
          />
        </div>
      </div>

      {/* Right Column: Results (5 cols) */}
      <div className="lg:col-span-5 relative mt-8 lg:mt-0">
        <div className="lg:sticky lg:top-8 h-full">
          <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-purple-500/5 rounded-3xl -z-10 blur-xl"></div>
          <ResultViewer
            status={status}
            originalUrl={originalUrl}
            finalUrl={resultUrl}
            error={errorMsg}
          />
        </div>
      </div>

    </div>
  );
}
