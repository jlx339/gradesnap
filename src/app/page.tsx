"use client";

import { useState, useCallback } from "react";
import CameraCapture from "@/components/CameraCapture";
import ImagePreview from "@/components/ImagePreview";
import GradingResults from "@/components/GradingResults";
import { AppStep, GradingResult, CardSide, CapturedImages } from "@/types";
import { compressImage } from "@/lib/image-utils";

export default function Home() {
  const [step, setStep] = useState<AppStep>("home");
  const [capturedImages, setCapturedImages] = useState<CapturedImages>({ front: null, back: null });
  const [currentSide, setCurrentSide] = useState<CardSide>("front");
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCaptureFront = useCallback((imageData: string) => {
    setCapturedImages(prev => ({ ...prev, front: imageData }));
    setCurrentSide("back");
    setStep("capture-back");
    setError(null);
  }, []);

  const handleCaptureBack = useCallback((imageData: string) => {
    setCapturedImages(prev => ({ ...prev, back: imageData }));
    setStep("preview");
    setError(null);
  }, []);

  const handleGrade = useCallback(async () => {
    if (!capturedImages.front || !capturedImages.back) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Compress images before sending to avoid payload size limits
      const [compressedFront, compressedBack] = await Promise.all([
        compressImage(capturedImages.front, 800, 0.7),
        compressImage(capturedImages.back, 800, 0.7),
      ]);

      const response = await fetch("/api/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          frontImage: compressedFront,
          backImage: compressedBack 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to grade card");
      }

      const result: GradingResult = await response.json();
      setGradingResult(result);
      setStep("results");
    } catch (err) {
      console.error("Grading error:", err);
      setError(err instanceof Error ? err.message : "Failed to grade card. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImages]);

  const handleReset = useCallback(() => {
    setStep("home");
    setCapturedImages({ front: null, back: null });
    setCurrentSide("front");
    setGradingResult(null);
    setError(null);
  }, []);

  const handleRetakeFront = useCallback(() => {
    setCapturedImages({ front: null, back: null });
    setCurrentSide("front");
    setStep("capture-front");
    setError(null);
  }, []);

  const handleRetakeBack = useCallback(() => {
    setCapturedImages(prev => ({ ...prev, back: null }));
    setCurrentSide("back");
    setStep("capture-back");
    setError(null);
  }, []);

  const handleBackToFrontCapture = useCallback(() => {
    setCurrentSide("front");
    setStep("capture-front");
  }, []);

  // Render based on current step
  if (step === "capture-front") {
    return (
      <CameraCapture 
        onCapture={handleCaptureFront} 
        onCancel={handleReset}
        side="front"
      />
    );
  }

  if (step === "capture-back") {
    return (
      <CameraCapture 
        onCapture={handleCaptureBack} 
        onCancel={handleBackToFrontCapture}
        side="back"
        frontImagePreview={capturedImages.front}
      />
    );
  }

  if (step === "preview" && capturedImages.front && capturedImages.back) {
    return (
      <ImagePreview
        frontImageUrl={capturedImages.front}
        backImageUrl={capturedImages.back}
        onConfirm={handleGrade}
        onRetakeFront={handleRetakeFront}
        onRetakeBack={handleRetakeBack}
        onCancel={handleReset}
        isProcessing={isProcessing}
      />
    );
  }

  if (step === "results" && gradingResult) {
    return <GradingResults result={gradingResult} onGradeAnother={handleReset} />;
  }

  // Home screen
  return (
    <main className="min-h-screen min-h-[-webkit-fill-available] flex flex-col safe-top">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo / Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30">
            <svg className="w-14 h-14 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-3">
          GradeSnap
        </h1>
        <p className="text-blue-200/80 text-center max-w-xs mb-8">
          Snap a photo, get an instant PSA grade estimate for your Pokemon cards
        </p>

        {/* Features */}
        <div className="w-full max-w-sm space-y-3 mb-8">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Front & Back Analysis</p>
              <p className="text-white/60 text-sm">Both sides for accurate grading</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
            <div>
              <p className="text-white font-medium">Camera or Upload</p>
              <p className="text-white/60 text-sm">Use your phone camera or gallery</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">PSA Scale Estimate</p>
              <p className="text-white/60 text-sm">Get grades from 1-10</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-sm mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={() => setStep("capture-front")}
          className="w-full max-w-sm py-4 px-6 rounded-xl bg-yellow-400 text-black font-bold text-lg shadow-lg shadow-yellow-400/30 active:bg-yellow-300 active:scale-[0.98] transition-all min-h-[56px]"
        >
          Grade Your Card
        </button>

        {/* Disclaimer */}
        <p className="text-white/40 text-xs text-center mt-6 max-w-xs px-4">
          This tool provides estimates only and is not affiliated with PSA.
          Results may vary from actual professional grades.
        </p>
      </div>

      {/* Footer */}
      <footer className="px-4 pb-4 pt-2 text-center safe-bottom">
        <p className="text-white/30 text-xs">
          Powered by AI • Free to use
        </p>
      </footer>
    </main>
  );
}
