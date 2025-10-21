import PocketBase from "pocketbase";

const pb = new PocketBase(import.meta.env.VITE_PB_URL);

pb.autoCancellation(false);

// 🔹 Charger la session depuis localStorage
const saved = localStorage.getItem("pb_auth");
if (saved) {
    pb.authStore.loadFromCookie(saved); // recharge correctement la session
}

// 🔹 Sauvegarder automatiquement la session dans localStorage
pb.authStore.onChange(() => {
    const cookieData = pb.authStore.exportToCookie({ httpOnly: false });
    localStorage.setItem("pb_auth", cookieData);
});

export default pb;
