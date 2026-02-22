'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function AdminSmoothScroll() {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {

        const scrollContainer = document.querySelector('main.overflow-y-auto')

        if (!scrollContainer) return


        const lenis = new Lenis({
            wrapper: scrollContainer,
            content: scrollContainer.firstElementChild ?? undefined,
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            autoResize: true,
        })

        lenisRef.current = lenis


        function raf(time: number) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)


        return () => {
            lenis.destroy()
        }
    }, [])

    return null
}
