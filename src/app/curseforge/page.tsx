import type { Metadata } from "next";
import IconLink from "../icon-link";

export const metadata: Metadata = {
  title: "CurseForge",
};

const projects = [
  {
    name: "Tools & Trims",
    description: "Apply all 18 vanilla armor trim patterns to your tools.",
    curseforge: "https://www.curseforge.com/minecraft/mc-mods/tools-trims",
    github: "https://github.com/nexi449/ToolsAndTrims",
  },
  {
    name: "Early Display",
    description: "An early loading display for Fabric.",
    curseforge: "https://www.curseforge.com/minecraft/mc-mods/early-display",
    github: "https://github.com/nexi449/Early-Display",
  },
  {
    name: "ArmorVisibility",
    description: "Hide armor without losing protection or enchantments.",
    curseforge: "https://www.curseforge.com/minecraft/mc-mods/armorvisibility",
    github: "https://github.com/nexi449/Armor-Visibility",
  },
];

export default function CurseForge() {
  return (
    <main className="site-main">
      <article className="home-content">
        <header className="hero stagger">
          <h1>CurseForge</h1>
          <p className="hero-statement">Minecraft mods and open-source work.</p>
        </header>
        <section aria-label="CurseForge projects" className="content-section stagger">
          <ul className="project-list">
            {projects.map((project) => (
              <li className="project-row" key={project.name}>
                <div className="project-info">
                  <h2>{project.name}</h2>
                  <p>{project.description}</p>
                </div>
                <div
                  aria-label={`${project.name} links`}
                  className="project-actions"
                >
                  <IconLink
                    brand="curseforge"
                    href={project.curseforge}
                    label={`${project.name} on CurseForge`}
                  />
                  <IconLink
                    brand="github"
                    href={project.github}
                    label={`${project.name} source on GitHub`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
