import type { Metadata } from "next";
import IconLink from "../icon-link";

export const metadata: Metadata = {
  title: "Modrinth",
};

const projects = [
  {
    name: "ArmorVisibility",
    description: "Hide armor without losing protection or enchantments.",
    modrinth: "https://modrinth.com/mod/armorvisibility",
    github: "https://github.com/nexi449/Armor-Visibility",
  },
  {
    name: "Tools & Trims",
    description: "Apply all 18 vanilla armor trim patterns to your tools.",
    modrinth: "https://modrinth.com/mod/tools-trims",
    github: "https://github.com/nexi449/ToolsAndTrims",
  },
  {
    name: "FOVC",
    description: "Set your field of view from 1 to 200.",
    modrinth: "https://modrinth.com/mod/fov-changer",
    github: "https://github.com/nexi449/FoV-Changer",
  },
  {
    name: "Early Display",
    description: "An early loading display for Fabric.",
    modrinth: "https://modrinth.com/project/early-display",
    github: "https://github.com/nexi449/Early-Display",
  },
];

export default function Work() {
  return (
    <main className="site-main">
      <article className="home-content">
        <header className="hero stagger">
          <h1>Projects</h1>
          <p className="hero-statement">Minecraft mods and open-source work.</p>
        </header>
        <section aria-label="Projects" className="content-section stagger">
          <ul className="project-list">
            {projects.map((project) => (
              <li className="project-row" key={project.name}>
                <div className="project-info">
                  <h2>{project.name}</h2>
                  <p>{project.description}</p>
                </div>
                <div aria-label={`${project.name} links`} className="project-actions">
                  <IconLink
                    brand="modrinth"
                    href={project.modrinth}
                    label={`${project.name} on Modrinth`}
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
