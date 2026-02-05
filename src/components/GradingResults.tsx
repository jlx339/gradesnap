"use client";

import Image from "next/image";
import { useState } from "react";
import { GradingResult, getGradeColorClass, getGradeBgClass, CONDITION_TO_PSA } from "@/types";

interface GradingResultsProps {
  result: GradingResult;
  onGradeAnother: () => void;
}

export default function GradingResults({ result, onGradeAnother }: GradingResultsProps) {
  const [activeTab, setActiveTab] = useState<"combined" | "front" | "back">("combined");
  const { condition, confidence, estimatedPSA, frontResult, backResult, frontImageUrl, backImageUrl, card } = result;
  
  // Get top 5 predictions for display
  const topPredictions = result.allPredictions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  // Get grade for front/back
  const frontGrade = CONDITION_TO_PSA[frontResult.condition]?.grade || 5;
  const backGrade = CONDITION_TO_PSA[backResult.condition]?.grade || 5;

  // Extract year from set release date
  const releaseYear = card?.set.releaseDate 
    ? new Date(card.set.releaseDate).getFullYear() 
    : null;

  return (
    <div className="min-h-screen min-h-[-webkit-fill-available] bg-gradient-to-b from-blue-900 to-blue-950 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-blue-900/95 backdrop-blur-sm border-b border-white/10 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onGradeAnother} className="text-white p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white font-medium text-lg">Grading Results</span>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Card Images & Main Grade */}
        <div className="relative">
          {/* Both card thumbnails */}
          <div className="flex justify-center gap-3 mb-4">
            <div className="relative w-28 h-40 rounded-lg overflow-hidden shadow-xl ring-2 ring-white/20">
              <Image
                src={frontImageUrl}
                alt="Front of card"
                fill
                className="object-contain bg-gray-900"
                unoptimized
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1">
                Front
              </div>
            </div>
            <div className="relative w-28 h-40 rounded-lg overflow-hidden shadow-xl ring-2 ring-white/20">
              <Image
                src={backImageUrl}
                alt="Back of card"
                fill
                className="object-contain bg-gray-900"
                unoptimized
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1">
                Back
              </div>
            </div>
          </div>
          
          {/* Grade Badge */}
          <div className="flex justify-center">
            <div className={`${getGradeBgClass(estimatedPSA.grade)} rounded-2xl px-8 py-4 shadow-lg`}>
              <div className="text-center">
                <div className="text-white text-4xl font-black">{estimatedPSA.grade}</div>
                <div className="text-white/90 text-sm font-medium">PSA Estimate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Condition Label */}
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${getGradeColorClass(estimatedPSA.grade)}`}>
            {condition}
          </h2>
          <p className="text-white/60 mt-1">
            Estimated PSA Range: {estimatedPSA.range}
          </p>
        </div>

        {/* Card Identification */}
        {card ? (
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-start gap-4">
              {/* Card Reference Image */}
              <div className="relative w-20 h-28 rounded-lg overflow-hidden shadow-lg flex-shrink-0 ring-2 ring-purple-400/30">
                <Image
                  src={card.images.small}
                  alt={card.name}
                  fill
                  className="object-contain bg-gray-900"
                  unoptimized
                />
              </div>
              
              {/* Card Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-purple-300 text-xs font-medium">Card Identified</span>
                </div>
                
                <h3 className="text-white font-bold text-lg truncate">{card.name}</h3>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-xs w-14">Set:</span>
                    <span className="text-white/90 text-sm truncate">{card.set.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-xs w-14">Number:</span>
                    <span className="text-white/90 text-sm">
                      {card.number}/{card.set.printedTotal || "?"}
                    </span>
                  </div>
                  {releaseYear && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-xs w-14">Year:</span>
                      <span className="text-white/90 text-sm">{releaseYear}</span>
                    </div>
                  )}
                  {card.rarity && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-xs w-14">Rarity:</span>
                      <span className="text-white/90 text-sm">{card.rarity}</span>
                    </div>
                  )}
                </div>

                {/* TCGPlayer Link */}
                {card.tcgplayer?.url && (
                  <a
                    href={card.tcgplayer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-xs text-purple-300 hover:text-purple-200"
                  >
                    <span>View on TCGPlayer</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-white/60 text-sm">Card Not Identified</p>
                <p className="text-white/40 text-xs">Could not automatically identify this card from the image</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("combined")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "combined" 
                ? "bg-yellow-400 text-black" 
                : "text-white/70"
            }`}
          >
            Combined
          </button>
          <button
            onClick={() => setActiveTab("front")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "front" 
                ? "bg-yellow-400 text-black" 
                : "text-white/70"
            }`}
          >
            Front
          </button>
          <button
            onClick={() => setActiveTab("back")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "back" 
                ? "bg-yellow-400 text-black" 
                : "text-white/70"
            }`}
          >
            Back
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "combined" ? (
          <>
            {/* Combined Confidence */}
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm font-medium">Overall Confidence</span>
                <span className="text-white font-bold">{Math.round(confidence * 100)}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getGradeBgClass(estimatedPSA.grade)} transition-all duration-500`}
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
            </div>

            {/* Combined Predictions */}
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3">Condition Analysis (Combined)</h3>
              <div className="space-y-3">
                {topPredictions.map((prediction, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white/90 text-sm">{prediction.labelName}</span>
                        <span className="text-white/60 text-xs">
                          {Math.round(prediction.confidence * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all duration-500"
                          style={{ width: `${prediction.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grade Breakdown */}
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3">Grade Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Front (70% weight)</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getGradeColorClass(frontGrade)}`}>
                      {frontGrade}
                    </span>
                    <span className="text-white/60 text-sm">- {frontResult.condition}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Back (30% weight)</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getGradeColorClass(backGrade)}`}>
                      {backGrade}
                    </span>
                    <span className="text-white/60 text-sm">- {backResult.condition}</span>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-3 flex items-center justify-between">
                  <span className="text-white font-medium">Combined Grade</span>
                  <span className={`text-xl font-bold ${getGradeColorClass(estimatedPSA.grade)}`}>
                    {estimatedPSA.grade}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Individual Side Results */}
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-16 h-22 rounded-lg overflow-hidden">
                  <Image
                    src={activeTab === "front" ? frontImageUrl : backImageUrl}
                    alt={`${activeTab} of card`}
                    fill
                    className="object-contain bg-gray-900"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-white font-medium capitalize">{activeTab} Side Analysis</h3>
                  <p className={`text-lg font-bold ${getGradeColorClass(activeTab === "front" ? frontGrade : backGrade)}`}>
                    {activeTab === "front" ? frontResult.condition : backResult.condition}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm font-medium">Confidence</span>
                <span className="text-white font-bold">
                  {Math.round((activeTab === "front" ? frontResult.confidence : backResult.confidence) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getGradeBgClass(activeTab === "front" ? frontGrade : backGrade)} transition-all duration-500`}
                  style={{ width: `${(activeTab === "front" ? frontResult.confidence : backResult.confidence) * 100}%` }}
                />
              </div>
            </div>

            {/* Side Predictions */}
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3 capitalize">{activeTab} Predictions</h3>
              <div className="space-y-3">
                {(activeTab === "front" ? frontResult.predictions : backResult.predictions)
                  .slice(0, 5)
                  .map((prediction, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white/90 text-sm">{prediction.labelName}</span>
                          <span className="text-white/60 text-xs">
                            {Math.round(prediction.confidence * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 transition-all duration-500"
                            style={{ width: `${prediction.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* PSA Grade Scale */}
        <div className="bg-white/10 rounded-xl p-4">
          <h3 className="text-white font-medium mb-3">PSA Grade Scale Reference</h3>
          <div className="grid grid-cols-5 gap-1 text-center text-xs">
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((grade) => (
              <div
                key={grade}
                className={`py-2 rounded ${
                  estimatedPSA.grade === grade
                    ? `${getGradeBgClass(grade)} text-white font-bold`
                    : "bg-white/10 text-white/60"
                }`}
              >
                {grade}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>Gem Mint</span>
            <span>Poor</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-amber-200 text-sm font-medium">Estimation Only</p>
              <p className="text-amber-200/70 text-xs mt-1">
                This is an AI-powered estimate and may not match actual PSA grades. 
                Professional grading considers many factors that may not be visible in photos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-4 pb-4 bg-gradient-to-t from-blue-950 via-blue-950/95 to-transparent safe-bottom">
        <button
          onClick={onGradeAnother}
          className="w-full py-4 px-6 rounded-xl bg-yellow-400 text-black font-bold text-lg shadow-lg active:bg-yellow-300 active:scale-[0.98] transition-all min-h-[56px]"
        >
          Grade Another Card
        </button>
      </div>
    </div>
  );
}
