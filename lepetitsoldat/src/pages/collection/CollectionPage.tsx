"use client";
import React from "react";
import pb from "../../pb";
import "./CollectionPage.css"

type RecordT = {
    id: string;
    description?: string;
    name?: string;
    brand?: string;
    price?: number;
    ref?: string;
    photo?: string[];
    collectionId?: string;
    collectionName?: string;
};

function Lightbox({
                      open,
                      onClose,
                      record,
                      startIndex = 0,
                  }: {
    open: boolean;
    onClose: () => void;
    record: RecordT | null;
    startIndex?: number;
}) {
    const photos = record?.photo ?? [];
    const [index, setIndex] = React.useState(startIndex);

    React.useEffect(() => { setIndex(startIndex); }, [startIndex, open]);

    React.useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (!open) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") setIndex((i) => (i + 1) % Math.max(photos.length || 1, 1));
            if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + Math.max(photos.length || 1, 1)) % Math.max(photos.length || 1, 1));
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, photos.length, onClose]);

    if (!open || !record) return null;

    const current = photos[index];
    const big = current ? pb.files.getURL(record as any, current, { thumb: "1600x0" }) : undefined;

    return (
        <div className="lbRoot" aria-modal role="dialog">
            <div className="lbOverlay" onClick={onClose} />
            <div className="lbModal">
                <div className="lbViewer">
                    <div className="lbImgWrap">
                        {big ? (
                            <img src={big} alt={record.description || record.brand || record.id} className="lbImg" />
                        ) : (
                            <div className="lbNoImg">Pas d’image</div>
                        )}
                    </div>

                    {photos.length > 1 && (
                        <>
                            <button
                                aria-label="Précédent"
                                className="lbArrow lbArrowLeft"
                                onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
                            >
                                ←
                            </button>
                            <button
                                aria-label="Suivant"
                                className="lbArrow lbArrowRight"
                                onClick={() => setIndex((i) => (i + 1) % photos.length)}
                            >
                                →
                            </button>
                        </>
                    )}
                </div>

                <div className="lbInfo">
                    <div className="lbHeader">
                        <h3 className="lbTitle">{record.name || "Sans titre"}</h3>
                        {record.ref && <div className="lbRef">ref: {record.ref}</div>}
                        {record.brand && <div className="lbBrand">{record.brand}</div>}
                        {typeof record.price === "number" && (
                            <div className="lbPrice">
                                Prix estimé:&nbsp;
                                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(record.price)}
                            </div>
                    )}
                        <div className="lbDsc"> {record.description}</div>
                    </div>

                    {photos.length > 1 && (
                        <div className="lbThumbs">
                            {photos.map((f, i) => {
                                const u = pb.files.getURL(record as any, f, { thumb: "300x0" });
                                const active = i === index;
                                return (
                                    <button
                                        key={f}
                                        className={`lbThumb ${active ? "isActive" : ""}`}
                                        onClick={() => setIndex(i)}
                                    >
                                        {u ? <img src={u} alt={`miniature ${i + 1}`} /> : <div className="lbThumbPh" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="lbFooter">
                        <button className="btnPlain" onClick={onClose}>Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CollectionPage() {
    const [items, setItems] = React.useState<RecordT[] | null>(null);
    const [err, setErr] = React.useState<any>(null);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // Pagination (compatible partout) — réactive sort si besoin
                const PER_PAGE = 24;
                const out: RecordT[] = [];
                let page = 1;

                while (true) {
                    const res = await pb.collection("cards").getList<RecordT>(page, PER_PAGE, {
                        sort: "-brand", // si souci, commente cette ligne puis trie côté client
                    });
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

    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState<RecordT | null>(null);
    const [startIndex, setStartIndex] = React.useState(0);

    if (err) return (
        <pre className="errorBox">
      {JSON.stringify({ status: err.status, url: err.url, response: err.response }, null, 2)}
    </pre>
    );
    if (!items) return <div className="loading">Chargement…</div>;

    return (
        <>
            <div className="grid">
                {items.map((r) => {
                    const f = r.photo?.[0];
                    const u = f ? pb.files.getURL(r as any, f, { thumb: "800x0" }) : undefined;
                    return (
                        <button
                            key={r.id}
                            className="card"
                            onClick={() => { setActive(r); setStartIndex(0); setOpen(true); }}
                        >
                            <div className="cardImgWrap">
                                {u ? <img src={u} alt={r.description || r.brand || r.id} /> : <div className="cardNoImg">Pas d’image</div>}
                            </div>
                            <h3 className="cardTitle">{r.name || "Sans titre"}</h3>
                            {r.brand && <div className="cardBrand">{r.brand}</div>}
                        </button>
                    );
                })}
            </div>

            <Lightbox
                open={open}
                onClose={() => setOpen(false)}
                record={active}
                startIndex={startIndex}
            />
        </>
    );
}
