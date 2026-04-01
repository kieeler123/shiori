import { supabase } from "@/lib/supabaseClient";
import { normalizeError } from "./normalizeError";

export type ErrorCategory =
  | "auth"
  | "storage"
  | "db"
  | "editor"
  | "attachment"
  | "render"
  | "network"
  | "unknown";

type LogErrorInput = {
  category: ErrorCategory;
  action?: string;
  page?: string;
  error: unknown;
  meta?: Record<string, unknown>;
};

export async function logError({
  category,
  action,
  page,
  error,
  meta,
}: LogErrorInput): Promise<void> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    const normalized = normalizeError(error);

    const { error: insertError } = await supabase.from("error_logs").insert({
      user_id: user?.id ?? null,
      category,
      action: action ?? null,
      page: page ?? null,
      message: normalized.message,
      stack: normalized.stack,
      meta: meta ?? {},
    });

    if (insertError) {
      console.error("[logError] insert failed:", insertError);
    }
  } catch (loggingError) {
    console.error("[logError] failed:", loggingError);
  }
}
