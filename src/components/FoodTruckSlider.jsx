import React, { useEffect, useMemo, useRef } from "react";
import { foodTrucks } from "../data/foodTrucks";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { shuffleItems } from "../utils/shuffleItems";

const mobileSliderQuery = "(max-width: 649px)";
const loopCopyCount = 5;
const middleCopyIndex = Math.floor(loopCopyCount / 2);

export function FoodTruckSlider() {
  const isMobileSlider = useMediaQuery(mobileSliderQuery);
  const shuffledFoodTrucks = useMemo(() => shuffleItems(foodTrucks), []);
  const loopedFoodTrucks = useMemo(
    () =>
      Array.from({ length: loopCopyCount }, (_, copyIndex) =>
        shuffledFoodTrucks.map((foodTruck) => ({ ...foodTruck, copyIndex })),
      ).flat(),
    [shuffledFoodTrucks],
  );
  const visibleFoodTrucks = isMobileSlider ? loopedFoodTrucks : shuffledFoodTrucks;
  const sliderRef = useRef(null);
  const activeCardIndexRef = useRef(0);
  const gestureStartXRef = useRef(0);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!isMobileSlider) {
      slider?.scrollTo({ left: 0 });
      return;
    }

    let isRepositioning = false;
    const foodTruckCount = shuffledFoodTrucks.length;
    const firstMiddleCardIndex = foodTruckCount * middleCopyIndex;
    const firstMiddleCard = slider?.children[firstMiddleCardIndex];
    const firstNextCard = slider?.children[foodTruckCount * (middleCopyIndex + 1)];
    const secondMiddleCardIndex = firstMiddleCardIndex + 1;
    const secondMiddleCard = slider?.children[secondMiddleCardIndex];

    if (!slider || !firstMiddleCard || !firstNextCard || !secondMiddleCard) {
      return;
    }

    const middleStart = firstMiddleCard.offsetLeft;
    const nextStart = firstNextCard.offsetLeft;
    const cycleWidth = nextStart - middleStart;
    const loopStart = middleStart - cycleWidth;
    const loopEnd = nextStart + cycleWidth;

    const centerCard = (card) => {
      slider.scrollLeft = card.offsetLeft - (slider.clientWidth - card.clientWidth) / 2;
    };

    const scrollToCard = (cardIndex, behavior = "smooth") => {
      const card = slider.children[cardIndex];

      if (!card) {
        return;
      }

      activeCardIndexRef.current = cardIndex;
      slider.scrollTo({
        left: card.offsetLeft - (slider.clientWidth - card.clientWidth) / 2,
        behavior,
      });
    };

    const keepSliderLooping = () => {
      if (isRepositioning) {
        return;
      }

      if (slider.scrollLeft < loopStart) {
        isRepositioning = true;
        slider.scrollLeft += cycleWidth;
        activeCardIndexRef.current += foodTruckCount;
        requestAnimationFrame(() => {
          isRepositioning = false;
        });
      }

      if (slider.scrollLeft >= loopEnd) {
        isRepositioning = true;
        slider.scrollLeft -= cycleWidth;
        activeCardIndexRef.current -= foodTruckCount;
        requestAnimationFrame(() => {
          isRepositioning = false;
        });
      }
    };

    const handlePointerDown = (event) => {
      gestureStartXRef.current = event.clientX;
    };

    const handlePointerUp = (event) => {
      const swipeDistance = event.clientX - gestureStartXRef.current;
      const minimumSwipeDistance = 36;
      const direction =
        Math.abs(swipeDistance) < minimumSwipeDistance ? 0 : swipeDistance < 0 ? 1 : -1;

      scrollToCard(activeCardIndexRef.current + direction);
    };

    requestAnimationFrame(() => {
      activeCardIndexRef.current = secondMiddleCardIndex;
      centerCard(secondMiddleCard);
    });

    slider.addEventListener("scroll", keepSliderLooping, { passive: true });
    slider.addEventListener("pointerdown", handlePointerDown, { passive: true });
    slider.addEventListener("pointerup", handlePointerUp);
    slider.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("resize", keepSliderLooping);

    return () => {
      slider.removeEventListener("scroll", keepSliderLooping);
      slider.removeEventListener("pointerdown", handlePointerDown);
      slider.removeEventListener("pointerup", handlePointerUp);
      slider.removeEventListener("pointercancel", handlePointerUp);
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
