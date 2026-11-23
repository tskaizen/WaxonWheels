# Booking backend + going live

## How booking works
- Website form -> `/.netlify/functions/book` -> **yellow "PENDING:" event** on the owner's Google Calendar (does not block her availability).
- Owner reviews on her phone's Google Calendar app: keep it (rename/recolor) to confirm, delete it to decline.
- Manual appointments: `/admin.html` (password protected) -> **red confirmed event**.
- The form falls back to the old email flow if the function ever fails.

## One-time Google setup (owner's Google account needed)
1. console.cloud.google.com -> new project -> enable **Google Calendar API**.
2. IAM -> Service Accounts -> create one -> Keys -> add JSON key.
3. In Google Calendar (the owner's, e.g. waxonwheelspbc@gmail.com): Settings -> the calendar -> **Share with specific people** -> add the service account email with **Make changes to events**.
4. Copy the Calendar ID from Settings -> Integrate calendar.

## Netlify environment variables
| Name | Value |
|---|---|
| GOOGLE_SERVICE_ACCOUNT_EMAIL | `client_email` from the JSON key |
| GOOGLE_PRIVATE_KEY | `private_key` from the JSON key |
| GOOGLE_CALENDAR_ID | calendar ID from step 4 |
| ADMIN_PASSWORD | long password for /admin.html |

## Go live
1. Netlify -> Add new site -> Import from GitHub (this repo). Settings are read from `netlify.toml`.
2. Add the env variables above, redeploy.
3. Domain settings -> add the owner's domain; at the registrar either point nameservers to Netlify or add the DNS records Netlify shows. HTTPS is automatic.
4. Search Console: add the domain, verify via DNS TXT, submit `sitemap.xml`.
5. Google Business Profile: update the website URL to the new domain (owner must grant you Manager access, you never need her password).
