import pb from "../pb.ts";
import type { Soldier } from "./ItemsTypes.ts"

export async function getSoldiers(page = 1, perPage = 24) {
    return await pb.collection("items").getList<Soldier>(page, perPage, {
        sort: "-brand",
    });
}

export async function createSoldier(data: Partial<Soldier>) {
    return await pb.collection("items").create<Soldier>(data);
}

export async function updateSoldier(id: string, data: Partial<Soldier>) {
    return await pb.collection("items").update<Soldier>(id, data);
}

export async function deleteSoldier(id: string) {
    return await pb.collection("items")["delete"](id);
}