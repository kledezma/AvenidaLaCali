import React from "react";
import avenidaLogo from "./assets/brand/AvenidaLaCali.png";
import { FoodTruckSlider } from "./components/FoodTruckSlider";

export function App() {
  return (
    <main className="app-shell">
      <section className="brand-stage" aria-label="Avenida La Cali">
        <div className="city-lights" aria-hidden="true">
          {Array.from({ length: 34 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <img className="main-logo" src={avenidaLogo} alt="Avenida La Cali Centro Gastronomico" />
      </section>

      <FoodTruckSlider />
    </main>
  );
}
