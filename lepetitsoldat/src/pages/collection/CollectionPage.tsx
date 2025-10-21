"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Soldier } from "../../services/ItemsTypes";
import { getSoldiers } from "../../services/ItemsServices";
import ItemCard from "../../components/Itemcard/ItemCard";
import { isLoggedIn } from "../../auth";
import Lightbox from "../../components/lightbox/Lightbox";
import "./CollectionPage.css";
import ItemFormModal from "../../components/itemformmodal/ItemFormModal.tsx";

export default function CollectionPage() {
    const navigate = useNavigate();
    const [items, setItems] = React.useState<Soldier[] | null>(null);
    const [err, setErr] = React.useState<any>(null);
    const [search, setSearch] = React.useState("");

    // Pour la Lightbox
    const [openLightbox, setOpenLightbox] = React.useState(false);
    const [activeLightbox, setActiveLightbox] = React.useState<Soldier | null>(null);
    const [startIndex, setStartIndex] = React.useState(0);

    // Pour le formulaire modal
    const [openForm, setOpenForm] = React.useState(false);
    const [editItem, setEditItem] = React.useState<Soldier | null>(null);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const PER_PAGE = 24;
                const out: Soldier[] = [];
                let page = 1;

                while (true) {
                    const res = await getSoldiers(page, PER_PAGE);
                    out.push(...res.items);
                    if (res.items.length < PER_PAGE) break;
                    page += 1;
                    if (page > 50) break;
                }

                if (mounted) setItems(out);
            } catch (e: any) {
                if (mounted) setErr(e);
                console.error("PB error:", e.status, e.url, e.response);
            }
        })();
        return () => { mounted = false; };
    }, []);

    if (err) {
        return (
            <pre className="errorBox">
                {JSON.stringify({ status: err.status, url: err.url, response: err.response }, null, 2)}
            </pre>
        );
    }

    if (!items) return <div className="loading">Chargement…</div>;

    const filterItems = (items: Soldier[], search: string) => {
        if (!search.trim()) return items;
        const query = search.toLowerCase();
        return items.filter(item => {
            const name = (item.name || "").toLowerCase();
            const brand = (item.brand || "").toLowerCase();
            const ref = (item.ref || "").toLowerCase();
            return name.includes(query) || brand.includes(query) || ref.includes(query);
        });
    };

    const displayItems = filterItems(items, search);

    return (
        <>
            <div className="collectionHeader">
                <div className="searchControls">
                    <input
                        type="text"
                        placeholder="Rechercher par nom, marque ou référence..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="searchInput"
                    />
                    {search && <span className="resultCount">{displayItems.length} résultat(s)</span>}
                </div>

                {isLoggedIn() && (
                    <button className="btnCreate" onClick={() => { setEditItem(null); setOpenForm(true); }}>
                        + Créer un objet
                    </button>
                )}
            </div>

            <div className="grid">
                {displayItems.map(item => (
                    <ItemCard
                        key={item.id}
                        item={item}
                        onClick={() => { setActiveLightbox(item); setStartIndex(0); setOpenLightbox(true); }}
                        onEdit={isLoggedIn() ? () => { setEditItem(item); setOpenForm(true); } : undefined}
                    />
                ))}
            </div>

            {/* Lightbox */}
            <Lightbox
                open={openLightbox}
                onClose={() => setOpenLightbox(false)}
                record={activeLightbox}
                startIndex={startIndex}
            />

            {/* Formulaire modal pour création / édition */}
            {openForm && (
                <ItemFormModal
                    open={openForm}
                    onClose={() => setOpenForm(false)}
                    record={editItem}      // <-- ici, renommer item → record
                    onSaved={() => {
                        setOpenForm(false);
                        getSoldiers(1, 50).then(res => setItems(res.items));
                    }}
                />
            )}
        </>
    );
}
