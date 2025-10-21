"use client";
import React from "react";
import pb from "../../pb";
import type { Soldier } from "../../services/ItemsTypes";
import "./ItemFormModal.css"; // juste pour le fond modale

interface Props {
    open: boolean;
    onClose: () => void;
    record?: Soldier | null; // null = création
    onSaved?: () => void;    // callback pour rafraîchir la liste
}

export default function ItemFormModal({ open, onClose, record, onSaved }: Props) {
    const isEdit = Boolean(record?.id);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [formData, setFormData] = React.useState({
        name: "",
        brand: "",
        ref: "",
        price: "",
        description: "",
    });

    const [photos, setPhotos] = React.useState<File[]>([]);
    const [existingPhotos, setExistingPhotos] = React.useState<string[]>([]);
    const [photosToDelete, setPhotosToDelete] = React.useState<string[]>([]);
    const [brandOptions, setBrandOptions] = React.useState<string[]>([]);

    // Charger marques + préremplissage
    React.useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                // Charger les marques pour le select
                const items = await pb.collection("items").getFullList<Soldier>();
                const brands = [...new Set(items.map(i => i.brand).filter(Boolean))].sort();
                setBrandOptions(brands);
            } catch (err) {
                console.error("Erreur marques", err);
            }

            // Préremplir le formulaire si édition
            if (record) {
                setFormData({
                    name: record.name || "",
                    brand: record.brand || "",
                    ref: record.ref || "",
                    price: record.price?.toString() || "",
                    description: record.description || "",
                });
                setExistingPhotos(record.photo || []);
            } else {
                // Création : réinitialiser
                setFormData({
                    name: "",
                    brand: "",
                    ref: "",
                    price: "",
                    description: "",
                });
                setExistingPhotos([]);
            }

            // Toujours réinitialiser photos à uploader et photos à supprimer
            setPhotos([]);
            setPhotosToDelete([]);
        })();
    }, [open, record]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPhotos(Array.from(e.target.files));
        }
    };

    const handleDeleteExistingPhoto = (photoName: string) => {
        setPhotosToDelete((prev) => [...prev, photoName]);
        setExistingPhotos((prev) => prev.filter((p) => p !== photoName));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([k, v]) => data.append(k, v));

            photos.forEach((p) => data.append("photo", p));
            photosToDelete.forEach((n) => data.append("photo-", n));

            if (isEdit && record?.id) {
                await pb.collection("items").update(record.id, data);
            } else {
                await pb.collection("items").create(data);
            }

            onSaved?.();
            onClose();
        } catch (err: any) {
            console.error("Erreur", err);
            setError(err.message || "Erreur lors de la sauvegarde");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="modalOverlay">
            <div className="modalContent">
                <h1 className="formTitle">
                    {isEdit ? "Modifier l'objet" : "Créer un nouvel objet"}
                </h1>

                {error && <div className="formError">{error}</div>}

                <form onSubmit={handleSubmit} className="itemForm">
                    <div className="formGroup">
                        <label htmlFor="name">Nom *</label>
                        <input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="formGroup">
                        <label htmlFor="brand">Marque</label>
                        <select id="brand" name="brand" value={formData.brand} onChange={handleChange}>
                            <option value="">-- Sélectionner --</option>
                            {brandOptions.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    <div className="formGroup">
                        <label htmlFor="ref">Référence</label>
                        <input id="ref" name="ref" value={formData.ref} onChange={handleChange} />
                    </div>

                    <div className="formGroup">
                        <label htmlFor="price">Prix (€)</label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="formGroup">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Photos existantes (édition) */}
                    {isEdit && existingPhotos.length > 0 && (
                        <div className="existingPhotos">
                            <p className="existingPhotosLabel">Photos actuelles :</p>
                            <div className="photoGrid">
                                {existingPhotos.map((photo) => (
                                    <div key={photo} className="photoItem">
                                        <img src={pb.files.getURL(record as any, photo, { thumb: "200x200" })} alt="" />
                                        <button
                                            type="button"
                                            className="photoDeleteBtn"
                                            onClick={() => handleDeleteExistingPhoto(photo)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nouvelles photos */}
                    <div className="formGroup">
                        <label htmlFor="photo">Nouvelles photos</label>
                        <input type="file" id="photo" multiple accept="image/*" onChange={handlePhotoChange} />
                        {photos.length > 0 && (
                            <div className="photoPreview">
                                {photos.length} nouvelle(s) photo(s) sélectionnée(s)
                            </div>
                        )}
                    </div>

                    <div className="formActions">
                        <button type="button" className="btnSecondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btnPrimary" disabled={loading}>
                            {loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
