"use client";

import { useEffect, useState } from "react";
import IconLink from "../icon-link";

type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  observedAt: number;
  startedAt: number | null;
  endsAt: number | null;
};

type ConnectionState = "connecting" | "live" | "reconnecting" | "error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTrack(presence: unknown): Track | null {
  if (!isRecord(presence) || presence.listening_to_spotify !== true) return null;
  if (!isRecord(presence.spotify)) return null;

  const spotify = presence.spotify;
  const timestamps = isRecord(spotify.timestamps) ? spotify.timestamps : null;
  const startedAt =
    typeof timestamps?.start === "number" && Number.isFinite(timestamps.start)
      ? timestamps.start
      : null;
  const endsAt =
    typeof timestamps?.end === "number" && Number.isFinite(timestamps.end)
      ? timestamps.end
      : null;

  if (
    typeof spotify.track_id !== "string" ||
    !/^[a-zA-Z0-9]{22}$/.test(spotify.track_id) ||
    typeof spotify.song !== "string" ||
    typeof spotify.artist !== "string" ||
    !spotify.song.trim() ||
    !spotify.artist.trim()
  ) {
    return null;
  }

  return {
    id: spotify.track_id,
    title: spotify.song,
    artist: spotify.artist,
    album: typeof spotify.album === "string" ? spotify.album : "",
    observedAt: Date.now(),
    startedAt: startedAt !== null && endsAt !== null && endsAt > startedAt
      ? startedAt
      : null,
    endsAt: startedAt !== null && endsAt !== null && endsAt > startedAt
      ? endsAt
      : null,
  };
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function SongProgress({
  startedAt,
  endsAt,
  now,
}: {
  startedAt: number;
  endsAt: number;
  now: number;
}) {
  const duration = endsAt - startedAt;
  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const progress = Math.min(100, Math.max(0, ((now - startedAt) / duration) * 100));

  return (
    <div className="activity-progress">
      <div
        aria-label="Song progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        aria-valuetext={`${formatDuration(elapsed)} elapsed, ${formatDuration(remaining)} remaining`}
        className="activity-progress-track"
        role="progressbar"
      >
        <span
          className="activity-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="activity-progress-time">
        -{formatDuration(remaining)}
      </span>
    </div>
  );
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(timestamp);
}

export default function ActivityFeed({ userId }: { userId: string | null }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [hasPresence, setHasPresence] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!currentTrackId) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [currentTrackId]);

  useEffect(() => {
    if (userId === null) return;
    const configuredUserId: string = userId;

    let socket: WebSocket | null = null;
    let heartbeat: number | undefined;
    let reconnectTimer: number | undefined;
    let startTimer: number | undefined;
    let retryDelay = 1000;
    let stopped = false;

    function clearHeartbeat() {
      if (heartbeat !== undefined) {
        window.clearInterval(heartbeat);
        heartbeat = undefined;
      }
    }

    function scheduleReconnect() {
      if (stopped || reconnectTimer !== undefined) return;

      setConnection("reconnecting");
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = undefined;
        connect();
      }, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000);
    }

    function receivePresence(value: unknown) {
      if (!isRecord(value)) return;

      let presence: unknown = value;
      if (
        value.t === "INIT_STATE" &&
        isRecord(value.d) &&
        configuredUserId in value.d
      ) {
        presence = value.d[configuredUserId];
      } else {
        presence = value.d;
      }

      if (!isRecord(presence)) return;

      setHasPresence(true);
      const track = parseTrack(presence);
      setCurrentTrackId(track?.id ?? null);

      if (track) {
        setNow(Date.now());
        setTracks((previous) => {
          if (previous[0]?.id === track.id) return previous;
          return [track, ...previous.filter((item) => item.id !== track.id)].slice(
            0,
            30,
          );
        });
      }
    }

    function connect() {
      if (stopped) return;

      try {
        const connectionSocket = new WebSocket("wss://api.lanyard.rest/socket");
        socket = connectionSocket;

        connectionSocket.addEventListener("message", (event) => {
          let message: unknown;
          try {
            message = JSON.parse(String(event.data));
          } catch (error) {
            console.error("Lanyard sent invalid JSON.", error);
            return;
          }

          if (!isRecord(message)) return;

          if (message.op === 1 && isRecord(message.d)) {
            const interval = message.d.heartbeat_interval;
            if (
              typeof interval !== "number" ||
              !Number.isFinite(interval) ||
              interval <= 0
            ) {
              console.error("Lanyard sent an invalid heartbeat interval.");
              connectionSocket.close();
              return;
            }

            try {
              connectionSocket.send(
                JSON.stringify({
                  op: 2,
                  d: { subscribe_to_id: configuredUserId },
                }),
              );
            } catch (error) {
              console.error("Could not subscribe to Spotify activity.", error);
              connectionSocket.close();
              return;
            }

            clearHeartbeat();
            heartbeat = window.setInterval(() => {
              if (connectionSocket.readyState === WebSocket.OPEN) {
                connectionSocket.send(JSON.stringify({ op: 3 }));
              }
            }, interval);
            retryDelay = 1000;
            setConnection("live");
            return;
          }

          if (
            message.op === 0 &&
            (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE")
          ) {
            receivePresence(message);
          }
        });

        connectionSocket.addEventListener("error", () => {
          if (stopped) return;
          console.error("Lanyard WebSocket connection failed.");
          setConnection("error");
        });

        connectionSocket.addEventListener("close", () => {
          clearHeartbeat();
          if (socket === connectionSocket) socket = null;
          scheduleReconnect();
        });
      } catch (error) {
        console.error("Could not open the Lanyard WebSocket.", error);
        setConnection("error");
        scheduleReconnect();
      }
    }

    startTimer = window.setTimeout(() => {
      startTimer = undefined;
      connect();
    }, 0);

    return () => {
      stopped = true;
      clearHeartbeat();
      if (startTimer !== undefined) {
        window.clearTimeout(startTimer);
      }
      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [userId]);

  const statusText = !userId
    ? "Spotify activity is not configured"
    : connection === "error"
      ? "Spotify activity is temporarily unavailable"
      : connection === "reconnecting"
        ? "Reconnecting to Spotify activity…"
        : connection === "connecting"
          ? "Connecting to Spotify activity…"
          : currentTrackId
            ? "Listening now"
            : hasPresence
              ? "Nothing playing right now"
              : "Connected — waiting for activity";

  return (
    <div className="activity-feed">
      <p className="activity-status" data-state={connection} aria-live="polite">
        <span aria-hidden="true" className="activity-status-dot" />
        {statusText}
      </p>

      {tracks.length > 0 ? (
        <ol className="activity-list">
          {tracks.map((track, index) => (
            <li className="activity-item" key={`${track.id}-${track.observedAt}`}>
              <div className="activity-track">
                <span className="activity-track-title">{track.title}</span>
                <span className="activity-track-artist">{track.artist}</span>
                {track.album && (
                  <span className="activity-track-album">{track.album}</span>
                )}
                {index === 0 &&
                  currentTrackId === track.id &&
                  track.startedAt !== null &&
                  track.endsAt !== null && (
                    <SongProgress
                      endsAt={track.endsAt}
                      now={now}
                      startedAt={track.startedAt}
                    />
                  )}
              </div>
              <div className="activity-meta">
                <time dateTime={new Date(track.observedAt).toISOString()}>
                  {index === 0 && currentTrackId === track.id
                    ? "Now playing"
                    : formatTime(track.observedAt)}
                </time>
                <IconLink
                  brand="spotify"
                  href={`https://open.spotify.com/track/${track.id}`}
                  label={`${track.title} on Spotify`}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="activity-empty">
          Songs will appear here while Spotify is playing. This list records
          tracks seen while the page is open.
        </p>
      )}
    </div>
  );
}
