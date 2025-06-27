import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroSection() {
    const ref = useRef(null);
    // Track scroll progress for the hero section (0 at top, 1 at bottom)
    const { scrollYProgress } = useScroll({
        target: ref,
        // start start When the start (top) of the element hits the start (top) of the viewport.
        // end start When the end (bottom) of the element hits the start (top) of the viewport.
        offset: ["start start", "end start"]
    });

    // As scrollYProgress goes from 0 → 1, the scale goes from 1 → 0.8.
    // This means the target element shrinks slightly while scrolling.
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

    return (
        <section
            ref={ref}
            className="h-screen flex flex-col justify-center items-center relative bg-white"
            style={{ overflow: "hidden" }}>
            <motion.div
                className="absolute inset-0 flex justify-center items-center z-0"
                style={{ scale }}>
                <div className="w-full h-full mx-8 relative">
                    <video
                        className="w-full h-full object-cover rounded-2xl"
                        controls
                        poster="/images/poster.jpg"
                        autoPlay
                        muted
                    >
                        <source src="/videos/fullver.mp4" type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                    {/* Overlay only on the image */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl pointer-events-none"></div>
                </div>
            </motion.div>
        </section>
    );
}

