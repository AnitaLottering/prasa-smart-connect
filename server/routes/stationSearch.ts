import { Router } from "express";
import axios from "axios";
import { supabase } from "../db";
import { runScrape } from "../scraper";

const router = Router();

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

// GET /api/stations/search?q=Cape+Town
// Uses OpenStreetMap Overpass API — completely free, no key required
router.get("/search", async (req, res) => {
  const q = (req.query.q as string)?.trim();
  if (!q || q.length < 2) {
    res.status(400).json({ error: "Query must be at least 2 characters" });
    return;
  }

  const cacheKey = q.toLowerCase();

  // 1. Check Supabase cache
  try {
    const { data: cached } = await supabase
      .from("station_cache")
      .select("results, cached_at")
      .eq("query", cacheKey)
      .single();

    if (cached && Date.now() - new Date(cached.cached_at).getTime() < CACHE_TTL_MS) {
      res.json({ results: cached.results, source: "cache" });
      return;
    }
  } catch {
    // cache miss — continue to fetch
  }

  // 2. Query Overpass API for train stations in South Africa matching the name
  const overpassQuery = `
    [out:json][timeout:10];
    (
      node["railway"="station"]["name"~"${q}",i](area:3600195272);
      node["railway"="halt"]["name"~"${q}",i](area:3600195272);
      way["railway"="station"]["name"~"${q}",i](area:3600195272);
    );
    out center tags;
  `;

  try {
    const { data } = await axios.post(
      "https://overpass-api.de/api/interpreter",
      overpassQuery,
      { headers: { "Content-Type": "text/plain" }, timeout: 12_000 },
    );

    const elements: OverpassElement[] = data.elements ?? [];

    const results = elements.slice(0, 10).map((el) => {
      const lat = el.lat ?? el.center?.lat ?? 0;
      const lng = el.lon ?? el.center?.lon ?? 0;
      const tags = el.tags ?? {};
      return {
        name: tags.name ?? "Unknown Station",
        osm_id: el.id,
        address: [tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", ") || tags.operator || "South Africa",
        lat,
        lng,
        operator: tags.operator ?? tags.network ?? "Metrorail",
        line: tags.line ?? tags.network ?? "",
      };
    });

    // 3. Upsert into Supabase cache
    await supabase.from("station_cache").upsert(
      { query: cacheKey, results, cached_at: new Date().toISOString() },
      { onConflict: "query" },
    );

    res.json({ results, source: "openstreetmap" });
  } catch (err) {
    console.error("[stationSearch] Overpass error:", (err as Error).message);
    res.status(502).json({ error: "Failed to fetch station data" });
  }
});

// GET /api/stations/departures?station=Cape+Town
// Returns all upcoming trains from a station using live scraped data
router.get("/departures", async (req, res) => {
  const station = (req.query.station as string)?.trim();
  if (!station) {
    res.status(400).json({ error: "station parameter is required" });
    return;
  }

  const { trains } = await runScrape().catch(() => ({ trains: [] as any[] }));

  const now = new Date();
  const nowStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // Match trains departing FROM this station (case-insensitive partial match)
  const stationLower = station.toLowerCase();
  const departures = trains
    .filter((t) => t.from_station.toLowerCase().includes(stationLower))
    .sort((a: any, b: any) => (a.departure || "").localeCompare(b.departure || ""));

  // Also find all possible destinations from this station
  const destinations = [...new Set(
    trains
      .filter((t: any) => t.from_station.toLowerCase().includes(stationLower))
      .map((t: any) => t.to_station)
      .filter(Boolean),
  )].sort();

  // Separate upcoming vs past based on departure time
  const upcoming = departures.filter((t: any) => !t.departure || t.departure >= nowStr);
  const earlier  = departures.filter((t: any) => t.departure && t.departure < nowStr);

  res.json({
    station,
    destinations,
    upcoming,
    earlier,
    total: departures.length,
    scraped_at: trains[0]?.scraped_at ?? null,
  });
});

export default router;
