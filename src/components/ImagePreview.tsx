"use client";

import Image from "next/image";
import { useState } from "react";

interface ImagePreviewProps {
  frontImageUrl: string;
  backImageUrl: string;
  onConfirm: () => void;
  onRetakeFront: () => void;
  onRetakeBack: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export default function ImagePreview({
  frontImageUrl,
  backImageUrl,
  onConfirm,
  onRetakeFront,
  onRetakeBack,
  onCancel,
  isProcessing,
}: ImagePreviewProps) {
  const [activeTab, setActiveTab] = useState<"front" | "back">("front");

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-2 bg-black safe-top">
        <button 
          onClick={onCancel} 
          className="text-white p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center" 
          disabled={isProcessing}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-white font-medium text-lg">Review Photos</span>
        <div className="w-10" />
      </div>

      {/* Tab Switcher */}
      <div className="flex-shrink-0 px-4 pt-2 pb-3">
        <div className="flex bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("front")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "front" 
                ? "bg-yellow-400 text-black" 
                : "text-white/70"
            }`}
          >
            Front
          </button>
          <button
            onClick={() => setActiveTab("back")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "back" 
                ? "bg-yellow-400 text-black" 
                : "text-white/70"
            }`}
          >
            Back
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image Preview */}
        <div className="px-4 pb-4">
          <div className="relative w-full max-w-sm mx-auto aspect-[2.5/3.5] rounded-lg overflow-hidden shadow-2xl bg-gray-900">
            <Image
              src={activeTab === "front" ? frontImageUrl : backImageUrl}
              alt={`${activeTab} of card`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          
          {/* Retake button for active side */}
          <button
            onClick={activeTab === "front" ? onRetakeFront : onRetakeBack}
            disabled={isProcessing}
            className="mt-3 w-full max-w-sm mx-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/10 text-white/80 text-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake {activeTab}
          </button>
        </div>

        {/* Both thumbnails */}
        <div className="px-4 pb-4">
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setActiveTab("front")}
              className={`relative w-20 h-28 rounded-lg overflow-hidden border-2 transition-colors ${
                activeTab === "front" ? "border-yellow-400" : "border-white/20"
              }`}
            >
              <Image
                src={frontImageUrl}
                alt="Front thumbnail"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] text-center py-0.5">
                Front
              </div>
            </button>
            <button
              onClick={() => setActiveTab("back")}
              className={`relative w-20 h-28 rounded-lg overflow-hidden border-2 transition-colors ${
                activeTab === "back" ? "border-yellow-400" : "border-white/20"
              }`}
            >
              <Image
                src={backImageUrl}
                alt="Back thumbnail"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] text-center py-0.5">
                Back
              </div>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pb-4">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-200 text-sm font-medium">Both sides captured</p>
                <p className="text-blue-200/70 text-xs mt-1">
                  We&apos;ll analyze both the front and back of your card for a more accurate grade estimate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions - Fixed at bottom */}
      <div className="flex-shrink-0 px-4 pt-3 pb-4 bg-black border-t border-white/10 safe-bottom">
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="w-full py-4 px-6 rounded-xl bg-yellow-400 text-black font-bold disabled:opacity-50 flex items-center justify-center gap-2 active:bg-yellow-300 transition-colors min-h-[56px]"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyzing both sides...
            </>
          ) : (
            "Grade Card"
          )}
        </button>
      </div>
    </div>
  );
}
