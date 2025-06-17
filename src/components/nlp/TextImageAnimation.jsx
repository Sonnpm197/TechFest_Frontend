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
        "Harness cutting-edge technology powered by advanced language models like GPT-2 and BART. Our intelligent system automatically imports your interview-related emails and extracts essential details such as company names and interview outcomes, saving you time and effort throughout your job search.",
        "Stay organized every step of the way by editing the status of each opportunity, saving your progress, and reopening your list whenever you return. Our platform ensures you never lose track of important updates and can always pick up right where you left off.",
        "Easily export your interview results to share with others or keep for your own records. With all your interview opportunities managed in one convenient place, you can focus on preparing for success and making the most of every opportunity.",
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