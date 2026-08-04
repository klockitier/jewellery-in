/**
 * Newsletter signup strip — UI only (no backend). The form validates the
 * email client-side and shows a friendly success state. A server function or
 * email provider can be attached in a later task.
 */

import { useState, type FormEvent } from "react";
import { CheckIcon, MailIcon } from "./icons";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    if (!ok) {
      setState("error");
      return;
    }
    setState("done");
  };

  return (
    <section aria-labelledby="newsletter-title" className="bg-charcoal">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-charcoal-soft px-7 py-12 text-center sm:px-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-xl">
            <MailIcon className="mx-auto h-8 w-8 text-gold" />
            <h2 id="newsletter-title" className="mt-4 text-3xl text-ivory sm:text-4xl">
              Be the first to see new designs
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ivory/60">
              New arrivals, festival previews and exclusive offers — straight to your inbox. No noise, only gold.
            </p>

            {state === "done" ? (
              <p className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-sm text-gold-bright">
                <CheckIcon className="h-4 w-4" />
                Thank you — you&rsquo;re on the list. See you in your inbox.
              </p>
            ) : (
              <form onSubmit={submit} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row" noValidate>
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (state === "error") setState("idle");
                  }}
                  placeholder="Your email address"
                  aria-invalid={state === "error"}
                  aria-describedby={state === "error" ? "newsletter-error" : undefined}
                  className="w-full rounded-full border border-ivory/20 bg-ivory/5 px-5 py-3.5 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn btn-gold shrink-0 rounded-full !px-7 !py-3.5 text-[0.7rem]"
                >
                  Subscribe
                </button>
              </form>
            )}
            {state === "error" && (
              <p id="newsletter-error" className="mt-3 text-xs tracking-wide text-gold-bright">
                Please enter a valid email address.
              </p>
            )}
            <p className="mt-4 text-[0.66rem] uppercase tracking-[0.18em] text-ivory/35">
              No spam · Unsubscribe anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
