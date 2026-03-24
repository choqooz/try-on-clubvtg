"use client";

import { useState } from "react";
import type { TryOnStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ResultViewerProps {
  status: TryOnStatus;
  originalUrl?: string | null;
  finalUrl?: string | null;
  error?: string | null;
}

export function ResultViewer({ status, originalUrl, finalUrl, error }: ResultViewerProps) {
  const [activeIndex, setActiveIndex] = useState(1);
  if (status === "idle") {
    return (
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/20 text-center px-4">
        <div className="w-20 h-20 mb-6 bg-white dark:bg-neutral-800 shadow-sm rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-neutral-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100">Ready for Magic</h3>
        <p className="text-neutral-500 max-w-sm mt-2">Upload a photo and click &quot;Try On This Garment&quot; to see the AI result appear here.</p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900 shadow-sm relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-linear-to-tr from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-neutral-100 dark:border-neutral-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-blue-500">✨</div>
          </div>
          <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">Running AI Pipeline</h3>
          <p className="text-neutral-500 max-w-sm">
            Please wait. We are connecting to OpenAI GPT-Image-1.5 to generate a highly realistic preview.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center border border-red-200 dark:border-red-900/30 rounded-3xl bg-red-50/50 dark:bg-red-900/10 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Generation Failed</h3>
        <p className="text-red-600 dark:text-red-400 bg-white/50 dark:bg-black/20 px-4 py-3 rounded-xl inline-block">{error}</p>
      </div>
    );
  }

  if (status === "success" && finalUrl) {
    const steps = [
      { label: "Original", url: originalUrl, icon: "📷" },
      { label: "Final", url: finalUrl, icon: "✨" },
    ];
    const current = steps[activeIndex];

    return (
      <div className="relative h-full min-h-[500px] w-full border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900 overflow-hidden shadow-2xl flex flex-col">

        {/* Image area — takes all available space */}
        <div className="relative flex-1 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url ?? ""} alt={current.label} className="w-full h-full object-cover" />

          {/* Label badge top-left */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span>{current.icon}</span>
            <span>{current.label}</span>
          </div>

          {/* Prev arrow */}
          {activeIndex > 0 && (
            <button
              onClick={() => setActiveIndex(i => i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              ←
            </button>
          )}

          {/* Next arrow */}
          {activeIndex < steps.length - 1 && (
            <button
              onClick={() => setActiveIndex(i => i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              →
            </button>
          )}

          {/* Inset ring overlay */}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-t-3xl pointer-events-none" />
        </div>

        {/* Bottom step indicator bar */}
        <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-b-3xl">
          {steps.map((step, i) => (
            <button
              key={step.label}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                i === activeIndex
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              )}
            >
              <span>{step.icon}</span>
              <span>{step.label}</span>
            </button>
          ))}
        </div>

      </div>
    );
  }

  return null;
}
