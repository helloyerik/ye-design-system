# Ye domains

The one registry of public addresses for Ye apps, and the runbook for changing them. Every app README links here.
Update this file in the same change as any domain move (see "Update this doc" in the runbook).

Last checked: 23 Oct 2026 (Asia/Almaty).

## Registry

| Service | Address | Vercel project | Repo | Old vercel.app alias | Old alias status |
|---|---|---|---|---|---|
| Ye account (shared sign-in) | https://account.yerik.xyz | `yeaccount` | helloyerik/yeaccount | yeaccount.vercel.app | 308 → account.yerik.xyz (Vercel domain redirect, whole host) |
| Yecalendar | https://calendar.yerik.xyz | `yecalendar` | helloyerik/yecalendar | yecalendar.vercel.app | **Serves the app, no redirect.** Android OTA (`Updater.BUNDLE_URL`) and the Android API origin (`__API_URL__`) use it. See "Pending: Yecalendar" |
| Yeconvert | https://convert.yerik.xyz | `yeconvert` | helloyerik/yeconvert | yeconvert.vercel.app | 308 → convert.yerik.xyz (Vercel domain redirect, whole host) |
| Yejournal | https://journal.yerik.xyz | `yejournal` | helloyerik/yejournal | yejournal.vercel.app | **Serves the app, no redirect.** Entries are local-first (IndexedDB per origin) and sign-in can't work on vercel.app, so a redirect would hide any entries written there. See "Pending: Yejournal" |
| Yetracker | https://tracker.yerik.xyz | `yetracker` | helloyerik/yetracker (production branch `feat/chart-modes`) | hexpo.vercel.app | 308 → tracker.yerik.xyz (Vercel domain redirect, whole host) |
| Yefocus | https://focus.yerik.xyz | `yefocus` | helloyerik/yefocus | yefocus.vercel.app | **Serves the app, no redirect yet.** A browser-only redirect is in `vercel.json` (yefocus PR "Domain: focus.yerik.xyz"). It applies after that PR is merged and deployed. The API, OTA and the Mac companion keep using the old host |
| Yeplayer | https://player.yerik.xyz | `yeplayer` | helloyerik/yeplayer | yeplayer.vercel.app | 308 → player.yerik.xyz (set up separately in the yeplayer project) |
| Portfolio | https://yerik.xyz | `portfolio` | — | — | apex, leave as is |
| Yetube | tube.yerik.xyz | — | helloyerik/yetube | — | **Reserved.** No DNS record, no Vercel domain yet |
| Yereader | reader.yerik.xyz | — | helloyerik/yereader | — | **Reserved.** No DNS record, no Vercel domain yet |

Naming: `<app without "ye">.yerik.xyz`. Do not reuse a reserved name for anything else.

`YE_APPS` (`packages/ui-react/src/apps.tsx`, table in [apps.md](apps.md)) lists the primary `*.yerik.xyz` address of every deployed app. Keep it in sync with this table.

## Where DNS lives

- Domain `yerik.xyz`: registrar **Porkbun**. Nameservers are Cloudflare (`eugene.ns.cloudflare.com`, `evangeline.ns.cloudflare.com`). Do not change records at Porkbun, because they are not used.
- DNS: **Cloudflare**, zone `yerik.xyz` (zone id `f5b9ea6a3f9f2cb47c4ed03ad1a3e55d`).
- Each app subdomain is a `CNAME <sub> → <per-project target>.vercel-dns-017.com`, **DNS only** (grey cloud, `proxied: false`), TTL auto. Vercel issues and renews the Let's Encrypt certificate, so Cloudflare must not proxy (an orange cloud breaks Vercel's certificate checks).
- Hosting: Vercel team `helloyeriks-projects`. Projects are not connected to GitHub (except where noted). A push does not deploy, so you deploy from the CLI.
- Credentials (names only, never commit values): `VERCEL_TOKEN` (Vercel API/CLI, team `helloyeriks-projects`), `CLOUDFLARE_API_TOKEN` (DNS edit on zone `yerik.xyz`).

Current CNAME targets (from `GET /v6/domains/<domain>/config`, `recommendedCNAME` rank 1):

| Record | Target |
|---|---|
| account | a4961fe14f265d70.vercel-dns-017.com |
| calendar | 4ab22f235261e933.vercel-dns-017.com |
| convert | 2644e234fadf9a07.vercel-dns-017.com |
| journal | 4007d7a9e46c851f.vercel-dns-017.com |
| tracker | 9775f9a196754fb3.vercel-dns-017.com |
| player | 15ae8ec467455e1c.vercel-dns-017.com |
| focus | ba0adc8017242ca4.vercel-dns-017.com |

## Runbook

Shell setup used below:
```sh
T="teamId=helloyeriks-projects"; VH="Authorization: Bearer $VERCEL_TOKEN"
ZONE=f5b9ea6a3f9f2cb47c4ed03ad1a3e55d; CH="Authorization: Bearer $CLOUDFLARE_API_TOKEN"
P=yefoo; SUB=foo; D=$SUB.yerik.xyz          # project, subdomain, full domain
```

### A. Add a service at `<sub>.yerik.xyz`

1. **Check the name.** It must not be in the registry above (reserved names included) and must not exist in Cloudflare:
   `curl -s -H "$CH" "https://api.cloudflare.com/client/v4/zones/$ZONE/dns_records?name=$D" | jq '.result'` should be `[]`.
2. **Add the domain to the Vercel project.**
   `curl -s -X POST -H "$VH" -H 'content-type: application/json' "https://api.vercel.com/v10/projects/$P/domains?$T" -d "{\"name\":\"$D\"}"`
   (or `vercel domains add $D $P --scope helloyeriks-projects`).
3. **Get the CNAME target.**
   `curl -s -H "$VH" "https://api.vercel.com/v6/domains/$D/config?projectIdOrName=$P&$T" | jq -r '.recommendedCNAME[0].value'` (for example `ba0adc8017242ca4.vercel-dns-017.com.`; drop the trailing dot).
4. **Create the Cloudflare record, DNS only.**
   `curl -s -X POST -H "$CH" -H 'content-type: application/json' "https://api.cloudflare.com/client/v4/zones/$ZONE/dns_records" -d "{\"type\":\"CNAME\",\"name\":\"$SUB\",\"content\":\"<target>\",\"proxied\":false,\"ttl\":1,\"comment\":\"Vercel project $P\"}"`
5. **Check the certificate.** Usually ready within a minute:
   ```sh
   curl -s -o /dev/null -w '%{http_code} ssl=%{ssl_verify_result}\n' https://$D/     # 200 ssl=0
   echo | openssl s_client -connect $D:443 -servername $D 2>/dev/null | openssl x509 -noout -subject -issuer -dates
   curl -s -H "$VH" "https://api.vercel.com/v6/domains/$D/config?projectIdOrName=$P&$T" | jq .misconfigured   # false
   ```
6. **Point the app at its new address** (see "App settings to update" below): `*_PUBLIC_URL` env, API base, CSP, CORS allow-list, Android build vars, docs.
7. **Shared sign-in.** account.yerik.xyz already accepts `https://*.yerik.xyz` as a return URL and CORS origin, and the `ye_session` cookie is on `.yerik.xyz`, so nothing changes in yeaccount for a `*.yerik.xyz` host. Only non-yerik.xyz "transition hosts" need to be listed in `extraOrigins` (`server/src/handler.ts` in yeaccount).
8. **Update `YE_APPS`** (`packages/ui-react/src/apps.tsx` + the table in `docs/apps.md` + `CHANGELOG.md`), then bump the `ye-design-system` submodule in each consumer so the rail and account.yerik.xyz "Your apps" link to the new address.
9. **Update this doc** (registry row, CNAME table, "Last checked") and the app README's "Domain" section.

### B. Redirect an old address (for example `<p>.vercel.app`) to the new one

First check what still uses the old host. Search all Ye repos for the old hostname (`rg -n 'yefoo\.vercel\.app'`) and look for:
- **Native clients** (Android `Updater.kt` `BUNDLE_URL`, the `__API_URL__` / `*_API_URL` build var in `web/vite.config.ts`, desktop or companion scripts with a default server). The API is called cross-origin with `Authorization`, so the WebView sends a CORS preflight, and **a preflight that gets a redirect fails**. A whole-host redirect therefore breaks the API for every installed app.
- **OTA.** `Updater.get()` uses `HttpURLConnection` and requires `responseCode == 200`. It downloads `/bundle/manifest.json` and then **every file listed in it from the site root** (`/index.html`, `/assets/*`), not only `/bundle/*`. Path exclusions must cover all of those, or the redirect must not apply to non-browser requests at all.
- **OAuth redirect URIs** registered in a provider console (Google Cloud Console, Yandex OAuth). They are built from `*_PUBLIC_URL`, so if that env still names the old host, a redirect breaks the callback (`redirect_uri_mismatch`). Change the env and the console together.
- **Origin allow-lists**: yeaccount `extraOrigins`, `YETRACKER_EXTRA_ORIGINS`, yefocus `ORIGINS` (= `YEFOCUS_PUBLIC_URL` + localhost).
- **Local-only data** (IndexedDB/localStorage per origin). A redirect makes anything stored only on the old origin unreachable for the user. Export or sync it first.

Then pick one of these:

**B1. Whole host, no deploy** (only when nothing above applies):
```sh
curl -s -X PATCH -H "$VH" -H 'content-type: application/json' "https://api.vercel.com/v9/projects/$P/domains/$P.vercel.app?$T" \
  -d "{\"redirect\":\"$D\",\"redirectStatusCode\":308}"
```
This works for the `*.vercel.app` alias. It applies to every path and method. It keeps path and query, applies immediately, and needs no deploy. It can't exclude paths.

**B2. Browser navigations only** (when native or API clients use the old host). Add this to the app's `vercel.json` and deploy:
```json
"redirects": [
  { "source": "/:path((?!api/|bundle/).*)",
    "has": [ { "type": "host", "value": "yefoo.vercel.app" }, { "type": "header", "key": "sec-fetch-dest", "value": "document" } ],
    "destination": "https://foo.yerik.xyz/:path", "permanent": true }
]
```
Browsers send `Sec-Fetch-Dest: document` only for page navigations. `HttpURLConnection` (OTA), Node `fetch` (companions) and the WebView's `fetch` to `/api` do not, so they keep getting 200 from the old host. `/api/*` and `/bundle/*` are excluded as a second guard. Browsers without Fetch Metadata (very old Safari) simply aren't redirected.

**Verify** (both cases):
```sh
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "https://yefoo.vercel.app/some/path?x=1"                          # B1: 308 https://foo.yerik.xyz/some/path?x=1
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -H 'sec-fetch-dest: document' "https://yefoo.vercel.app/a?x=1"   # B2: 308 https://foo.yerik.xyz/a?x=1
curl -s -o /dev/null -w '%{http_code}\n' https://yefoo.vercel.app/bundle/manifest.json                                       # B2: 200
curl -s -o /dev/null -w '%{http_code}\n' -X OPTIONS -H 'Origin: https://localhost' -H 'Access-Control-Request-Method: POST' https://yefoo.vercel.app/api/me   # B2: 204, not 308
curl -sL -o /dev/null -w '%{url_effective} %{http_code}\n' "https://yefoo.vercel.app/?x=1"                                    # target answers 200
```

### C. Rename a subdomain (`old.yerik.xyz` → `new.yerik.xyz`)

1. Do steps A1–A5 for the new name on the same project. Keep the old one serving.
2. Update app settings (below), `YE_APPS`, OAuth consoles, and the native build vars. Ship the Android release that uses the new host, and wait until installed apps have it.
3. Redirect the old name with B1 (`PATCH /v9/projects/$P/domains/old.yerik.xyz` with `redirect: new.yerik.xyz`, `redirectStatusCode: 308`) or B2 with `"value": "old.yerik.xyz"`.
4. Note: the `ye_session` cookie is on `.yerik.xyz`, so shared sign-in survives a rename. App-local tokens in `localStorage` do not, so users sign in once more.
5. Keep the old record and Vercel domain for at least as long as any installed app can still call it. Never delete records as part of the move.

### D. Move a domain to another Vercel project

1. On the old project, note the domain's settings (`GET /v9/projects/<old>/domains/<d>`).
2. Move it: `POST https://api.vercel.com/v10/projects/<old>/domains/<d>/move?$T` with `{"projectId":"<new project id>"}` (or Dashboard → Domains → Move). The Vercel CNAME target may change. Re-read `/v6/domains/<d>/config?projectIdOrName=<new>` and update the Cloudflare record **content** in place (PATCH, don't delete and re-create).
3. Repeat the A5 certificate check and the verification in B.
4. Update the registry here.

### App settings to update when a host changes

| Where | What |
|---|---|
| Vercel env (per project, production) | `YEACCOUNT_PUBLIC_URL`, `YECALENDAR_PUBLIC_URL`, `YEFOCUS_PUBLIC_URL`, `YETRACKER_PUBLIC_URL` (+ `YETRACKER_EXTRA_ORIGINS`). These drive magic-link URLs, OAuth redirect URIs and the CORS allow-list. Redeploy after changing |
| Web API base | `web/src/api.ts` (yefocus picks same-origin on any http(s) host), `web/vite.config.ts` `__API_URL__` default + `YECALENDAR_API_URL` / `YEFOCUS_API_URL` build env (Android builds) |
| CSP | `vercel.json` headers. `connect-src 'self'` means the web app must call its own origin |
| Android | `android/app/src/main/java/app/<app>/Updater.kt` `BUNDLE_URL` (OTA). `__API_URL__` (baked into the bundle). Only a new APK changes `BUNDLE_URL`, so keep the old host serving `/bundle/*`, the manifest's files and `/api/*` until every installed APK is updated |
| Companion / scripts | yefocus `companion/yefocus-companion.mjs` default `server`, and each machine's `~/.config/yefocus/companion.json` `server` |
| Shared sign-in | yeaccount `server/src/handler.ts` `extraOrigins` (non-yerik.xyz transition hosts only). App env `*_ACCOUNT_URL` / `*_SHARED_ROOT` (defaults `https://account.yerik.xyz` / `yerik.xyz`) |
| OAuth consoles | Google Cloud Console (Yecalendar Google Calendar: `<PUBLIC_URL>/api/google/callback`; Yetracker Google sign-in when enabled: `<PUBLIC_URL>/api/auth/callback`). Add the new URI before switching, and remove the old one later |
| Docs | this file, the app README "Domain" section, app DEPLOY/RELEASE docs, `YE_APPS` + `docs/apps.md` |

## Roll back

Nothing in the move deletes anything, so each step can be undone on its own:
- **Undo a B1 redirect** (immediate, no deploy):
  `curl -s -X PATCH -H "$VH" -H 'content-type: application/json' "https://api.vercel.com/v9/projects/$P/domains/$P.vercel.app?$T" -d '{"redirect":null,"redirectStatusCode":null}'`
  Browsers cache 308s, so a user who already followed it may need to clear the cache or open the new address directly. That's another reason to keep the target serving.
- **Undo a B2 redirect:** revert the `vercel.json` commit and redeploy, or promote the previous production deployment (`vercel rollback <deployment-url> --scope helloyeriks-projects`).
- **Undo a new subdomain:** set the app back to the old host first (env, `YE_APPS`). Then leave the record in place, or remove the Vercel domain and Cloudflare record only after the owner OKs it explicitly. We never delete domains or DNS records as part of a migration.
- **Wrong CNAME target:** PATCH the record content back (`PATCH /zones/$ZONE/dns_records/<id>`). Keep `proxied: false`.

## Pending (23 Oct 2026)

- **Yecalendar: yecalendar.vercel.app is not redirected.** Installed APKs fetch OTA bundles from `https://yecalendar.vercel.app/bundle/manifest.json` and then `/index.html` and `/assets/*` (via `HttpURLConnection`, 200 required). They also call `/api/*` cross-origin with a bearer token, so a preflight would hit the redirect. A whole-host redirect would break both. To finish: add the B2 `vercel.json` redirect (host `yecalendar.vercel.app` → `calendar.yerik.xyz`) when no other branch is touching yecalendar, then deploy. Check `YECALENDAR_PUBLIC_URL` and the Google OAuth redirect URI (`<PUBLIC_URL>/api/google/callback`) in Google Cloud Console first. In a later APK, move `BUNDLE_URL` and `YECALENDAR_API_URL` to `https://calendar.yerik.xyz`. Keep `docs/RELEASE.md` verifying both hosts until then.
- **Yejournal: yejournal.vercel.app is not redirected.** The app is local-first (IndexedDB) and sign-in only works on `*.yerik.xyz`, so anything written on the vercel.app host lives only in that browser origin. Open https://yejournal.vercel.app in each browser you used and move any entries over by hand. Then apply B1 (no exclusions needed: no native client, no OAuth).
- **Yefocus:** merge and deploy the yefocus PR (same-origin API on focus.yerik.xyz, B2 redirect, companion default `https://focus.yerik.xyz`). Then set `YEFOCUS_PUBLIC_URL=https://focus.yerik.xyz` in Vercel and redeploy. Update `server` in `~/.config/yefocus/companion.json` on each Mac/ThinkPad. Keep yefocus.vercel.app serving `/api/*` and the OTA files until a new APK uses focus.yerik.xyz.
- **Yeaccount:** `https://hexpo.vercel.app` in `extraOrigins` is dead now that hexpo redirects. Remove it in a later code change (harmless meanwhile).
