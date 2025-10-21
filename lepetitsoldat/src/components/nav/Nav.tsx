import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import pb from "../../pb";              // <-- singleton (pb.autoCancellation(false) dans pb.ts)
import "./Nav.css";
import {refresh} from "../../auth.ts";

type UserModel = {
    id: string;
    email?: string;
    isAdmin?: boolean; // si tu as ce champ sur users
};

export default function Navbar() {
    const dlgRef = useRef<HTMLDialogElement | null>(null);
    const [me, setMe] = useState<UserModel | null>(pb.authStore.model as any);
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const isLoggedIn = pb.authStore.isValid;
    const IsAdmin = isLoggedIn && !!(me as any)?.isAdmin;

    // Raccourci clavier
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.shiftKey && e.key.toLowerCase() === "l") dlgRef.current?.showModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Suivre l'état d'auth (et tenter un refresh silencieux au mount)
    useEffect(() => {
        // essaie de rafraîchir le JWT au chargement
        pb.collection("users").authRefresh().catch(() => { /* pas grave */ });

        const unsub = pb.authStore.onChange(() => {
            setMe(pb.authStore.model as any);
        });
        return () => { unsub(); };
    }, []);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrMsg(null);
        const data = new FormData(e.currentTarget);
        const email = String(data.get("email") || "");
        const password = String(data.get("password") || "");
        try {
            // IMPORTANT: c'est bien collection("users"), pas pb.users
            await pb.collection("users").authWithPassword(email, password);
            setMe(pb.authStore.model as any);
            dlgRef.current?.close();
        } catch (err: any) {
            console.error(err);
            setErrMsg(err?.response?.message || "Échec de connexion");
        }
    }

    function onLogout() {
        pb.authStore.clear();
        setMe(null);
    }

    function closeOnBackdrop(e: React.MouseEvent<HTMLDialogElement>) {
        const rect = (e.target as HTMLDialogElement).getBoundingClientRect();
        const inDialog =
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom;
        if (!inDialog) dlgRef.current?.close();
    }

    useEffect(() => {
        const doRefresh = async () => {
            if (pb.authStore.isValid) {
                try {
                    await refresh(); // your helper handles refresh + errors
                } catch {
                    pb.authStore.clear();
                    setMe(null);
                }
            }
        };
        doRefresh();
    }, []);

    return (
        <header className="nav">
            <div className="navInner">
                <div className="brand">
                    <h1 className="title">LE PETIT SOLDAT</h1>
                </div>

                <nav className="menu">
                    <NavLink to="/" className="link">À PROPOS</NavLink>
                    <NavLink to="/collection" end className="link">LA COLLECTION</NavLink>
                    <NavLink to="/contact" className="link">CONTACT</NavLink>

                    {/* Zone auth simple */}
                    {isLoggedIn ? (
                        <div className="authBox">
              <span className="hello">
                Connecté
              </span>
                            <button className="kebab" aria-label="Se déconnecter" onClick={onLogout}>↪</button>
                        </div>
                    ) : (
                        <button className="kebab" aria-label="Admin" onClick={() => dlgRef.current?.showModal()}>
                            …
                        </button>
                    )}
                </nav>
            </div>

            {/* LOGIN ADMIN */}
            <dialog ref={dlgRef} className="login" onClick={closeOnBackdrop}>
                <form method="dialog" className="loginHead">
                    <strong>Admin</strong>
                    <button value="close" aria-label="Fermer">✕</button>
                </form>

                <form className="loginForm" onSubmit={onSubmit}>
                    <label>
                        Email
                        <input name="email" type="email" required autoComplete="username" />
                    </label>
                    <label>
                        Mot de passe
                        <input name="password" type="password" required autoComplete="current-password" />
                    </label>
                    {errMsg && <div className="formError">{errMsg}</div>}
                    <button type="submit" className="loginBtn">Se connecter</button>
                </form>
            </dialog>
        </header>
    );
}
