export const TRY_ON_STATUS = {
  IDLE: "idle",
  LOADING: "loading",   // GPT running
  SUCCESS: "success",   // Final image ready
  ERROR: "error",
} as const;

export type TryOnStatus = (typeof TRY_ON_STATUS)[keyof typeof TRY_ON_STATUS];

// SSE event types (shared between route.ts and client)
interface SseMetrics {
  gptLatencyMs: number;
  totalLatencyMs: number;
}

interface SseFinalEvent {
  type: "final";
  imageUrl: string;
  metrics: SseMetrics;
}

interface SseDoneEvent {
  type: "done";
}

interface SseErrorEvent {
  type: "error";
  error: string;
}

export type SseEvent = SseFinalEvent | SseDoneEvent | SseErrorEvent;
