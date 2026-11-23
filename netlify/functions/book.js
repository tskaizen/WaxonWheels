// Public endpoint: website quote/booking form -> PENDING event on the owner's Google Calendar.
const { createEvent, json, clean, isDate, WINDOWS } = require("./_calendar");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });
  let b; try { b = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "Bad JSON" }); }
  if (b["bot-field"]) return json(200, { ok: true }); // honeypot: pretend success

  const d = {
    name: clean(`${b.first_name || ""} ${b.last_name || ""}`, 100),
    phone: clean(b.phone, 30), email: clean(b.email, 120),
    service: clean(b.service_label || b.service, 120), where: clean(b.location, 40),
    city: clean(b.city, 80), vehicle: clean(`${b.year || ""} ${b.make || ""} ${b.model || ""}`, 100),
    notes: clean(b.details, 1000), date: clean(b.preferred_date, 10), window: clean(b.preferred_time, 20),
  };
  if (!d.name || !d.phone || !/^\S+@\S+\.\S+$/.test(d.email) || !d.service) return json(400, { error: "Missing required fields" });
  if (!isDate(d.date)) return json(400, { error: "Please choose a preferred date" });
  if (!WINDOWS[d.window]) d.window = "Morning";

  try {
    await createEvent({
      status: "pending",
      summary: `${d.name} – ${d.service}`,
      location: [d.where, d.city].filter(Boolean).join(", "),
      description: [`Phone: ${d.phone}`, `Email: ${d.email}`, `Vehicle: ${d.vehicle || "n/a"}`, `Location type: ${d.where}`,
        `Requested window: ${d.window}`, `Notes: ${d.notes || "none"}`, "", "Status: PENDING. Keep it (rename/recolor) to confirm, or delete the event to decline."].join("\n"),
      date: d.date, window: d.window,
    });
    return json(200, { ok: true });
  } catch (err) {
    console.error("calendar insert failed", err.message);
    return json(502, { error: "Could not save your request. Please call (561) 804-1299." });
  }
};
