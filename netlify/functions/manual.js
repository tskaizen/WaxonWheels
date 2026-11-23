// Owner-only endpoint: manual appointment (phone/text/walk-in) -> CONFIRMED event.
const crypto = require("crypto");
const { createEvent, json, clean, isDate } = require("./_calendar");

const safeEq = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });
  const pass = (event.headers.authorization || "").replace(/^Bearer /, "");
  if (!process.env.ADMIN_PASSWORD || !safeEq(pass, process.env.ADMIN_PASSWORD)) return json(401, { error: "Wrong password" });
  let b; try { b = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "Bad JSON" }); }

  const date = clean(b.date, 10), time = clean(b.time, 5);
  if (!clean(b.name) || !clean(b.service) || !isDate(date) || !/^\d{2}:\d{2}$/.test(time)) return json(400, { error: "Name, service, date and time are required" });
  try {
    const ev = await createEvent({
      status: "confirmed",
      summary: `${clean(b.name, 100)} – ${clean(b.service, 120)}`,
      location: clean(b.address, 200),
      description: [`Phone: ${clean(b.phone, 30) || "n/a"}`, `Vehicle: ${clean(b.vehicle, 100) || "n/a"}`, `Price: ${clean(b.price, 20) || "n/a"}`, `Notes: ${clean(b.notes, 1000) || "none"}`, "", "Added manually."].join("\n"),
      date, window: time,
    });
    return json(200, { ok: true, link: ev.htmlLink });
  } catch (err) {
    console.error("manual insert failed", err.message);
    return json(502, { error: "Calendar error: " + err.message });
  }
};
