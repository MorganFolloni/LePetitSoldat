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
    // valide + rafraîchit le JWT si proche de l’expiration
    const { token, record } = await pb.collection("users").authRefresh();
    return { token, user: record };
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
