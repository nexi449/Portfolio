import Image from "next/image";
import Link from "next/link";
import BrandIcon from "./brand-icon";
import IconLink from "./icon-link";

const socials = [
  { brand: "github" as const, href: "https://github.com/nexi449", label: "GitHub" },
  { brand: "modrinth" as const, href: "https://modrinth.com/user/nexi499", label: "Modrinth" },
  { brand: "curseforge" as const, href: "https://www.curseforge.com/members/nexi499/projects", label: "CurseForge" },
  { brand: "youtube" as const, href: "https://www.youtube.com/@nexi499", label: "YouTube" },
  { brand: "x" as const, href: "https://x.com/nexi499", label: "X (Twitter)" },
  {
    brand: "discord" as const,
    href: "https://discord.com/users/1215763220875448342",
    label: "Discord",
  },
  { brand: "outlook" as const, href: "mailto:nexi499@outlook.com", label: "Outlook" },
];

export default function Home() {
  return (
    <main className="site-main">
      <div className="home-content">
        <section aria-labelledby="home-title" className="hero stagger">
          <Image
            alt="Nexi499's flower icon"
            className="avatar"
            height={60}
            priority
            src="/nfhgjfyjj.png"
            width={60}
          />
          <h1 id="home-title">nexi499</h1>
          <p className="hero-statement">
            I&apos;m a 17-year-old creator from Germany, making Minecraft mods
            and other projects.
          </p>
        </section>

        <nav aria-label="Social links" className="social-links stagger">
          {socials.map((social) => (
            <IconLink
              brand={social.brand}
              href={social.href}
              key={social.label}
              label={social.label}
            />
          ))}
        </nav>

        <section aria-labelledby="about-heading" className="content-section stagger">
          <h2 id="about-heading">
            <Link href="/about">
              About <span aria-hidden="true">›</span>
            </Link>
          </h2>
          <p>
            I taught myself how to code, design, and model. I enjoy gaming,
            discovering music, and making useful little things for Minecraft.
          </p>
          <p>
            I work with Java, JavaScript, TypeScript, C#, C++, Python, Rust,
            SQL, HTML, and Tailwind.
          </p>
        </section>

        <section aria-labelledby="projects-heading" className="content-section stagger">
          <h2 id="projects-heading">
            <Link href="/work">
              Projects <span aria-hidden="true">›</span>
            </Link>
          </h2>
          <Link
            aria-label="Browse my Minecraft mods on Modrinth"
            className="project-index-link"
            href="/work"
          >
            <BrandIcon brand="modrinth" size={24} />
            <span>
              <strong>Modrinth</strong>
              <small>My Minecraft mods and open-source projects</small>
            </span>
            <span aria-hidden="true" className="project-index-arrow">→</span>
          </Link>
        </section>

        <section aria-labelledby="contact-heading" className="content-section stagger">
          <h2 id="contact-heading">
            <Link href="/contact">
              Contact <span aria-hidden="true">›</span>
            </Link>
          </h2>
          <p>For collaborations, questions, or just a friendly hello.</p>
        </section>
      </div>
    </main>
  );
}
