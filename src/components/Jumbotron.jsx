import React, { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const cards = [
    {
        title: "Apple Intelligence",
        subtitle: "AI-opening possibilities.",
        image: "/images/iphone-ai.jpg",
        bg: "bg-black",
        text: "text-white",
    },
    {
        title: "Cutting-Edge Cameras",
        subtitle: "Picture your best photos and videos.",
        image: "/images/iphone-camera.jpg",
        bg: "bg-blue-900",
        text: "text-white",
    },
    {
        title: "Chip and Battery Life",
        subtitle: "Fast that lasts.",
        image: "/images/iphone-chip.jpg",
        bg: "bg-neutral-900",
        text: "text-white",
    },
    {
        title: "Innovation",
        subtitle: "Beautiful and durable, by design.",
        image: "/images/iphone-blue.jpg",
        bg: "bg-gray-100",
        text: "text-black",
    },
    {
        title: "Environment",
        subtitle: "Recycle. Reuse. Repeat.",
        image: "/images/iphone-white.jpg",
        bg: "bg-blue-100",
        text: "text-black",
    },
    {
        title: "Environment",
        subtitle: "Recycle. Reuse. Repeat.",
        image: "/images/iphone-white.jpg",
        bg: "bg-blue-100",
        text: "text-black",
    },{
        title: "Environment",
        subtitle: "Recycle. Reuse. Repeat.",
        image: "/images/iphone-white.jpg",
        bg: "bg-blue-100",
        text: "text-black",
    },
    {
        title: "Environment",
        subtitle: "Recycle. Reuse. Repeat.",
        image: "/images/iphone-white.jpg",
        bg: "bg-blue-100",
        text: "text-black",
    },

];

export default function Jumbotron() {
    const scrollRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const cardWidth = 384; // w-96 = 384px
    const gap = 32; // gap-8 = 32px

    const scrollLeft = () => {
        const container = scrollRef.current;
        if (container && currentIndex > 0) {
            const newIndex = currentIndex - 1;
            const scrollPosition = newIndex * (cardWidth + gap);

            container.scrollTo({
                left: scrollPosition,
                behavior: "smooth"
            });

            setCurrentIndex(newIndex);
        }
    };

    const scrollRight = () => {
        const container = scrollRef.current;
        if (container && currentIndex < cards.length - 1) {
            const newIndex = currentIndex + 1;
            const scrollPosition = newIndex * (cardWidth + gap);

            container.scrollTo({
                left: scrollPosition,
                behavior: "smooth"
            });

            setCurrentIndex(newIndex);
        }
    };

    return (
        <div className="mx-8">
            {/* Scrollable container - removed w-full to prevent stretching */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-8 pb-4"
                style={{
                    height: "33vh",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    width: "100vw", // Use viewport width instead of w-full
                    marginLeft: "-2rem", // Offset the mx-8 margin
                    paddingLeft: "2rem", // Add back padding for visual spacing
                    paddingRight: "2rem"
                }}>
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        className={`flex-shrink-0 w-96 h-full rounded-[2rem] overflow-hidden shadow-lg relative flex flex-col justify-end ${card.bg} ${card.text}`}
                        style={{
                            backgroundImage: `url(${card.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}>
                        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                        <div className="relative z-10 p-8">
                            <div className="text-lg font-medium opacity-80 mb-2">{card.title}</div>
                            <div className="text-3xl font-bold leading-tight mb-4">{card.subtitle}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Arrow controls */}
            <div className="flex justify-center gap-8 mt-6">
                <button
                    onClick={scrollLeft}
                    disabled={currentIndex === 0}
                    className={`w-12 h-12 flex items-center justify-center rounded-full shadow transition ${
                        currentIndex === 0
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}>
                    <FaChevronLeft />
                </button>

                <button
                    onClick={scrollRight}
                    disabled={currentIndex === cards.length - 1}
                    className={`w-12 h-12 flex items-center justify-center rounded-full shadow transition ${
                        currentIndex === cards.length - 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}>
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
}