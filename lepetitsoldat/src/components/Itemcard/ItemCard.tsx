"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import pb from "../../pb";
import { isLoggedIn } from "../../auth";
import { deleteSoldier } from "../../services/ItemsServices";
import type { Soldier } from "../../services/ItemsTypes";
import "./ItemCard.css";

interface ItemCardProps {
    item: Soldier;
    onClick: () => void;
}

export default function ItemCard({ item, onClick, onEdit }: ItemCardProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Supprimer cet objet ?")) return;
        try {
            setIsDeleting(true);
            await deleteSoldier(item.id);
            window.location.reload();
        } catch (err) {
            console.error("Erreur lors de la suppression", err);
            alert("Erreur lors de la suppression");
        }
    };

    const f = item.photo?.[0];
    const u = f ? pb.files.getURL(item as any, f, { thumb: "800x0" }) : undefined;

    return (
        <div className="card" onClick={onClick}>
            <div className="cardImgWrap">
                {u ? <img src={u} alt={item.description || item.brand || item.id} /> : <div className="cardNoImg">Pas d'image</div>}
            </div>
            <h3 className="cardTitle">{item.name || "Sans titre"}</h3>
            {item.brand && <div className="cardBrand">{item.brand}</div>}

            {isLoggedIn() && (
                <div className="cardAdminOptions">
                    {onEdit && (
                        <button
                            type="button"
                            className="cardAdminBtn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                        >
                            ✏️
                        </button>
                    )}
                    <button
                        type="button"
                        className="cardAdminBtn"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        🗑️
                    </button>
                </div>
            )}
        </div>
    );
}
