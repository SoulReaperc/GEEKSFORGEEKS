"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import GlassyNavbar from "./components/GlassyNavbar";
import Squares from "./components/Squares";

export default function NotFound() {
    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Squares
                    speed={0.5}
                    squareSize={40}
                    direction="diagonal"
                    borderColor="#333"
                    hoverFillColor="#222"
                />
            </div>

            {/* Navbar */}
            <GlassyNavbar />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                <div className="text-center max-w-lg">
                    {/* 404 Number */}
                    <h1
                        className="font-sf-pro text-8xl md:text-9xl font-bold mb-6"
                        style={{
                            background: "linear-gradient(135deg, #ffffff 0%, #46b94e 50%, #ffffff 100%)",
                            backgroundSize: "200% 200%",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            animation: "gradient-shift 3s ease infinite",
                        }}
                    >
                        404
                    </h1>

                    {/* Glassy Card */}
                    <div
                        className="p-8 rounded-2xl backdrop-blur-md"
                        style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(70, 185, 78, 0.3)",
                        }}
                    >
                        <h2
                            className="font-sf-pro text-2xl md:text-3xl font-semibold mb-4"
                            style={{ color: "#46b94e" }}
                        >
                            Dimension Not Found
                        </h2>

                        <p
                            className="font-sf-pro text-base md:text-lg mb-6"
                            style={{ color: "rgba(255, 255, 255, 0.8)", lineHeight: 1.7 }}
                        >
                            Looks like you&apos;ve wandered into an unknown dimension. 
                            This page doesn&apos;t exist in our timeline.
                        </p>

                        {/* Home Button */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
                            style={{
                                background: "rgba(70, 185, 78, 0.2)",
                                border: "1px solid #46b94e",
                                color: "white",
                            }}
                        >
                            <Home className="w-5 h-5" />
                            <span>Back to Home</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style jsx>{`
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
}
