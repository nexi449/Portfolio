# Personal Portfolio

This is my personal portfolio, built with Next.js, React, and TypeScript. I’m sharing the source so you can use it for your own website.

If you use it, please keep a visible, clickable credit to me on your website. Replace my text, project details, links, user IDs, and images with your own to make it yours.

## Features

- Responsive portfolio pages and navigation
- Project links with platform icons
- Live Spotify activity through Lanyard
- Steam library with game icons and playtime details
- Contact form protected by Cloudflare Turnstile and delivered to a Discord webhook

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
# macOS / Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

Fill in the values described below, then start the development server on port 4000:

```bash
npm run dev -- --port 4000
```

Open [http://localhost:4000](http://localhost:4000).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key used by the browser widget. |
| `TURNSTILE_SECRET_KEY` | Turnstile verification secret. Keep this server-side; never add a `NEXT_PUBLIC_` prefix. |
| `TURNSTILE_EXPECTED_HOSTNAME` | Hostname configured for the Turnstile widget, such as `localhost` or your deployed domain. |
| `DISCORD_CONTACT_WEBHOOK_URL` | Private Discord webhook URL used by the contact API. Never expose or commit it. |
| `LANYARD_USER_ID` | Discord user ID whose Spotify activity is displayed. This ID is passed to the browser and is not a secret. |
| `STEAM_API_KEY` | Private Steam Web API key used server-side to load the public game library. Never expose or commit it. |

Add these variables to `.env.local` for local development and to your hosting provider's environment settings for deployment. Make sure the Turnstile widget allows the hostname you are testing on.

The Games page requires a Steam Web API key from [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey). Set your Steam profile's Game details privacy to Public so the API can return the library.

`.env.local` is ignored by Git. Do not commit real keys, webhook URLs, or other secrets.

## Checks and production

Run the available checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

After building, start the production server on port 4000:

```bash
npm run start -- --port 4000
```

## Attribution

If you reuse this project, please add a visible, clickable credit to me on your deployed page, linking back to the repository you obtained this code from. A footer link is a good place for it.

The MIT license below governs the code and requires preservation of its copyright and license notice when redistributing copies. It does not itself require an on-page credit link; the visible credit is my request.

Third-party logos, platform marks, and artist images may have separate rights and are not relicensed by this repository's MIT license.

## License

The code in this project is available under the [MIT License](./LICENSE).
