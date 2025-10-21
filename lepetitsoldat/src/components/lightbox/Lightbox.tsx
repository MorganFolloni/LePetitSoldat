"use client";
import React from "react";
import pb from "../../pb";
import type { Soldier } from "../../services/ItemsTypes";
import "./Lightbox.css";

interface LightboxProps {
    open: boolean;
    onClose: () => void;
    record: Soldier | null;
    startIndex?: number;
}

export default function Lightbox({
                                     open,
                                     onClose,
                                     record,
                                     startIndex = 0,
                                 }: LightboxProps) {
    const photos = record?.photo ?? [];
    const [index, setIndex] = React.useState(startIndex);

    React.useEffect(() => {
        setIndex(startIndex);
    }, [startIndex, open]);

    React.useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (!open) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight")
                setIndex((i) => (i + 1) % Math.max(photos.length || 1, 1));
            if (e.key === "ArrowLeft")
                setIndex(
                    (i) =>
                        (i - 1 + Math.max(photos.length || 1, 1)) %
                        Math.max(photos.length || 1, 1)
                );
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, photos.length, onClose]);

    if (!open || !record) return null;

    const current = photos[index];
    const big = current
        ? pb.files.getURL(record as any, current, { thumb: "1600x0" })
        : undefined;

    return (
        <div className="lbRoot" aria-modal role="dialog">
            <div className="lbOverlay" onClick={onClose} />
            <div className="lbModal">
                <div className="lbViewer">
                    <div className="lbImgWrap">
                        {big ? (
                            <img
                                src={big}
                                alt={
                                    record.description || record.brand || record.id
                                }
                                className="lbImg"
                            />
                        ) : (
                            <div className="lbNoImg">Pas d'image</div>
                        )}
                    </div>

                    {photos.length > 1 && (
                        <>
                            <button
                                aria-label="Précédent"
                                className="lbArrow lbArrowLeft"
                                onClick={() =>
                                    setIndex(
                                        (i) =>
                                            (i - 1 + photos.length) % photos.length
                                    )
                                }
                            >
                                ←
                            </button>
                            <button
                                aria-label="Suivant"
                                className="lbArrow lbArrowRight"
                                onClick={() =>
                                    setIndex((i) => (i + 1) % photos.length)
                                }
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
                                {new Intl.NumberFormat("fr-FR", {
                                    style: "currency",
                                    currency: "EUR",
                                }).format(record.price)}
                            </div>
                        )}
                        <div className="lbDsc">{record.description}</div>
                    </div>

                    {photos.length > 1 && (
                        <div className="lbThumbs">
                            {photos.map((f, i) => {
                                const u = pb.files.getURL(record as any, f, {
                                    thumb: "300x0",
                                });
                                const active = i === index;
                                return (
                                    <button
                                        key={f}
                                        className={`lbThumb ${
                                            active ? "isActive" : ""
                                        }`}
                                        onClick={() => setIndex(i)}
                                    >
                                        {u ? (
                                            <img
                                                src={u}
                                                alt={`miniature ${i + 1}`}
                                            />
                                        ) : (
                                            <div className="lbThumbPh" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="lbFooter">
                        <button className="btnPlain" onClick={onClose}>
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}