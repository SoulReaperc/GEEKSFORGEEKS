"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Squares from "./components/Squares";

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error("Application Error:", error);
    }, [error]);

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

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                <div className="text-center max-w-lg">
                    {/* Error Icon */}
                    <div className="mb-6 flex justify-center">
                        <AlertTriangle
                            className="w-20 h-20"
                            style={{ color: "#ef4444" }}
                        />
                    </div>

                    {/* Error Title */}
                    <h1
                        className="font-sf-pro text-4xl md:text-5xl font-bold mb-6"
                        style={{ color: "#ef4444" }}
                    >
                        Something Went Wrong
                    </h1>

                    {/* Glassy Card */}
                    <div
                        className="p-8 rounded-2xl backdrop-blur-md"
                        style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                    >
                        <p
                            className="font-sf-pro text-base md:text-lg mb-4"
                            style={{ color: "rgba(255, 255, 255, 0.8)", lineHeight: 1.7 }}
                        >
                            An unexpected error occurred. Don&apos;t worry, even the best 
                            systems glitch sometimes.
                        </p>

                        {/* Error Message */}
                        {error?.message && (
                            <div
                                className="mb-6 p-3 rounded-lg font-mono text-sm"
                                style={{
                                    background: "rgba(0, 0, 0, 0.3)",
                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                    color: "rgba(239, 68, 68, 0.8)",
                                }}
                            >
                                {error.message}
                            </div>
                        )}

                        {/* Reset Button */}
                        <button
                            onClick={() => reset()}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                            style={{
                                background: "rgba(239, 68, 68, 0.2)",
                                border: "1px solid #ef4444",
                                color: "white",
                            }}
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span>Try Again</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
