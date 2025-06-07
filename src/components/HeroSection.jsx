import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroSection() {
    const ref = useRef(null);
    // Track scroll progress for the hero section (0 at top, 1 at bottom)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });
    // const videoRef = useRef(null);

    // Scale from 1 (100%) to 0.8 (80%) as you scroll the hero section
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

    return (
        <section
            ref={ref}
            className="h-screen flex flex-col justify-center items-center relative bg-white"
            style={{ overflow: "hidden" }}
        >
            <motion.div
                className="absolute inset-0 flex justify-center items-center z-0"
                style={{ scale }}
            >
                <div className="w-full h-full mx-8 relative">
                    {/*<img*/}
                    {/*    src="/images/background.jpg"*/}
                    {/*    alt=""*/}
                    {/*    className="w-full h-full object-cover rounded-2xl"*/}
                    {/*    style={{ maxHeight: "100%" }}*/}
                    {/*/>*/}

                    <video
                        className="w-full h-full object-cover rounded-2xl"
                        controls
                        poster="/images/poster.jpg"
                    >
                        <source src="/videos/demo.mp4" type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                    {/* Overlay only on the image */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl pointer-events-none"></div>
                </div>
            </motion.div>
            {/* Content */}
            {/*<div className="relative z-10 flex flex-col items-center text-white">*/}
            {/*    <h1 className="text-5xl font-extrabold mb-8">Welcome to Interview Importer</h1>*/}
            {/*    <p className="text-xl max-w-xl text-center">*/}
            {/*        Effortlessly import, track, and manage your interview emails.*/}
            {/*    </p>*/}
            {/*</div>*/}
        </section>
    );
}

