"use client";
import { gsap } from "gsap";
import { type LenisRef, ReactLenis } from "lenis/react";
import { type ReactNode, useEffect, useRef } from "react";

export default function SmoothScrolling({ children }: { children: ReactNode }) {
	const lenisRef = useRef<LenisRef>(null);

	useEffect(() => {
		function update(time: number) {
			if (lenisRef.current?.lenis) {
				lenisRef.current.lenis.raf(time * 1000);
			}
		}

		gsap.ticker.add(update);

		return () => {
			gsap.ticker.remove(update);
		};
	}, []);

	return (
		<ReactLenis root ref={lenisRef} autoRaf={false}>
			{children}
		</ReactLenis>
	);
}
