import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { QueueToken, FormData } from "../types/queue";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

type StoredToken = {
  token: QueueToken;
  savedAt: number;
};

const storageKey = (orgId: string, serviceTag: string) =>
  `queue_token:${orgId}:${serviceTag}`;

const saveTokenToStorage = (
  orgId: string,
  serviceTag: string,
  token: QueueToken | null
) => {
  const key = storageKey(orgId, serviceTag);
  if (!token) {
    localStorage.removeItem(key);
    return;
  }
  const payload: StoredToken = { token, savedAt: Date.now() };
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    // Ignore storage errors (quota/disabled)
    console.error("Failed to save token to localStorage:", e);
  }
};

const loadTokenFromStorage = (
  orgId: string,
  serviceTag: string
): QueueToken | null => {
  try {
    const raw = localStorage.getItem(storageKey(orgId, serviceTag));
    if (!raw) return null;
    const parsed: StoredToken = JSON.parse(raw);
    if (!parsed?.savedAt || !parsed?.token) return null;
    if (Date.now() - parsed.savedAt > TOKEN_EXPIRY_MS) {
      // expired
      localStorage.removeItem(storageKey(orgId, serviceTag));
      return null;
    }
    return parsed.token;
  } catch (e) {
    console.error("Failed to load token from localStorage:", e);
    return null;
  }
};

/**
 * Extend NotificationOptions to include vibrate (supported by Chrome on Android).
 * This keeps TypeScript happy while allowing us to pass vibrate to the constructor.
 */
interface NotificationOptionsWithVibrate extends NotificationOptions {
  vibrate?: number | number[];
}

export const useQueue = (orgId: string, serviceTag: string) => {
  const [token, setToken] = useState<QueueToken | null>(null);
  const [queuePosition, setQueuePosition] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const today = new Date().toISOString().slice(0, 10);

  // track previous status to detect transitions
  const prevStatusRef = useRef<string | null>(null);

  // helper: check if notification permission already granted
  const hasNotificationPermission = () =>
    typeof Notification !== "undefined" &&
    Notification.permission === "granted";

  // EFFECT: trigger buzz + optional notification when status transitions to "called"
  useEffect(() => {
    const currentStatus = token?.status ?? null;
    const prevStatus = prevStatusRef.current;

    if (prevStatus !== currentStatus && currentStatus === "called") {
      // Vibrate (best-effort). Wrap in try/catch to avoid throwing in unsupported environments.
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate([300, 100, 300]);
        }
      } catch (e) {
        console.warn("Vibration failed:", e);
      }

      // Show a Notification only if permission already granted (do not auto-prompt).
      (async () => {
        try {
          if (hasNotificationPermission()) {
            const title = "You're being seated";
            const body = `Token ${token?.token_number ?? ""} — please head in.`;
            const options: NotificationOptionsWithVibrate = {
              body,
              tag: `queue-${orgId}-${serviceTag}-${token?.token_number}`,
              vibrate: [300, 100, 300],
            };
            // eslint-disable-next-line no-new
            new Notification(title, options);
          }
        } catch (e) {
          console.warn("Notification failed:", e);
        }
      })();
    }

    // update prev status for next run
    prevStatusRef.current = currentStatus;
  }, [token, orgId, serviceTag]);

  // load token from localStorage on mount or when org/service change
  useEffect(() => {
    const stored = loadTokenFromStorage(orgId, serviceTag);
    if (stored) setToken(stored);
  }, [orgId, serviceTag]);

  // persist token to localStorage whenever it changes
  useEffect(() => {
    saveTokenToStorage(orgId, serviceTag, token);
  }, [orgId, serviceTag, token]);

  const updateQueuePosition = useCallback(async () => {
    if (!token) return;

    // check expiry: if token has been stored longer than expiry, drop it
    // (this is defensive; savedAt is handled in storage loader but we re-check here)
    try {
      const raw = localStorage.getItem(storageKey(orgId, serviceTag));
      if (!raw) return;
      const parsed: StoredToken = JSON.parse(raw);
      if (Date.now() - parsed.savedAt > TOKEN_EXPIRY_MS) {
        // expired — clear and bail out
        localStorage.removeItem(storageKey(orgId, serviceTag));
        setToken(null);
        setQueuePosition(0);
        return;
      }
    } catch (e) {
      console.error("Unexpected error restoring token:", e);
    }

    try {
      const { data: waiting } = await supabase
        .from("queue_tokens")
        .select("token_number")
        .eq("org_id", orgId)
        .eq("service_date", today)
        .eq("service_tag", serviceTag)
        .eq("status", "waiting")
        .order("token_number", { ascending: true });

      if (waiting) {
        const position =
          waiting.findIndex((t) => t.token_number === token.token_number) + 1;
        setQueuePosition(Math.max(0, position));
      }
    } catch (err) {
      console.error("Error updating queue position:", err);
    }
  }, [token, orgId, serviceTag, today]);

  const joinQueue = async (formData: FormData): Promise<void> => {
    setIsLoading(true);
    setError("");

    try {
      // Get the last token number for today
      const { data: lastToken } = await supabase
        .from("queue_tokens")
        .select("token_number")
        .eq("org_id", orgId)
        .eq("service_date", today)
        .eq("service_tag", serviceTag)
        .order("token_number", { ascending: false })
        .limit(1);

      const nextTokenNumber =
        lastToken && lastToken.length > 0
          ? (lastToken[0].token_number || 0) + 1
          : 1;

      // Insert new token
      const { data: newToken, error: insertError } = await supabase
        .from("queue_tokens")
        .insert({
          org_id: orgId,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          people_count: formData.count,
          token_number: nextTokenNumber,
          status: "waiting",
          service_date: today,
          service_tag: serviceTag,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      setToken(newToken);
      // updateQueuePosition will run from effect/subscription, but call once now
      await updateQueuePosition();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to join queue";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!token) return;

    const channel = supabase
      .channel("queue-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_tokens",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (payload: any) => {
          // Update current token status if it's our token
          if (payload.new?.id === token.id) {
            setToken((prev) => (prev ? { ...prev, ...payload.new } : null));
          }

          // Always update queue position
          await updateQueuePosition();
        }
      )
      .subscribe();

    // Polling fallback every 30 seconds
    const pollInterval = setInterval(updateQueuePosition, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [token, updateQueuePosition]);

  return {
    token,
    queuePosition,
    isLoading,
    error,
    joinQueue,
  };
};
