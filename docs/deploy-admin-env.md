# Admin password — where to set it

The app reads **`ADMIN_PASSWORD`** only from the environment. It is **not** stored in the repo.

Use the **same value** everywhere you want admin login and the handbook **beta menu unlock** to work.

## Local

`.env` (gitignored):

```bash
ADMIN_PASSWORD=your-secret-here
```

Restart `npm run dev` after changing it.

## Azure App Service (trib-dev, Hive-staging, production)

For **each** web app:

1. Azure Portal → your **App Service** → **Configuration** → **Application settings**
2. **New application setting**: name `ADMIN_PASSWORD`, value your password
3. **Save**, then **Restart** the app

Deploy workflows only upload the build artifact; **runtime** still uses whatever is configured on the app in Azure. You must set `ADMIN_PASSWORD` in the portal (or via Azure CLI / ARM) for the live site to accept logins.

## Vercel

Project → **Settings** → **Environment Variables**:

- Name: `ADMIN_PASSWORD`
- Value: your password
- Environments: enable **Production**, **Preview**, and **Development** if you want it on all Vercel URLs

Redeploy after saving.

## GitHub Actions (CI build)

Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

- Name: `ADMIN_PASSWORD`

The deploy workflows (`.github/workflows/develop_trib-dev.yml` and `main_hive-staging.yml`) pass this into `npm run build` so the build environment matches production where needed.

If the secret is missing, the build can still succeed; admin will only work at **runtime** where Azure/Vercel has `ADMIN_PASSWORD` set.

## Optional

- **`ADMIN_SESSION_SECRET`**: long random string; if set, used to sign the admin session cookie instead of reusing `ADMIN_PASSWORD`.
