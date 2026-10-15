# Self-hosting on the ThinkPad T470 (Omarchy/Arch)

All user data lives on the T470. Phones and laptops reach it over **Tailscale** (MagicDNS name `t470`, TLS name `t470.<tailnet>.ts.net`).
Host provisioning, systemd units and backups: **/workspace/yehost** (reuse it; do not fork):
- `units/yephotos.service` (127.0.0.1:8790, hardening, `YEPHOTOS_HOSTS=t470.TAILNET.ts.net`), `yephotos-jobs.slice`
- `yehost-backup.{service,timer}` → `scripts/yehost-backup.sh` (sqlite `.backup` + restic, prune Sundays, `check` 1%), `yehost-restore-test.timer`, `yehost-health.timer`
- `syncthing@.service`, `config/btrbk.conf`, TLP/logind/journald tuning; `scripts/yehost` status (includes tailscale)

Contract for every ye-app so it can be self-hosted:
1. **Server URL is configuration, never code.** Server: `--addr` / env (`*_ADDR`, default `127.0.0.1:<port>`), exposed through `tailscale serve`. Client APK: setup screen + build default `-PyeServer=http://t470:<port>` (WebView template). Web UI uses relative `/api` only.
2. **Ports:** yephotos 8790. yeplayer gets a fixed port when it moves off the Mac (TBD in its migration).
3. **systemd unit per app** following `yehost/units/yephotos.service`: dedicated user, `ProtectSystem=strict`, data under `/srv/ye/<app>`, a `Slice` for heavy jobs.
4. **Backups:** add the app's data path and DB snapshot to `yehost-backup.sh`, and a restore case to `yehost-restore-test.sh`.
5. **Host check:** each server rejects unknown `Host` headers (DNS rebinding) and allows only the tailnet name.
6. Native apps (yereader, yetube) keep data on the phone for now. Their JSON/zip exports can go to `/srv/ye/exports` via Syncthing.
