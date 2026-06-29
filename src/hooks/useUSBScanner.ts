import { useEffect, useRef } from "react";

export function useUSBScanner(onScan: (scanned: string) => void, timeoutMs: number = 30) {
    const buffer = useRef<string>("");
    const lastKeyTime = useRef<number>(Date.now());

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Ignore modifier keys
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            
            const currentTime = Date.now();
            
            // If the time since the last keystroke is too long, it's a human typing, reset buffer
            if (currentTime - lastKeyTime.current > timeoutMs) {
                buffer.current = "";
            }
            
            if (e.key === "Enter") {
                if (buffer.current.length > 2) {
                    onScan(buffer.current);
                    buffer.current = "";
                    
                    // If the active element is an input, we might want to blur it or clear it
                    // so the scanner input doesn't mess it up, but it's fine.
                }
            } else if (e.key.length === 1) {
                // Printable character
                buffer.current += e.key;
            }
            
            lastKeyTime.current = currentTime;
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onScan, timeoutMs]);
}
