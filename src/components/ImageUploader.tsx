"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import type { SseEvent } from "@/lib/types";

const MAX_PORTRAIT_W = 576;
const MAX_PORTRAIT_H = 1024;
const MAX_LANDSCAPE_W = 1024;
const MAX_LANDSCAPE_H = 576;

interface ImageDimensions {
  w: number;
  h: number;
}

/**
 * Resizes an image file to fit within 576x1024 (portrait) or 1024x576 (landscape),
 * preserving aspect ratio and never upscaling. Exports as JPEG at quality 0.92.
 */
function resizeImageToTarget(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { naturalWidth: srcW, naturalHeight: srcH } = img;
      const isPortrait = srcH >= srcW;

      const maxW = isPortrait ? MAX_PORTRAIT_W : MAX_LANDSCAPE_W;
      const maxH = isPortrait ? MAX_PORTRAIT_H : MAX_LANDSCAPE_H;

      // Scale down only — never upscale
      const scale = Math.min(1, maxW / srcW, maxH / srcH);
      const targetW = Math.round(srcW * scale);
      const targetH = Math.round(srcH * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas 2D context"));
        return;
      }

      ctx.drawImage(img, 0, 0, targetW, targetH);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob returned null"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for resizing"));
    };

    img.src = objectUrl;
  });
}

interface ImageUploaderProps {
  garmentId: string;
  onUploadStart: () => void;
  onUploadSuccess: (url: string) => void;
  onUploadError: (error: string) => void;
  onPreviewReady?: (url: string) => void;
}

export function ImageUploader({ garmentId, onUploadStart, onUploadSuccess, onUploadError, onPreviewReady }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
  const [targetDimensions, setTargetDimensions] = useState<ImageDimensions | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      onUploadError("File too large. Maximum size is 10 MB.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selected.type)) {
      onUploadError("Invalid format. Only JPG, PNG, and WEBP supported.");
      return;
    }

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
    onPreviewReady?.(objectUrl);
  };

  const handleTryOn = async (): Promise<void> => {
    if (!file) return;

    // Measure original dimensions before resizing
    const bitmap = await createImageBitmap(file);
    const origW = bitmap.width;
    const origH = bitmap.height;
    bitmap.close();
    setOriginalDimensions({ w: origW, h: origH });

    // Calculate expected target dimensions (mirrors resizeImageToTarget logic)
    const isPortrait = origH >= origW;
    const maxW = isPortrait ? MAX_PORTRAIT_W : MAX_LANDSCAPE_W;
    const maxH = isPortrait ? MAX_PORTRAIT_H : MAX_LANDSCAPE_H;
    const scale = Math.min(1, maxW / origW, maxH / origH);
    setTargetDimensions({ w: Math.round(origW * scale), h: Math.round(origH * scale) });

    setIsResizing(true);
    onUploadStart();

    const [resizedBlob] = await Promise.all([
      resizeImageToTarget(file),
      new Promise((resolve) => setTimeout(resolve, 800)), // minimum display time
    ]);

    setIsResizing(false);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("userImage", resizedBlob, "user-image.jpg");
    formData.append("garmentId", garmentId);

    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        body: formData,
      });

      if (!res.body) {
        throw new Error("No response body from server.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines — events are separated by double newlines
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? ""; // keep incomplete chunk

        for (const chunk of lines) {
          const dataLine = chunk.split("\n").find((l) => l.startsWith("data: "));
          if (!dataLine) continue;

          const json = JSON.parse(dataLine.slice(6)) as SseEvent;

          if (json.type === "final") {
            onUploadSuccess(json.imageUrl);
            setIsUploading(false);
          } else if (json.type === "error") {
            throw new Error(json.error);
          }
          // "done" type: loop will end naturally
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      onUploadError(message);
      setIsUploading(false);
    }
  };

  const getButtonLabel = () => {
    if (isResizing) {
      return (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Optimizing...
        </span>
      );
    }
    if (isUploading) {
      return (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Generating...
        </span>
      );
    }
    return "Try On This Garment ✨";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="relative group rounded-3xl overflow-hidden border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800">
        <label className="cursor-pointer flex flex-col items-center justify-center p-8 w-full min-h-[250px]">
          {preview ? (
            <img src={preview} alt="Upload preview" className="max-h-64 object-contain rounded-xl shadow-lg ring-1 ring-black/5" />
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <div>
                <p className="text-neutral-900 dark:text-neutral-100 font-semibold text-lg">Click to select your photo</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">High quality, front-facing preferred</p>
                <p className="text-xs text-neutral-400 mt-2">JPG, PNG, WEBP (Max 10MB)</p>
              </div>
            </div>
          )}
          <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
        </label>
      </div>

      {isResizing && originalDimensions && targetDimensions && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
          <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium">Optimizing for AI...</span>
          <span className="ml-auto font-mono text-xs text-blue-600 dark:text-blue-400">
            {originalDimensions.w}&times;{originalDimensions.h}
            <span className="mx-1.5">→</span>
            {targetDimensions.w}&times;{targetDimensions.h}
          </span>
        </div>
      )}

      <button
        onClick={handleTryOn}
        disabled={!file || isUploading || isResizing}
        className={cn(
          "w-full py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 transform",
          !file || isUploading || isResizing
            ? "bg-neutral-300 dark:bg-neutral-800 cursor-not-allowed text-neutral-500"
            : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-indigo-500/25 active:scale-95"
        )}
      >
        {getButtonLabel()}
      </button>
    </div>
  );
}
