const steamId = "76561199530979105";
const steamGamesApi =
  "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/";

type SteamGame = {
  appId: number;
  name: string;
  playtimeMinutes: number;
  recentPlaytimeMinutes: number;
  imageUrls: string[];
  storeUrl: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseGames(payload: unknown): SteamGame[] | null {
  if (
    !isRecord(payload) ||
    !isRecord(payload.response) ||
    !Array.isArray(payload.response.games)
  ) {
    return null;
  }

  const games: SteamGame[] = [];

  for (const game of payload.response.games) {
    if (
      !isRecord(game) ||
      typeof game.appid !== "number" ||
      !Number.isInteger(game.appid) ||
      game.appid <= 0 ||
      typeof game.playtime_forever !== "number" ||
      !Number.isFinite(game.playtime_forever) ||
      game.playtime_forever < 0
    ) {
      return null;
    }

    const appId = game.appid;
    games.push({
      appId,
      name:
        typeof game.name === "string" && game.name.trim()
          ? game.name
          : `Steam game ${appId}`,
      playtimeMinutes: game.playtime_forever,
      recentPlaytimeMinutes:
        typeof game.playtime_2weeks === "number" &&
        Number.isFinite(game.playtime_2weeks) &&
        game.playtime_2weeks >= 0
          ? game.playtime_2weeks
          : 0,
      imageUrls: [
        `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
      ],
      storeUrl: `https://store.steampowered.com/app/${appId}/`,
    });
  }

  return games.sort((first, second) => second.playtimeMinutes - first.playtimeMinutes);
}

function errorResponse(error: string, status: number) {
  return Response.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  const apiKey = process.env.STEAM_API_KEY?.trim();

  if (!apiKey) {
    return errorResponse(
      "Steam is not configured. Add STEAM_API_KEY to .env.local and restart the server.",
      503,
    );
  }

  const url = new URL(steamGamesApi);
  url.search = new URLSearchParams({
    key: apiKey,
    steamid: steamId,
    include_appinfo: "true",
    include_played_free_games: "true",
  }).toString();

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return errorResponse("Could not connect to Steam. Please try again later.", 502);
  }

  if (!response.ok) {
    return errorResponse(
      `Steam API returned HTTP ${response.status}. Check the API key and make sure Game details are public.`,
      502,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return errorResponse("Steam returned an invalid response.", 502);
  }

  const games = parseGames(payload);
  if (!games) {
    return errorResponse("Steam returned an invalid game list.", 502);
  }

  return Response.json(
    { games },
    { headers: { "Cache-Control": "no-store" } },
  );
}
