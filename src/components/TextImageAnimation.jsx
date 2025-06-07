import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function TextImageAnimation() {
    const images = [
        "/images/interview1.jpg",
        "/images/interview2.jpg",
        "/images/interview3.jpg",
        // Add your image paths here
    ];

    const texts = [
        "Ace your interviews with our smart email importer.",
        "Track your interview status and company details easily.",
        "Edit and manage your interview opportunities in one place.",
    ];

    return (
        <>
            {images.map((img, idx) => (
                <section
                    key={img}
                    className="h-screen flex items-center justify-center relative">
                    <div
                        className={`flex w-full h-2/3 items-center justify-center px-8 ${
                            idx % 2 === 1 ? "flex-row-reverse" : ""
                        }`}>
                        <motion.img
                            src={img}
                            alt=""
                            className="w-2/3 h-full object-cover rounded-xl shadow-lg"
                            style={{maxHeight: "70vh"}}
                            initial={{x: idx % 2 === 1 ? 200 : -200, opacity: 0}}
                            whileInView={{x: 0, opacity: 1}}
                            transition={{duration: 5, type: "spring"}}
                            viewport={{once: true, amount: 0.5}}
                        />
                        <motion.div
                            className="w-1/3 pl-12 flex flex-col justify-center"
                            initial={{x: idx % 2 === 1 ? -200 : 200, opacity: 0}}
                            whileInView={{x: 0, opacity: 1}}
                            transition={{duration: 5, type: "spring", delay: 0.2}}
                            viewport={{once: true, amount: 0.5}}>
                            <h2 className="text-3xl font-bold mb-4">Why use us?</h2>
                            <p className="text-lg">{texts[idx]}</p>
                        </motion.div>
                    </div>
                </section>
            ))}
        </>

    )
}