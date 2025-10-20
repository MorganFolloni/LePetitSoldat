import { useState } from "react";
import emailjs from "@emailjs/browser";
import "./ContactPage.css";

type Status = "idle" | "loading" | "ok" | "ko";

export default function ContactPage(): JSX.Element {
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formEl = e.currentTarget;
        const fd = new FormData(formEl);
        const data = Object.fromEntries(fd) as Record<string, string>;

        // Honeypot anti-bot (champ caché)
        if (data.website) return;

        try {
            setStatus("loading");
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE!,
                import.meta.env.VITE_EMAILJS_TEMPLATE!,
                {
                    // variables utilisées dans ton template EmailJS
                    name: data.name,
                    email: data.email,     // mets {{email}} en "Reply-To" dans EmailJS
                    message: data.message,
                    // Variante possible : destinataire dynamique
                    // to_email: "le-follo@hotmail.com",
                }
            );
            setStatus("ok");
            formEl.reset();
        } catch (err: any) {
            setStatus("ko");
            setError(err?.text || err?.message || "Erreur d’envoi");
        }
    }

    return (
        <section className="contact">
            <div className="contact-form">
            <div className="title">
            <h2>Contact</h2>
            <p>Une question sur notre collection ?</p>
            </div>

            <form onSubmit={onSubmit} >
                {/* Honeypot caché */}
                <div aria-hidden="true" style={{position:"absolute",left:"-9999px"}}>
                    <label>Votre site<input name="website" tabIndex={-1} autoComplete="off" /></label>
                </div>

                <label>Nom
                    <input name="name" required />
                </label>

                <label>Email
                    <input name="email" type="email" required placeholder="Votre email" />
                </label>

                <label>Message
                    <textarea name="message" rows={5} required />
                </label>

                <button type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Envoi…" : "Envoyer"}
                </button>

                {status === "ok" && <p role="status">Merci ! Votre message a bien été envoyé.</p>}
                {status === "ko" && <p role="alert">Oups : {error}</p>}

                <p className="rgpd">Ces informations sont utilisées uniquement pour répondre à votre message.</p>
            </form>
            </div>
        </section>
    );
}
