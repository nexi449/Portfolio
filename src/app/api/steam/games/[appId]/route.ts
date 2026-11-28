function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control":
        status === 200
          ? "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800"
          : "no-store",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ appId: string }> },
) {
  const { appId: rawAppId } = await params;
  if (!/^\d{1,10}$/.test(rawAppId)) {
    return jsonResponse({ error: "A valid Steam app ID is required." }, 400);
  }

  const appId = Number(rawAppId);
  const storeUrl = new URL("https://store.steampowered.com/api/appdetails");
  storeUrl.search = new URLSearchParams({
    appids: String(appId),
    l: "en",
  }).toString();

  let response: Response;
  try {
    response = await fetch(storeUrl, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    console.error("Could not fetch Steam store details.", error);
    return jsonResponse({ error: "Steam game details are temporarily unavailable." }, 502);
  }

  if (!response.ok) {
    console.error(`Steam store details returned HTTP ${response.status}.`);
    return jsonResponse({ error: "Steam game details are temporarily unavailable." }, 502);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error("Steam store details returned invalid JSON.", error);
    return jsonResponse({ error: "Steam returned invalid game details." }, 502);
  }

  if (!isRecord(payload)) {
    return jsonResponse({ error: "Steam returned invalid game details." }, 502);
  }

  const appDetails = payload[String(appId)];
  if (!isRecord(appDetails) || appDetails.success !== true || !isRecord(appDetails.data)) {
    return jsonResponse({ error: "Steam has no store details for this game." }, 404);
  }

  const data = appDetails.data;
  const releaseDate =
    isRecord(data.release_date) &&
    typeof data.release_date.date === "string" &&
    data.release_date.date.trim()
      ? data.release_date.date
      : null;
  const genres = Array.isArray(data.genres)
    ? data.genres.flatMap((genre) =>
        isRecord(genre) &&
        typeof genre.description === "string" &&
        genre.description.trim()
          ? [genre.description]
          : [],
      )
    : [];
  const metacriticScore =
    isRecord(data.metacritic) &&
    typeof data.metacritic.score === "number" &&
    Number.isFinite(data.metacritic.score)
      ? data.metacritic.score
      : null;

  return jsonResponse(
    {
      developers: stringList(data.developers),
      publishers: stringList(data.publishers),
      genres,
      releaseDate,
      metacriticScore,
    },
    200,
  );
}
