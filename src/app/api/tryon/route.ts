import { NextRequest } from "next/server";
import sharp from "sharp";
import { readFile } from "fs/promises";
import { join } from "path";
import { tryOnWithGptImageOnly } from "@/lib/ai/gpt-image";
import { getGarmentById } from "@/lib/garments";
import type { SseEvent } from "@/lib/types";

const MAX_MEGAPIXELS = 649_000; // 0.59 MP + ~10% tolerance

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
} as const;

function encodeEvent(event: SseEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

function validateImage(file: File): void {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid format. Only JPG, PNG, and WEBP supported.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File too large. Maximum size is 10 MB.");
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const formData = await req.formData();
        const userImage = formData.get("userImage") as File | null;
        const garmentId = formData.get("garmentId") as string | null;

        if (!userImage || !garmentId) {
          controller.enqueue(encodeEvent({ type: "error", error: "Missing userImage or garmentId" }));
          controller.close();
          return;
        }

        try {
          validateImage(userImage);
        } catch (validationError: unknown) {
          const message = validationError instanceof Error ? validationError.message : "Invalid image.";
          controller.enqueue(encodeEvent({ type: "error", error: message }));
          controller.close();
          return;
        }

        const garment = getGarmentById(garmentId);
        if (!garment) {
          controller.enqueue(encodeEvent({ type: "error", error: "Garment not found" }));
          controller.close();
          return;
        }

        const userImageBuffer = await userImage.arrayBuffer();

        // Validate megapixels using sharp before hitting the AI pipeline
        const metadata = await sharp(Buffer.from(userImageBuffer)).metadata();
        const { width, height } = metadata;
        if (!width || !height) {
          controller.enqueue(encodeEvent({ type: "error", error: "Could not read image dimensions." }));
          controller.close();
          return;
        }
        const megapixels = width * height;
        if (megapixels > MAX_MEGAPIXELS) {
          controller.enqueue(encodeEvent({ type: "error", error: `Image too large (${megapixels}px). Maximum is 590,000 megapixels.` }));
          controller.close();
          return;
        }

        const garmentPath = join(process.cwd(), "public", garment.assetUrl.replace(/^\//, ""));
        let garmentBuffer: ArrayBuffer;
        try {
          const garmentBytes = await readFile(garmentPath);
          garmentBuffer = garmentBytes.buffer.slice(
            garmentBytes.byteOffset,
            garmentBytes.byteOffset + garmentBytes.byteLength
          ) as ArrayBuffer;
        } catch {
          controller.enqueue(encodeEvent({ type: "error", error: "Garment image not found on server." }));
          controller.close();
          return;
        }

        const orientation: "portrait" | "landscape" | "square" =
          height > width ? "portrait" : width > height ? "landscape" : "square";

        const gptStart = Date.now();
        let finalImageUrl: string;
        try {
          finalImageUrl = await tryOnWithGptImageOnly({
            userImage: userImageBuffer,
            garmentImage: garmentBuffer,
            orientation,
          });
        } catch {
          console.warn("GPT API failed, retrying once after 1s delay...");
          await new Promise(r => setTimeout(r, 1000));
          finalImageUrl = await tryOnWithGptImageOnly({
            userImage: userImageBuffer,
            garmentImage: garmentBuffer,
            orientation,
          });
        }
        const gptLatency = Date.now() - gptStart;
        const totalLatency = Date.now() - startTime;

        console.info(`[TryOn GPT-Only Metrics] GPT: ${gptLatency}ms, Total: ${totalLatency}ms`);

        controller.enqueue(encodeEvent({
          type: "final",
          imageUrl: finalImageUrl,
          metrics: {
            gptLatencyMs: gptLatency,
            totalLatencyMs: totalLatency,
          },
        }));

        controller.enqueue(encodeEvent({ type: "done" }));
        controller.close();

      } catch (error: unknown) {
        console.error("Pipeline failed:", error);
        const message = error instanceof Error ? error.message : "Failed to generate try-on image. Please try again later.";
        controller.enqueue(encodeEvent({ type: "error", error: message }));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
