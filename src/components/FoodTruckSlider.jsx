import React, { useEffect, useMemo, useRef } from "react";
import { foodTrucks } from "../data/foodTrucks";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { shuffleItems } from "../utils/shuffleItems";

const mobileSliderQuery = "(max-width: 649px)";

export function FoodTruckSlider() {
  const isMobileSlider = useMediaQuery(mobileSliderQuery);
  const shuffledFoodTrucks = useMemo(() => shuffleItems(foodTrucks), []);
  const loopedFoodTrucks = useMemo(
    () =>
      Array.from({ length: 3 }, (_, copyIndex) =>
        shuffledFoodTrucks.map((foodTruck) => ({ ...foodTruck, copyIndex })),
      ).flat(),
    [shuffledFoodTrucks],
  );
  const visibleFoodTrucks = isMobileSlider ? loopedFoodTrucks : shuffledFoodTrucks;
  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!isMobileSlider) {
      slider?.scrollTo({ left: 0 });
      return;
    }

    const foodTruckCount = shuffledFoodTrucks.length;
    const firstMiddleCard = slider?.children[foodTruckCount];
    const firstNextCard = slider?.children[foodTruckCount * 2];
    const secondMiddleCard = slider?.children[foodTruckCount + 1];

    if (!slider || !firstMiddleCard || !firstNextCard || !secondMiddleCard) {
      return;
    }

    const centerCard = (card) => {
      slider.scrollLeft = card.offsetLeft - (slider.clientWidth - card.clientWidth) / 2;
    };

    const keepSliderLooping = () => {
      const middleStart = firstMiddleCard.offsetLeft;
      const nextStart = firstNextCard.offsetLeft;
      const cycleWidth = nextStart - middleStart;

      if (slider.scrollLeft < middleStart) {
        slider.scrollLeft += cycleWidth;
      }

      if (slider.scrollLeft >= nextStart) {
        slider.scrollLeft -= cycleWidth;
      }
    };

    requestAnimationFrame(() => {
      centerCard(secondMiddleCard);
    });

    slider.addEventListener("scroll", keepSliderLooping, { passive: true });
    window.addEventListener("resize", keepSliderLooping);

    return () => {
      slider.removeEventListener("scroll", keepSliderLooping);
      window.removeEventListener("resize", keepSliderLooping);
    };
  }, [isMobileSlider, shuffledFoodTrucks]);

  return (
    <section className="restaurants-section" aria-label="Food Trucks">
      <div className="section-heading">
        <p>Restaurantes</p>
        <span>Desliza</span>
      </div>

      <div className="restaurant-slider" ref={sliderRef}>
        {visibleFoodTrucks.map((foodTruck, index) => (
          <article
            className={`restaurant-card ${foodTruck.tone}`}
            key={`${foodTruck.copyIndex ?? "desktop"}-${foodTruck.name}-${index}`}
          >
            <div className="restaurant-image-wrap">
              <img src={foodTruck.image} alt={foodTruck.name} />
            </div>
            <h2>{foodTruck.name}</h2>
          </article>
        ))}
      </div>
    </section>
  );
}
