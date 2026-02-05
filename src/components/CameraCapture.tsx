"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { CardSide } from "@/types";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  side: CardSide;
  frontImagePreview?: string | null;
}

export default function CameraCapture({ onCapture, onCancel, side, frontImagePreview }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          onCapture(result);
        }
      };
      reader.readAsDataURL(file);
    },
    [onCapture]
  );

  const sideLabel = side === "front" ? "Front" : "Back";
  const sideInstruction = side === "front" 
    ? "Take a photo or select from your library" 
    : "Now capture the back of your card";

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-blue-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 z-10 safe-top">
        <button
          onClick={onCancel}
          className="text-white p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <span className="text-white font-medium text-lg">Card {sideLabel}</span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${side === "front" ? "bg-yellow-400" : "bg-white/30"}`} />
            <div className={`w-2 h-2 rounded-full ${side === "back" ? "bg-yellow-400" : "bg-white/30"}`} />
          </div>
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Card Icon */}
        <div className="mb-8">
          <div className="relative w-48 h-64 border-2 border-dashed border-white/30 rounded-xl flex items-center justify-center">
            {/* Corner markers */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />
            
            {/* Camera icon inside */}
            <svg className="w-16 h-16 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            
            {/* Side label */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
              {sideLabel.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-white text-lg font-medium text-center mb-2">
          {sideInstruction}
        </p>
        <p className="text-white/50 text-sm text-center mb-8">
          Position the card to fill the frame for best results
        </p>

        {/* Front image preview when capturing back */}
        {side === "back" && frontImagePreview && (
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 mb-8">
            <div className="relative w-12 h-16 rounded-lg overflow-hidden">
              <Image
                src={frontImagePreview}
                alt="Front captured"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Front captured</p>
              <p className="text-white/50 text-xs">Now capture the back</p>
            </div>
            <svg className="w-5 h-5 text-green-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="px-6 pt-4 pb-6 safe-bottom">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 px-6 rounded-xl bg-yellow-400 text-black font-bold text-lg shadow-lg shadow-yellow-400/30 active:bg-yellow-300 active:scale-[0.98] transition-all min-h-[56px] flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {side === "front" ? "Add Card Photo" : "Add Back Photo"}
        </button>
        <p className="text-white/40 text-xs text-center mt-3">
          Take a photo or choose from library
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
