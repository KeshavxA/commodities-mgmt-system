"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (errorMessage: string) => void;
}

export default function BarcodeScanner({
    onScanSuccess,
    onScanError,
}: BarcodeScannerProps) {
    const scannerRegionId = "html5qr-code-full-region";
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        function onScanSuccessWrapper(decodedText: string) {
            // Once we have a successful scan, we can optionally pause/stop or just pass it up.
            // Often, it scans multiple times rapidly. We'll pass it up and let the parent handle closing the modal.
            onScanSuccess(decodedText);
        }

        function onScanErrorWrapper(errorMessage: string) {
            if (onScanError) {
                onScanError(errorMessage);
            }
        }

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
        };

        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            scannerRegionId,
            config,
            false // verbose flag
        );
        
        scannerRef.current = scanner;
        
        // Render the scanner
        scanner.render(onScanSuccessWrapper, onScanErrorWrapper);

        // Cleanup on unmount
        return () => {
            scanner.clear().catch((error) => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
            scannerRef.current = null;
        };
    }, [onScanSuccess, onScanError]);

    return (
        <div id={scannerRegionId} className="w-full h-full overflow-hidden rounded-xl bg-black" />
    );
}
