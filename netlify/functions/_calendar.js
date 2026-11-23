// Shared Google Calendar helpers. The calendar is the single source of truth:
// pending requests show as yellow "PENDING" events, confirmed ones as red.
const { google } = require("googleapis");

const TZ = "America/New_York";
const WINDOWS = { Morning: ["08:00", "11:00"], Midday: ["11:00", "14:00"], Afternoon: ["14:00", "17:00"] };
const COLOR = { pending: "5", confirmed: "11" }; // 5 = banana yellow, 11 = tomato red

function calendar() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
  return google.calendar({ version: "v3", auth });
}

// date "YYYY-MM-DD", window "Morning|Midday|Afternoon" (or "HH:MM" start time)
function times(date, win) {
  let [s, e] = WINDOWS[win] || [null, null];
  if (!s) { s = /^\d{2}:\d{2}$/.test(win || "") ? win : "09:00"; const h = (+s.slice(0, 2) + 2) % 24; e = String(h).padStart(2, "0") + s.slice(2); }
  return { start: { dateTime: `${date}T${s}:00`, timeZone: TZ }, end: { dateTime: `${date}T${e}:00`, timeZone: TZ } };
}

async function createEvent({ status, summary, description, location, date, window }) {
  const res = await calendar().events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: (status === "pending" ? "PENDING: " : "") + summary,
      description, location, colorId: COLOR[status],
      ...times(date, window),
      // Block time only once confirmed, so pending requests don't hide availability.
      transparency: status === "pending" ? "transparent" : "opaque",
      extendedProperties: { private: { source: "waxonwheels-site", status } },
    },
  });
  return res.data;
}

const json = (code, body) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const clean = (v, n = 500) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d));

module.exports = { createEvent, json, clean, isDate, WINDOWS };
