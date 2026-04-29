import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ── In-memory store (seed from static data) ──────────────────────────────────
import type { TrainSchedule, ServiceAlert } from "../src/data/prasa";
import type { NewsItem } from "../src/data/extras";

let schedules: TrainSchedule[] = [
  { id: "S1", trainNo: "0412", line: "Southern Line", from: "Cape Town", to: "Simon's Town", departure: "06:15", arrival: "07:32", durationMin: 77, stops: ["Cape Town","Salt River","Observatory","Claremont","Wynberg","Retreat","Muizenberg","Fish Hoek","Simon's Town"], status: "On Time", platform: "11", fare: 14.5 },
  { id: "S2", trainNo: "0428", line: "Southern Line", from: "Cape Town", to: "Simon's Town", departure: "07:05", arrival: "08:25", durationMin: 80, stops: ["Cape Town","Salt River","Observatory","Mowbray","Rondebosch","Claremont","Wynberg","Retreat","Muizenberg","Fish Hoek","Simon's Town"], status: "Delayed", delayMin: 12, platform: "12", fare: 14.5 },
  { id: "N1", trainNo: "1102", line: "Northern Line", from: "Cape Town", to: "Bellville", departure: "06:30", arrival: "07:05", durationMin: 35, stops: ["Cape Town","Salt River","Pinelands","Goodwood","Parow","Bellville"], status: "On Time", platform: "5", fare: 11 },
  { id: "N2", trainNo: "1124", line: "Northern Line", from: "Bellville", to: "Cape Town", departure: "07:10", arrival: "07:48", durationMin: 38, stops: ["Bellville","Parow","Goodwood","Pinelands","Salt River","Cape Town"], status: "On Time", platform: "2", fare: 11 },
  { id: "C1", trainNo: "2208", line: "Central Line", from: "Cape Town", to: "Khayelitsha", departure: "06:45", arrival: "07:55", durationMin: 70, stops: ["Cape Town","Salt River","Langa","Nyanga","Philippi","Mitchells Plain","Khayelitsha"], status: "Delayed", delayMin: 18, platform: "8", fare: 12.5 },
  { id: "C2", trainNo: "2240", line: "Cape Flats Line", from: "Cape Town", to: "Retreat", departure: "07:20", arrival: "08:18", durationMin: 58, stops: ["Cape Town","Salt River","Pinelands","Nyanga","Philippi","Retreat"], status: "On Time", platform: "9", fare: 12 },
  { id: "S3", trainNo: "0516", line: "Southern Line", from: "Simon's Town", to: "Cape Town", departure: "16:42", arrival: "18:00", durationMin: 78, stops: ["Simon's Town","Fish Hoek","Muizenberg","Retreat","Wynberg","Claremont","Observatory","Salt River","Cape Town"], status: "On Time", platform: "1", fare: 14.5 },
  { id: "N3", trainNo: "1206", line: "Northern Line", from: "Cape Town", to: "Bellville", departure: "17:15", arrival: "17:52", durationMin: 37, stops: ["Cape Town","Salt River","Pinelands","Goodwood","Parow","Bellville"], status: "Cancelled", platform: "—", fare: 11 },
];

let alerts: ServiceAlert[] = [
  { id: "a1", level: "critical", title: "Northern Line: Train 1206 cancelled", message: "The 17:15 from Cape Town to Bellville is cancelled due to signal failure. Next service at 17:45.", line: "Northern Line", postedAt: "2025-04-24T14:10:00Z" },
  { id: "a2", level: "warning", title: "Central Line delays of up to 20 minutes", message: "Cable theft between Langa and Nyanga is causing delays. Maintenance teams on site.", line: "Central Line", postedAt: "2025-04-24T12:30:00Z" },
  { id: "a3", level: "info", title: "Southern Line weekend works", message: "Engineering work between Muizenberg and Fish Hoek this Sunday from 06:00 to 14:00. Bus shuttles in operation.", line: "Southern Line", postedAt: "2025-04-23T09:00:00Z" },
];

let news: NewsItem[] = [
  { id: "n1", title: "Central Line returns to full service after upgrade", excerpt: "Following extensive infrastructure rehabilitation, Metrorail Central Line trains now operate at full capacity between Cape Town and Khayelitsha.", category: "Network", date: "2025-04-22" },
  { id: "n2", title: "PRASA invests R450m in new signalling for Western Cape", excerpt: "A new digital signalling programme will improve safety, reduce delays and increase frequency on Southern and Northern lines.", category: "Upgrade", date: "2025-04-15" },
  { id: "n3", title: "Free travel for matric pupils on exam days", excerpt: "Grade 12 learners can travel free on Metrorail services on presentation of their exam admission letter at any station.", category: "Community", date: "2025-04-08" },
  { id: "n4", title: "Statement on weekend Southern Line works", excerpt: "Engineering teams will be on site this weekend at Muizenberg. Bus shuttles will be deployed between Muizenberg and Fish Hoek.", category: "Press", date: "2025-04-04" },
];

// ── Simple session store ──────────────────────────────────────────────────────
const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
const ADMIN_PASS = process.env.ADMIN_PASS ?? "prasa2025";
const sessions = new Set<string>();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-admin-token"] as string | undefined;
  if (!token || !sessions.has(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = randomUUID();
    sessions.add(token);
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post("/api/admin/logout", requireAuth, (req, res) => {
  const token = req.headers["x-admin-token"] as string;
  sessions.delete(token);
  res.json({ ok: true });
});

// ── Public endpoints ──────────────────────────────────────────────────────────
app.get("/api/schedules", (_req, res) => res.json(schedules));
app.get("/api/alerts", (_req, res) => res.json(alerts));
app.get("/api/news", (_req, res) => res.json(news));

// ── Admin: Schedules ──────────────────────────────────────────────────────────
app.post("/api/admin/schedules", requireAuth, (req, res) => {
  const item: TrainSchedule = { ...req.body, id: randomUUID() };
  schedules.push(item);
  res.status(201).json(item);
});

app.put("/api/admin/schedules/:id", requireAuth, (req, res) => {
  const idx = schedules.findIndex((s) => s.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  schedules[idx] = { ...schedules[idx], ...req.body, id: req.params.id };
  res.json(schedules[idx]);
});

app.delete("/api/admin/schedules/:id", requireAuth, (req, res) => {
  schedules = schedules.filter((s) => s.id !== req.params.id);
  res.json({ ok: true });
});

// ── Admin: Alerts ─────────────────────────────────────────────────────────────
app.post("/api/admin/alerts", requireAuth, (req, res) => {
  const item: ServiceAlert = { ...req.body, id: randomUUID(), postedAt: new Date().toISOString() };
  alerts.unshift(item);
  res.status(201).json(item);
});

app.put("/api/admin/alerts/:id", requireAuth, (req, res) => {
  const idx = alerts.findIndex((a) => a.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  alerts[idx] = { ...alerts[idx], ...req.body, id: req.params.id };
  res.json(alerts[idx]);
});

app.delete("/api/admin/alerts/:id", requireAuth, (req, res) => {
  alerts = alerts.filter((a) => a.id !== req.params.id);
  res.json({ ok: true });
});

// ── Admin: News ───────────────────────────────────────────────────────────────
app.post("/api/admin/news", requireAuth, (req, res) => {
  const item: NewsItem = { ...req.body, id: randomUUID() };
  news.unshift(item);
  res.status(201).json(item);
});

app.put("/api/admin/news/:id", requireAuth, (req, res) => {
  const idx = news.findIndex((n) => n.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  news[idx] = { ...news[idx], ...req.body, id: req.params.id };
  res.json(news[idx]);
});

app.delete("/api/admin/news/:id", requireAuth, (req, res) => {
  news = news.filter((n) => n.id !== req.params.id);
  res.json({ ok: true });
});

// ── Stats for dashboard ───────────────────────────────────────────────────────
app.get("/api/admin/stats", requireAuth, (_req, res) => {
  res.json({
    totalSchedules: schedules.length,
    onTime: schedules.filter((s) => s.status === "On Time").length,
    delayed: schedules.filter((s) => s.status === "Delayed").length,
    cancelled: schedules.filter((s) => s.status === "Cancelled").length,
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter((a) => a.level === "critical").length,
    totalNews: news.length,
  });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`PRASA API running on http://localhost:${PORT}`));
