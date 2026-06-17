import { X, ScanLine } from "lucide-react";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(() => import("./BarcodeScanner"), { ssr: false });

interface ScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
}

export default function ScannerModal({
    isOpen,
    onClose,
    onScan,
}: ScannerModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity dark:bg-black/80"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200/50 transition-all dark:bg-gray-900 dark:ring-gray-800">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                            <ScanLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Scan Barcode / QR
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="relative overflow-hidden rounded-2xl bg-black">
                        <BarcodeScanner
                            onScanSuccess={(text) => {
                                // Once successfully scanned, trigger the onScan and close the modal
                                onScan(text);
                                onClose();
                            }}
                            onScanError={(err) => {
                                // Ignore noisy frame errors. Only log if you want debugging.
                                // console.warn(err);
                            }}
                        />
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Hold the code steady in front of the camera to automatically identify the commodity.
                    </p>
                </div>
            </div>
        </div>
    );
}
