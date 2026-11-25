import type { Metadata } from "next";
import GamesGrid from "./games-grid";

export const metadata: Metadata = {
  title: "Games",
};

export default function Games() {
  return (
    <main className="site-main">
      <article className="home-content">
        <header className="hero stagger">
          <h1>Games</h1>
          <p className="hero-statement">My Steam library.</p>
        </header>
        <section aria-label="Steam games" className="content-section stagger">
          <GamesGrid />
        </section>
      </article>
    </main>
  );
}
