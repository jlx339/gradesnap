"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { CardSide } from "@/types";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  side: CardSide;
  frontImagePreview?: string | null;
}

export default function CameraCapture({ onCapture, onCancel, side, frontImagePreview }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Check if we're in a secure context (HTTPS or localhost)
      const isSecure = typeof window !== 'undefined' && (
        window.isSecureContext || 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      );
      
      if (!isSecure) {
        setError("Camera requires HTTPS. Please use the upload option instead, or access via localhost.");
        setIsCameraActive(false);
        return;
      }
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera not supported on this device. Please use the upload option instead.");
        setIsCameraActive(false);
        return;
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please use the upload option instead.");
      setIsCameraActive(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0);

    // Get the image data as base64
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    
    stopCamera();
    onCapture(imageData);
  }, [onCapture, stopCamera]);

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

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, [stopCamera]);

  useEffect(() => {
    if (facingMode && isCameraActive) {
      startCamera();
    }
  }, [facingMode]);

  const sideLabel = side === "front" ? "Front" : "Back";
  const sideInstruction = side === "front" 
    ? "Capture the front of your card" 
    : "Now capture the back of your card";

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 bg-black/50 z-10 safe-top">
        <button
          onClick={() => {
            stopCamera();
            onCancel();
          }}
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
        <button onClick={switchCamera} className="text-white p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {isCameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Card overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-[360px] border-2 border-white/50 rounded-lg">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />
                {/* Scan line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent scan-line" />
                {/* Side label */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                  {sideLabel.toUpperCase()}
                </div>
              </div>
            </div>
            <p className="absolute bottom-24 text-white/80 text-sm text-center px-4">
              {sideInstruction}
            </p>
          </>
        ) : error ? (
          <div className="text-center px-6">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-white mb-6">{error}</p>
          </div>
        ) : (
          <div className="text-center px-6">
            <div className="text-white/60 mb-6">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
            <p className="text-white/80 mb-2">{sideInstruction}</p>
            <p className="text-white/50 text-sm">Use camera or upload an existing photo</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {/* Front image preview when capturing back */}
        {side === "back" && frontImagePreview && (
          <div className="absolute top-4 left-4 w-16 h-[90px] rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
            <Image
              src={frontImagePreview}
              alt="Front captured"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
              Front ✓
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 pt-4 pb-6 bg-black/50 safe-bottom">
        <div className="flex items-center justify-center gap-8">
          {/* Upload from Library button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <span className="text-white/60 text-xs">Library</span>
          </div>

          {/* Capture / Start Camera button */}
          <div className="flex flex-col items-center gap-2">
            {isCameraActive ? (
              <button
                onClick={captureImage}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-white/30 active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 rounded-full bg-red-500" />
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center active:bg-yellow-300 active:scale-95 transition-all shadow-lg shadow-yellow-400/30"
              >
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              </button>
            )}
            <span className="text-white/60 text-xs">{isCameraActive ? "Capture" : "Camera"}</span>
          </div>

          {/* Placeholder for symmetry */}
          <div className="w-14 flex flex-col items-center gap-2">
            <div className="w-14 h-14" />
            <span className="text-xs">&nbsp;</span>
          </div>
        </div>
      </div>

      {/* File input for photo library - NO capture attribute so it shows library picker */}
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
