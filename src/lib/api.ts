const BASE = "http://localhost:3001/api";

function getToken() {
  return localStorage.getItem("admin_token") ?? "";
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "x-admin-token": getToken(), ...init?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export const api = {
  // Public
  schedules: () => apiFetch<import("@/data/prasa").TrainSchedule[]>("/schedules"),
  alerts: () => apiFetch<import("@/data/prasa").ServiceAlert[]>("/alerts"),
  news: () => apiFetch<import("@/data/extras").NewsItem[]>("/news"),

  // Auth
  login: (username: string, password: string) =>
    apiFetch<{ token: string }>("/admin/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => apiFetch("/admin/logout", { method: "POST" }),

  // Stats
  stats: () =>
    apiFetch<{ totalSchedules: number; onTime: number; delayed: number; cancelled: number; totalAlerts: number; criticalAlerts: number; totalNews: number }>("/admin/stats"),

  // Admin CRUD
  createAlert: (data: object) => apiFetch("/admin/alerts", { method: "POST", body: JSON.stringify(data) }),
  updateAlert: (id: string, data: object) => apiFetch(`/admin/alerts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAlert: (id: string) => apiFetch(`/admin/alerts/${id}`, { method: "DELETE" }),

  createSchedule: (data: object) => apiFetch("/admin/schedules", { method: "POST", body: JSON.stringify(data) }),
  updateSchedule: (id: string, data: object) => apiFetch(`/admin/schedules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSchedule: (id: string) => apiFetch(`/admin/schedules/${id}`, { method: "DELETE" }),

  createNews: (data: object) => apiFetch("/admin/news", { method: "POST", body: JSON.stringify(data) }),
  updateNews: (id: string, data: object) => apiFetch(`/admin/news/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteNews: (id: string) => apiFetch(`/admin/news/${id}`, { method: "DELETE" }),
};
