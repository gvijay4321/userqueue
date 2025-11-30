// src/utils/serviceTag.ts
export function inferServiceFromBrowserTime(
  now: Date = new Date()
): "lunch" | "dinner" | null {
  const h = now.getHours();
  const m = now.getMinutes();

  const minutesOfDay = (hh: number, mm: number = 0) => hh * 60 + mm;
  const current = minutesOfDay(h, m);

  const lunchStart = minutesOfDay(11, 0);
  const lunchEnd = minutesOfDay(16, 0);
  const dinnerStart = minutesOfDay(19, 0);
  const dinnerEnd = minutesOfDay(23, 0);

  if (current >= lunchStart && current <= lunchEnd) return "lunch";
  if (current >= dinnerStart && current <= dinnerEnd) return "dinner";
  return null;
}

export function getServiceTag(): "lunch" | "dinner" {
  const urlParams = new URLSearchParams(window.location.search);
  const urlSvc = urlParams.get("svc") as "lunch" | "dinner" | null;

  const inferred = inferServiceFromBrowserTime();
  return urlSvc || inferred || "lunch";
}
