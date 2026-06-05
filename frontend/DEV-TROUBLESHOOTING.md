# Dev troubleshooting — Repair POS frontend

## Internal Server Error on refresh (ENOENT)

### Symptom

- Browser shows **Internal Server Error** after you refresh a page that loaded fine moments earlier.
- Terminal shows errors like:

```text
ENOENT: ...\.next\server\app\(dashboard)\repairs\page\app-build-manifest.json
ENOENT: ...\.next\static\development\_buildManifest.js.tmp.*
```

- Pattern: first `GET /route 200` → `✓ Compiled in XXXms` (HMR after save) → refresh returns **500** + ENOENT.

This is usually a **corrupted or inconsistent `.next` dev cache** (Turbopack + HMR on Windows), not broken page code.

### Fix (do this first)

1. Stop dev: **Ctrl+C** in the terminal running `npm run dev`.
2. Ensure only one dev server: `netstat -ano | findstr :3000` — kill extra Node PIDs if needed.
3. Delete cache:

   ```powershell
   cd D:\Pos\frontend
   Remove-Item -Recurse -Force .next
   ```

   Or use the npm script:

   ```powershell
   npm run dev:reset
   ```

4. Start **exactly one** dev server:

   ```powershell
   npm run dev
   ```

5. Re-test: open `/dashboard`, `/repairs`, `/inventory/goods-received` and refresh each several times. Terminal should show `GET ... 200` with no ENOENT.

### Do NOT

- Run `npm run build` while `npm run dev` is running — both write to `.next` and corrupt manifests.
- Run multiple `npm run dev` instances (ports 3000/3001/3002). Next may pick 3001 if 3000 is busy; stop the old process first.
- Judge production UX from a broken dev cache — use `npm run build` then `npm run start` for real timings.

### If ENOENT keeps coming back

1. **Webpack dev (no Turbopack)** — often more stable on Windows:

   ```powershell
   Remove-Item -Recurse -Force .next
   npm run dev:webpack
   ```

2. **Pin port 3000** (PowerShell):

   ```powershell
   $env:PORT='3000'; npm run dev
   ```

3. **Windows Defender / antivirus** — exclude `D:\Pos\frontend\.next` from real-time scanning (AV can delete `.tmp` manifest files mid-write).

4. **Judge real UX** with production server:

   ```powershell
   npm run build
   npm run start
   ```

### Quick port check (Windows)

```powershell
netstat -ano | findstr :3000
# Stop stray process (replace PID):
Stop-Process -Id <PID> -Force
```

### npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Turbopack dev (default) |
| `npm run dev:reset` | Delete `.next`, then Turbopack dev |
| `npm run dev:clean` | Same as `dev:reset` |
| `npm run dev:webpack` | Webpack dev (fallback if Turbopack unstable) |
