import type { Metadata } from "next";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
};

export default function Contact() {
  return (
    <main className="site-main">
      <article className="home-content">
        <header className="hero stagger">
          <h1>Contact</h1>
          <p className="hero-statement">Send me a short message.</p>
        </header>
        <section aria-label="Contact form" className="content-section stagger">
          <ContactForm />
          <p className="contact-fallback">
            Or email me directly at{" "}
            <a href="mailto:nexi499@outlook.com">nexi499@outlook.com</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
