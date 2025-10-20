import { NavLink } from "react-router-dom";
import "./Home.css";

export default function Home() {
    return (
        <div className="home">
            <div className="container">
                <img src="/Soldier.png" alt="Soldier" className="soldier-img" />

                <div className="content">
                    <h2>Les soldats de notre enfance</h2>
                    <p>
                        Découvrez notre collection de figurines en plâtre d’époque — Durso, Elastolin, Chialux — à la patine d’antan. Un voyage dans l’âge d’or du jouet.
                    </p>

                    <NavLink to="/collection" end className="hero-cta" aria-label="Voir la collection">
                        Voir la collection
                    </NavLink>
                </div>
            </div>
        </div>
    );
}