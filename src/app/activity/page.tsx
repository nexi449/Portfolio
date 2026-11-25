import Image from "next/image";
import type { Metadata } from "next";
import ActivityFeed from "./activity-feed";

export const metadata: Metadata = {
  title: "Activity",
};

const favoriteArtists = [
  {
    id: "79o8RrDrzNbPk6YE4qRxuT",
    image:
      "https://i.scdn.co/image/ab6761610000e5eb93d0ba8c730ad2a6f79ba347",
  },
  {
    id: "66RYRcCpcfJqF3TwqCbUce",
    image:
      "https://i.scdn.co/image/ab6761610000e5eb44e40a8d8e2a57e0b488ce2d",
  },
  {
    id: "6vGaHA8T5QW5QAkvHHBTmC",
    image:
      "https://i.scdn.co/image/ab6761610000e5ebe1b0723042c4da8044b932b8",
  },
  {
    id: "1SF4jakSq8kI38MYjFdaJG",
    image:
      "https://i.scdn.co/image/ab6761610000e5ebf898fb8510da1c57bc2f2baf",
  },
  {
    id: "0iaqFAg9eczKirsmESekkp",
    image:
      "https://i.scdn.co/image/ab6761610000e5eb04bd9bde1d72c176693172c0",
  },
];

export default function Activity() {
  const lanyardUserId = process.env.LANYARD_USER_ID;

  return (
    <main className="site-main">
      <article className="home-content activity-content">
        <header className="hero stagger">
          <h1>Activity</h1>
          <p className="hero-statement">Songs I&apos;ve been listening to.</p>
          <ul aria-label="Favorite artists" className="favorite-artists">
            {favoriteArtists.map((artist, index) => (
              <li key={artist.id}>
                <a
                  aria-label={`Favorite artist ${index + 1} on Spotify`}
                  href={`https://open.spotify.com/artist/${artist.id}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Image
                    alt=""
                    height={52}
                    sizes="(max-width: 560px) 44px, 52px"
                    src={artist.image}
                    width={52}
                  />
                </a>
              </li>
            ))}
          </ul>
        </header>
        <section aria-label="Spotify listening activity" className="content-section stagger">
          <h2>Spotify</h2>
          <ActivityFeed userId={lanyardUserId ?? null} />
        </section>
      </article>
    </main>
  );
}
