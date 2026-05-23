import React, { useMemo, useRef, useState } from "react";
import { foodTrucks } from "../data/foodTrucks";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { shuffleItems } from "../utils/shuffleItems";

const mobileSliderQuery = "(max-width: 649px)";
const mobileWindowOffsets = [-2, -1, 0, 1, 2];
const maxDragOffset = 118;
const minimumSwipeDistance = 48;

export function FoodTruckSlider() {
  const isMobileSlider = useMediaQuery(mobileSliderQuery);
  const shuffledFoodTrucks = useMemo(() => shuffleItems(foodTrucks), []);
  const [activeIndex, setActiveIndex] = useState(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [settleDirection, setSettleDirection] = useState(0);
  const gestureStartXRef = useRef(0);
  const activePointerIdRef = useRef(null);
  const pendingDirectionRef = useRef(0);
  const settleTimerRef = useRef(null);

  const getCircularIndex = (index) => {
    const count = shuffledFoodTrucks.length;
    return ((index % count) + count) % count;
  };

  const mobileFoodTrucks = mobileWindowOffsets.map((offset) => {
    const foodTruckIndex = getCircularIndex(activeIndex + offset);
    return {
      ...shuffledFoodTrucks[foodTruckIndex],
      position: offset,
      foodTruckIndex,
    };
  });
  const visibleFoodTrucks = isMobileSlider ? mobileFoodTrucks : shuffledFoodTrucks;

  const moveTo = (direction) => {
    setActiveIndex((currentIndex) => getCircularIndex(currentIndex + direction));
  };

  const settleToDirection = (direction) => {
    window.clearTimeout(settleTimerRef.current);

    if (direction === 0) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    pendingDirectionRef.current = direction;
    setIsDragging(false);
    setSettleDirection(direction);
    setDragOffset(0);

    settleTimerRef.current = window.setTimeout(() => {
      moveTo(pendingDirectionRef.current);
      pendingDirectionRef.current = 0;
      setSettleDirection(0);
      setDragOffset(0);
    }, 260);
  };

  const finishGesture = (clientX) => {
    const swipeDistance = clientX - gestureStartXRef.current;
    const direction =
      Math.abs(swipeDistance) < minimumSwipeDistance ? 0 : swipeDistance < 0 ? 1 : -1;

    settleToDirection(direction);
  };

  const handlePointerDown = (event) => {
    if (!isMobileSlider || settleDirection !== 0) {
      return;
    }

    activePointerIdRef.current = event.pointerId;
    gestureStartXRef.current = event.clientX;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    const swipeDistance = event.clientX - gestureStartXRef.current;
    const resistanceOffset =
      Math.sign(swipeDistance) * Math.min(Math.abs(swipeDistance) * 0.72, maxDragOffset);
    const limitedOffset = Math.round(resistanceOffset);
    setDragOffset(limitedOffset);
  };

  const handlePointerUp = (event) => {
    if (!isDragging || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    finishGesture(event.clientX);
    activePointerIdRef.current = null;
  };

  return (
    <section className="restaurants-section" aria-label="Food Trucks">
      <div className="section-heading">
        <p>Restaurantes</p>
        <span>Desliza</span>
      </div>

      <div
        className={`restaurant-slider ${isMobileSlider ? "is-mobile" : "is-desktop"} ${
          isDragging ? "is-dragging" : ""
        } ${settleDirection > 0 ? "is-settling-next" : ""} ${
          settleDirection < 0 ? "is-settling-prev" : ""
        }`}
        aria-busy={settleDirection !== 0}
        aria-live="polite"
        data-active-index={activeIndex}
        data-pending-direction={pendingDirectionRef.current}
        data-drag-offset={dragOffset}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ "--drag-offset": `${dragOffset}px` }}
      >
        {visibleFoodTrucks.map((foodTruck, index) => (
          <article
            className={`restaurant-card ${foodTruck.tone}`}
            key={
              isMobileSlider
                ? `${foodTruck.position}-${foodTruck.name}-${foodTruck.foodTruckIndex}`
                : `${foodTruck.name}-${index}`
            }
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
