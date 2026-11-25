"use client";

import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";

type TurnstileOptions = {
  sitekey: string;
  theme: "dark";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

type TurnstileAPI = {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function ContactForm() {
  const widgetContainer = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!scriptReady || !siteKey || !widgetContainer.current || !window.turnstile) {
      return;
    }

    try {
      widgetId.current = window.turnstile.render(widgetContainer.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (value) => {
          setToken(value);
          setErrorMessage("");
        },
        "expired-callback": () => {
          setToken(null);
          setErrorMessage("The verification expired. Please complete it again.");
        },
        "error-callback": () => {
          setToken(null);
          setErrorMessage(
            "Turnstile could not verify this domain. Please try again later.",
          );
        },
      });
    } catch (error) {
      console.error("Could not render the Turnstile widget.", error);
      window.setTimeout(() => {
        setErrorMessage("Turnstile could not load. Please try again.");
      }, 0);
    }

    return () => {
      if (widgetId.current) {
        window.turnstile?.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [scriptReady]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("Please complete the Turnstile verification.");
      return;
    }

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, email, message }),
      });
      const result: unknown = await response.json();

      if (!isRecord(result)) {
        throw new Error("The contact verification returned an invalid response.");
      }

      if (!response.ok || result.success !== true) {
        setErrorMessage(
          typeof result.error === "string"
            ? result.error
            : "Could not send your message. Please try again.",
        );
        setToken(null);
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
        return;
      }

      setSuccessMessage("Your message has been sent.");
      formElement.reset();
      setToken(null);
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    } catch (error) {
      console.error("Could not submit the contact form.", error);
      setErrorMessage("Could not send your message. Please try again or email me directly.");
      setToken(null);
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {siteKey && (
        <Script
          onError={(error) => {
            console.error("Could not load the Turnstile script.", error);
            setErrorMessage("Turnstile could not load. Please try again later.");
          }}
          onReady={() => setScriptReady(true)}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
      )}
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input autoComplete="name" maxLength={80} name="name" required />
        </label>
        <label>
          Email
          <input
            autoComplete="email"
            maxLength={254}
            name="email"
            required
            type="email"
          />
        </label>
        <label>
          Message
          <textarea maxLength={4000} name="message" required rows={6} />
        </label>
        {siteKey ? (
          <div className="turnstile-widget" ref={widgetContainer} />
        ) : (
          <p className="form-message form-error">
            Turnstile is not configured. Please try again later.
          </p>
        )}
        {errorMessage && (
          <p className="form-message form-error" role="alert">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="form-message form-success" role="status">
            {successMessage}
          </p>
        )}
        <button className="contact-submit" disabled={submitting || !token} type="submit">
          {submitting ? "Verifying…" : "Send message"}
        </button>
      </form>
    </>
  );
}
