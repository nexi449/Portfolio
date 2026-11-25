"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import IconLink from "./icon-link";

const pageNames: Record<string, string> = {
  "/about": "About",
  "/activity": "Activity",
  "/contact": "Contact",
  "/games": "Games",
  "/work": "Modrinth",
  "/curseforge": "CurseForge",
};

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentPage = pageNames[pathname];

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="site-header" data-menu-open={menuOpen}>
      <button
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        className="menu-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        <span />
        <span />
      </button>
      <div
        aria-hidden={menuOpen}
        className="site-breadcrumb"
        data-hide-on-menu={menuOpen}
      >
        <Link
          aria-label="Home"
          className="site-brand"
          href="/"
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? -1 : 0}
        >
          nexi499
        </Link>
        {currentPage && (
          <>
            <span aria-hidden="true" className="breadcrumb-separator">/</span>
            <span aria-current="page" className="breadcrumb-current">{currentPage}</span>
          </>
        )}
      </div>
      <div
        aria-hidden={!menuOpen}
        className="menu-overlay"
        data-open={menuOpen}
        id="site-menu"
      >
        <nav aria-label="Main navigation" className="menu-links">
          <Link
            aria-current={pathname === "/" ? "page" : undefined}
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            aria-current={pathname === "/about" ? "page" : undefined}
            href="/about"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            aria-current={pathname === "/games" ? "page" : undefined}
            href="/games"
            onClick={() => setMenuOpen(false)}
          >
            Games
          </Link>
          <Link
            aria-current={pathname === "/activity" ? "page" : undefined}
            href="/activity"
            onClick={() => setMenuOpen(false)}
          >
            Activity
          </Link>
          <Link
            aria-current={pathname === "/contact" ? "page" : undefined}
            href="/contact"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
        </nav>
        <section aria-labelledby="menu-projects-title" className="menu-projects">
          <h2 className="menu-section-title" id="menu-projects-title">Projects</h2>
          <Link
            aria-current={pathname === "/work" ? "page" : undefined}
            className="menu-project-link"
            href="/work"
            onClick={() => setMenuOpen(false)}
          >
            Modrinth
          </Link>
          <Link
            aria-current={pathname === "/curseforge" ? "page" : undefined}
            className="menu-project-link"
            href="/curseforge"
            onClick={() => setMenuOpen(false)}
          >
            CurseForge
          </Link>
        </section>
        <nav aria-label="Social links" className="menu-socials">
          <IconLink brand="github" href="https://github.com/nexi449" label="GitHub" />
          <IconLink brand="modrinth" href="https://modrinth.com/user/nexi499" label="Modrinth" />
          <IconLink
            brand="curseforge"
            href="https://www.curseforge.com/members/nexi499/projects"
            label="CurseForge"
          />
          <IconLink brand="youtube" href="https://www.youtube.com/@nexi499" label="YouTube" />
          <IconLink
            brand="discord"
            href="https://discord.com/users/1215763220875448342"
            label="Discord"
          />
          <IconLink brand="outlook" href="mailto:nexi499@outlook.com" label="Outlook email" />
        </nav>
      </div>
    </header>
  );
}
