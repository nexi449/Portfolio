import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

const tools = [
  { name: "Java", image: "java" },
  { name: "JavaScript", image: "javascript" },
  { name: "TypeScript", image: "typescript" },
  { name: "HTML5", image: "html5" },
  { name: "CSS3", image: "css3" },
  { name: "C#", image: "csharp" },
  { name: "C++", image: "cplusplus" },
  { name: "C", image: "c" },
  { name: "Python", image: "python" },
  { name: "Go", image: "go" },
  { name: "Kotlin", image: "kotlin" },
  { name: "Rust", image: "rust" },
  { name: "Bash", image: "bash" },
  { name: "Next.js", image: "nextjs" },
  { name: "React", image: "react" },
  { name: "Node.js", image: "nodejs" },
  { name: "Tailwind CSS", image: "tailwind" },
  { name: "Java", image: "java" },
  { name: "Gradle", image: "gradle" },
  { name: "IntelliJ IDEA", image: "intellij" },
  { name: "Visual Studio Code", image: "vscode" },
  { name: "Cloudflare", image: "cloudflare" },
  { name: "Nginx", image: "nginx" },
  { name: "Linux", image: "linux" },
  { name: "PostgreSQL", image: "postgresql" },
  { name: "Redis", image: "redis" },
  { name: "Docker", image: "docker" },
  { name: "Git", image: "git" },
  { name: "GitHub", image: "github" },
  { name: "Visual Studio Code", image: "vscode" },
  { name: "Docker", image: "docker" },
  { name: "IntelliJ IDEA", image: "intellij" },
];

export default function About() {
  return (
    <main className="site-main">
      <article className="home-content">
        <header className="hero stagger">
          <h1>About me</h1>
          <p className="hero-statement">
            I&apos;m a 17-year-old creator from Germany who loves coding.
          </p>
        </header>
        <section className="content-section stagger">
          <h2>Who am I?</h2>
          <p>
            I started coding about a year and a half ago and taught myself.
            I&apos;m self-taught in design and modeling, too.
          </p>
        </section>
        <section className="content-section stagger">
          <h2>Beyond the code</h2>
          <p>
            I enjoy exploring different games, taking on new challenges, and
            playing with friends. Music is part of my everyday life, and I
            love finding new artists and genres.
          </p>
        </section>
        <section className="content-section stagger">
          <h2>My toolbox</h2>
          <ul aria-label="Technologies I use" className="toolbox-logos">
            {tools.map((tool, index) => (
              <li
                key={`${tool.image}-${index}`}
                data-tool={tool.image}
                title={tool.name}
              >
                <Image
                  alt={tool.name}
                  height={40}
                  src={`/tech-logos/${tool.image}.svg`}
                  unoptimized
                  width={40}
                />
              </li>
            ))}
          </ul>
        </section>
        <section className="content-section stagger">
          <h2>Get in touch</h2>
          <p>
            <Link href="/contact">Open the contact form</Link>.
          </p>
        </section>
      </article>
    </main>
  );
}
