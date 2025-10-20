import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home.tsx";
import Navbar from "./components/nav/Nav.tsx";
import "./App.css"
import CollectionPage from "./pages/collection/CollectionPage.tsx";
import ContactForm from "./pages/contact/ContactPage.tsx";
import emailjs from "@emailjs/browser";

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY!);

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/contact" element={<ContactForm />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
