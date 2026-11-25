"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
            "https://media.steampowered.com/steamcommunity/public/images/apps/",
          )),
    ) &&
    typeof value.storeUrl === "string"
  );
}

function isGamesResponse(value: unknown): value is { games: SteamGame[] } {
  return isRecord(value) && Array.isArray(value.games) && value.games.every(isSteamGame);
}

function formatPlaytime(minutes: number) {
  return `${(minutes / 60).toFixed(1)} hours`;
}

function GameCard({ game }: { game: SteamGame }) {
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <a
      aria-describedby={`game-tooltip-${game.appId}`}
      aria-label={`${game.name}, ${formatPlaytime(game.playtimeMinutes)} played, ${formatPlaytime(game.recentPlaytimeMinutes)} in the last two weeks`}
      className="game-card"
      href={game.storeUrl}
      rel="noreferrer"
      target="_blank"
    >
      <Image
        alt=""
        height={48}
        onError={() => {
          setImageIndex((index) =>
            Math.min(index + 1, game.imageUrls.length - 1),
          );
        }}
        src={game.imageUrls[imageIndex]}
        unoptimized
        width={48}
      />
      <span
        className="game-tooltip"
        id={`game-tooltip-${game.appId}`}
        role="tooltip"
      >
        <strong>{game.name}</strong>
        <span>Total playtime: {formatPlaytime(game.playtimeMinutes)}</span>
        <span>Last 2 weeks: {formatPlaytime(game.recentPlaytimeMinutes)}</span>
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
