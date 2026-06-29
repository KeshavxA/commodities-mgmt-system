"use client";

import { X, Printer } from "lucide-react";
import { type Product } from "@/src/data/sampleProducts";
import { QRCodeSVG } from "qrcode.react";

interface PrintLabelModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function PrintLabelModal({ isOpen, onClose, product }: PrintLabelModalProps) {
    if (!isOpen || !product) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm print:bg-white print:p-0 print:backdrop-blur-none">
           
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 print:hidden">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Print Label</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    Verify the details below before printing. Make sure your printer is loaded with label stock.
                </p>

       
                <div className="mb-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-950">
                    <QRCodeSVG 
                        value={product.id} 
                        size={120} 
                        level="M"
                        includeMargin={false}
                        className="mb-4"
                    />
                    <div className="text-center">
                        <div className="font-mono text-xs font-semibold text-gray-500">{product.id}</div>
                        <div className="mt-1 font-bold text-gray-900 dark:text-white">{product.name}</div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                        <Printer className="h-4 w-4" />
                        Print Label
                    </button>
                </div>
            </div>

            <div className="hidden print:flex print:h-full print:w-full print:flex-col print:items-center print:justify-center print:bg-white print:text-black">
                <div className="flex flex-col items-center text-center">
                    <QRCodeSVG 
                        value={product.id} 
                        size={160} 
                        level="M"
                    />
                    <div className="mt-4 font-mono text-sm font-bold">{product.id}</div>
                    <div className="mt-1 text-lg font-bold">{product.name}</div>
                    {product.supplier && (
                        <div className="mt-1 text-xs text-gray-600">Supplier: {product.supplier}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
