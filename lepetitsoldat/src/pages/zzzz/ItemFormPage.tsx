"use client";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import pb from "../../pb";
import { createSoldier, updateSoldier } from "../../services/ItemsServices";
import type { Soldier } from "../../services/ItemsTypes";
import "./ItemFormPage.css";

export default function ItemFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

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
    const [currentRecord, setCurrentRecord] = React.useState<Soldier | null>(null);
    const [brandOptions, setBrandOptions] = React.useState<string[]>([]);

    React.useEffect(() => {
        // Charger les options de brand depuis les items existants
        (async () => {
            try {
                const items = await pb.collection("items").getFullList<Soldier>();
                const brands = [...new Set(items.map(item => item.brand).filter(Boolean))] as string[];
                setBrandOptions(brands.sort());
            } catch (err) {
                console.error("Erreur lors du chargement des marques", err);
            }
        })();

        if (isEdit && id) {
            (async () => {
                try {
                    const record = await pb.collection("items").getOne<Soldier>(id);
                    setCurrentRecord(record);
                    setFormData({
                        name: record.name || "",
                        brand: record.brand || "",
                        ref: record.ref || "",
                        price: record.price?.toString() || "",
                        description: record.description || "",
                    });
                    setExistingPhotos(record.photo || []);
                } catch (err) {
                    console.error("Erreur lors du chargement", err);
                    setError("Impossible de charger l'objet");
                }
            })();
        }
    }, [isEdit, id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
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
            data.append("name", formData.name);
            data.append("brand", formData.brand);
            data.append("ref", formData.ref);

            // Convertir le prix en nombre
            const priceValue = parseFloat(formData.price);
            if (!isNaN(priceValue)) {
                data.append("price", priceValue.toString());
            }

            data.append("description", formData.description);

            photos.forEach((photo) => {
                data.append("photo", photo);
            });

            // Marquer les photos à supprimer
            photosToDelete.forEach((photoName) => {
                data.append("photo-", photoName);
            });

            if (isEdit && id) {
                await pb.collection("items").update(id, data);
            } else {
                await pb.collection("items").create(data);
            }

            navigate("/collection");
        } catch (err: any) {
            console.error("Erreur lors de la sauvegarde", err);
            setError(err.message || "Erreur lors de la sauvegarde");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="formPage">
            <div className="formContainer">
                <h1 className="formTitle">
                    {isEdit ? "Modifier l'objet" : "Créer un nouvel objet"}
                </h1>

                {error && <div className="formError">{error}</div>}

                <form onSubmit={handleSubmit} className="itemForm">
                    <div className="formGroup">
                        <label htmlFor="name">Nom *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="formGroup">
                        <label htmlFor="brand">Marque</label>
                        <select
                            id="brand"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                        >
                            <option value="">-- Sélectionner une marque --</option>
                            {brandOptions.map((brand) => (
                                <option key={brand} value={brand}>
                                    {brand}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="formGroup">
                        <label htmlFor="ref">Référence</label>
                        <input
                            type="text"
                            id="ref"
                            name="ref"
                            value={formData.ref}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="formGroup">
                        <label htmlFor="price">Prix estimé (€)</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
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

                    <div className="formGroup">
                        <label htmlFor="photo">Photos</label>

                        {isEdit && existingPhotos.length > 0 && (
                            <div className="existingPhotos">
                                <p className="existingPhotosLabel">Photos actuelles :</p>
                                <div className="photoGrid">
                                    {existingPhotos.map((photoName) => {
                                        const url = currentRecord
                                            ? pb.files.getURL(currentRecord as any, photoName, {
                                                thumb: "200x200",
                                            })
                                            : "";
                                        return (
                                            <div key={photoName} className="photoItem">
                                                <img src={url} alt="Photo" />
                                                <button
                                                    type="button"
                                                    className="photoDeleteBtn"
                                                    onClick={() => handleDeleteExistingPhoto(photoName)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <input
                            type="file"
                            id="photo"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                        />
                        {photos.length > 0 && (
                            <div className="photoPreview">
                                {photos.length} nouvelle(s) photo(s) sélectionnée(s)
                            </div>
                        )}
                    </div>

                    <div className="formActions">
                        <button
                            type="button"
                            onClick={() => navigate("/collection")}
                            className="btnSecondary"
                        >
                            Annuler
                        </button>
                        <button type="submit" disabled={loading} className="btnPrimary">
                            {loading
                                ? "Enregistrement..."
                                : isEdit
                                    ? "Mettre à jour"
                                    : "Créer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}