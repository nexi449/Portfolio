"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type SteamGame = {
  appId: number;
  name: string;
  playtimeMinutes: number;
  recentPlaytimeMinutes: number;
  imageUrls: string[];
  storeUrl: string;
};

type GamesState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; games: SteamGame[] };

type GameDetails = {
  developers: string[];
  publishers: string[];
  genres: string[];
  releaseDate: string | null;
  metacriticScore: number | null;
};

type GameDetailsState =
  | { status: "idle" | "loading" | "error" }
  | { status: "loaded"; details: GameDetails };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSteamGame(value: unknown): value is SteamGame {
  return (
    isRecord(value) &&
    typeof value.appId === "number" &&
    Number.isInteger(value.appId) &&
    typeof value.name === "string" &&
    typeof value.playtimeMinutes === "number" &&
    Number.isFinite(value.playtimeMinutes) &&
    typeof value.recentPlaytimeMinutes === "number" &&
    Number.isFinite(value.recentPlaytimeMinutes) &&
    Array.isArray(value.imageUrls) &&
    value.imageUrls.length > 0 &&
    value.imageUrls.every(
      (url: unknown) =>
        typeof url === "string" &&
        (url.startsWith("https://cdn.cloudflare.steamstatic.com/steam/apps/") ||
          url.startsWith(
            "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/",
          ) ||
          url.startsWith(
            "https://media.steampowered.com/steamcommunity/public/images/apps/",
          )),
    ) &&
    typeof value.storeUrl === "string"
  );
}

function isGamesResponse(value: unknown): value is { games: SteamGame[] } {
  return isRecord(value) && Array.isArray(value.games) && value.games.every(isSteamGame);
}

function isGameDetails(value: unknown): value is GameDetails {
  return (
    isRecord(value) &&
    Array.isArray(value.developers) &&
    value.developers.every((item) => typeof item === "string") &&
    Array.isArray(value.publishers) &&
    value.publishers.every((item) => typeof item === "string") &&
    Array.isArray(value.genres) &&
    value.genres.every((item) => typeof item === "string") &&
    (typeof value.releaseDate === "string" || value.releaseDate === null) &&
    (typeof value.metacriticScore === "number" ||
      value.metacriticScore === null)
  );
}

function formatPlaytime(minutes: number) {
  return `${(minutes / 60).toFixed(1)} hours`;
}

function GameCard({ game }: { game: SteamGame }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [detailsState, setDetailsState] = useState<GameDetailsState>({
    status: "idle",
  });
  const detailsRequestStarted = useRef(false);
  const monogram = game.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const details =
    detailsState.status === "loaded" ? detailsState.details : null;
  const publisherOnly =
    details?.publishers.filter(
      (publisher) => !details.developers.includes(publisher),
    ) ?? [];
  const credits = [
    ...(details?.developers.length
      ? [`Developer: ${details.developers.join(", ")}`]
      : []),
    ...(publisherOnly.length
      ? [`Publisher: ${publisherOnly.join(", ")}`]
      : []),
  ].join(" · ");

  async function loadDetails() {
    if (detailsRequestStarted.current) return;
    detailsRequestStarted.current = true;
    setDetailsState({ status: "loading" });

    try {
      const response = await fetch(`/api/steam/games/${game.appId}`);
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error("Steam returned an invalid game details response.");
      }

      if (!response.ok || !isGameDetails(payload)) {
        throw new Error(
          isRecord(payload) && typeof payload.error === "string"
            ? payload.error
            : `Could not load game details (HTTP ${response.status}).`,
        );
      }

      setDetailsState({ status: "loaded", details: payload });
    } catch (error) {
      console.error(`Could not load Steam details for app ${game.appId}.`, error);
      setDetailsState({ status: "error" });
    }
  }

  return (
    <a
      aria-describedby={`game-tooltip-${game.appId}`}
      aria-label={`${game.name}, ${formatPlaytime(game.playtimeMinutes)} played, ${formatPlaytime(game.recentPlaytimeMinutes)} in the last two weeks`}
      className="game-card"
      href={game.storeUrl}
      onFocus={() => void loadDetails()}
      onMouseEnter={() => void loadDetails()}
      rel="noreferrer"
      target="_blank"
    >
      {imageFailed ? (
        <span aria-hidden="true" className="game-card-fallback">
          {monogram}
        </span>
      ) : (
        <Image
          alt=""
          height={120}
          onError={() => setImageFailed(true)}
          src={game.imageUrls[0]}
          unoptimized
          width={80}
        />
      )}
      <span
        className="game-tooltip"
        id={`game-tooltip-${game.appId}`}
        role="tooltip"
      >
        <strong>{game.name}</strong>
        {detailsState.status === "loading" && <span>Loading game details…</span>}
        {detailsState.status === "error" && (
          <span>Extra game details are temporarily unavailable.</span>
        )}
        {details && (
          <>
            {details.genres.length > 0 && (
              <span>{details.genres.join(" · ")}</span>
            )}
            {credits && <span>{credits}</span>}
            {(details.releaseDate || details.metacriticScore !== null) && (
              <span>
                {details.releaseDate && `Released ${details.releaseDate}`}
                {details.releaseDate && details.metacriticScore !== null && " · "}
                {details.metacriticScore !== null &&
                  `Metacritic ${details.metacriticScore}/100`}
              </span>
            )}
          </>
        )}
        <span>
          {formatPlaytime(game.playtimeMinutes)} total ·{" "}
          {formatPlaytime(game.recentPlaytimeMinutes)} recent
        </span>
      </span>
    </a>
  );
}

export default function GamesGrid() {
  const [state, setState] = useState<GamesState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function loadGames() {
      try {
        const response = await fetch("/api/steam/games", { cache: "no-store" });
        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          if (active) {
            setState({
              status: "error",
              message: "The Steam games service returned an invalid response.",
            });
          }
          return;
        }

        if (!response.ok) {
          const message =
            isRecord(payload) && typeof payload.error === "string"
              ? payload.error
              : `Could not load Steam games (HTTP ${response.status}).`;
          if (active) setState({ status: "error", message });
          return;
        }

        if (!isGamesResponse(payload)) {
          if (active) {
            setState({
              status: "error",
              message: "The Steam games service returned an invalid game list.",
            });
          }
          return;
        }

        if (active) setState({ status: "loaded", games: payload.games });
      } catch (error) {
        if (!(error instanceof TypeError)) throw error;
        if (active) {
          setState({
            status: "error",
            message: "Could not connect to the Steam games service.",
          });
        }
      }
    }

    void loadGames();
    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return <p className="games-message" role="status">Loading Steam games...</p>;
  }

  if (state.status === "error") {
    return <p className="games-message" role="alert">{state.message}</p>;
  }

  if (state.games.length === 0) {
    return (
      <p className="games-message" role="status">
        No games were returned. Make sure your Steam Game details are public.
      </p>
    );
  }

  return (
    <ul aria-label="Steam games" className="games-grid">
      {state.games.map((game) => (
        <li key={game.appId}>
          <GameCard game={game} />
        </li>
      ))}
    </ul>
  );
}
