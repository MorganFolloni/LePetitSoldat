// src/auth.ts
import pb from "./pb";

export async function login(email: string, password: string) {
    const { token, record } = await pb.collection("users")
        .authWithPassword(email, password);
    // token = JWT ; record = user
    return { token, user: record };
}

export function logout() {
    pb.authStore.clear();
}

export async function refresh() {
    if (!pb.authStore.isValid) {
        console.warn("Aucune session valide, refresh ignoré.");
        return null; // ⚠️ PAS d'appel à authRefresh
    }

    try {
        const { token, record } = await pb.collection("users").authRefresh();
        return { token, user: record };
    } catch (err) {
        console.error("Échec du refresh:", err);
        pb.authStore.clear(); // nettoyer la session
        return null;
    }
}

// helpers
export function isLoggedIn() {
    return pb.authStore.isValid;
}
export function currentUser<T = any>() {
    return pb.authStore.model as T | null;
}
export function jwt() {
    return pb.authStore.token; // le JWT
}
