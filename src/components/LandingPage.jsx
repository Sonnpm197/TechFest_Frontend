import React from "react";


import HeroSection from "./HeroSection";
import Navigation from "./Navigation";
import Jumbotron from "./Jumbotron";
import TextImageAnimation from "./TextImageAnimation";

export default function LandingPage() {
    return (
        <div className="relative min-h-screen bg-white text-black overflow-x-hidden">
            <Navigation/>
            <div className="pt-32">
                <HeroSection/>
                <Jumbotron/>
                <TextImageAnimation/>
            </div>
        </div>
    );
}