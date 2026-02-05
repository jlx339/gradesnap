# GradeSnap 📸

**Snap a photo, get an instant PSA grade estimate for your Pokemon cards.**

A mobile-first web application that uses AI to estimate PSA grades for Pokemon cards.

![GradeSnap](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

## Features

- **Front & Back Analysis**: Capture both sides for more accurate grading
- **Camera Capture**: Take photos directly from your phone
- **Image Upload**: Upload existing photos from your gallery
- **AI Grading**: Uses Nyckel's free card grading API for condition analysis
- **Combined Scoring**: 70/30 weighted average (front/back) like professional graders
- **PSA Estimate**: Maps conditions to estimated PSA grades (1-10 scale)
- **Confidence Scores**: See how confident the AI is in its assessment
- **Mobile-First**: Optimized for phone usage with PWA support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Grading API**: [Nyckel](https://nyckel.com/pretrained-classifiers/card-grading-condition) (Free)
- **Card Data**: [Pokemon TCG API](https://pokemontcg.io/) (Free)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pca_estimator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## How It Works

1. **Capture/Upload**: Take a photo of your Pokemon card or upload an existing image
2. **AI Analysis**: The image is sent to Nyckel's card grading classifier
3. **Condition Detection**: The AI identifies condition indicators (Corner Wear, Edge Wear, Mint, etc.)
4. **PSA Mapping**: Conditions are mapped to estimated PSA grades
5. **Results Display**: View your estimated grade with confidence scores

## Condition to PSA Mapping

| Condition | Estimated PSA |
|-----------|---------------|
| Gem Mint | 10 |
| Mint | 9-10 |
| Near Mint | 7-8 |
| Excellent | 6-7 |
| Very Good | 5-6 |
| Good | 4-5 |
| Fair | 2-3 |
| Poor | 1-2 |

## API Used

### Nyckel Card Grading API (Free)

This MVP uses Nyckel's free pretrained classifier which provides:
- 16 condition labels
- Confidence scores
- No API key required for basic usage

### Pokemon TCG API (Free)

For card identification and details:
- No API key required
- Rate limited to 1000 requests/day without key

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── grade/
│   │       └── route.ts    # Grading API endpoint
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page component
├── components/
│   ├── CameraCapture.tsx   # Camera/upload component
│   ├── GradingResults.tsx  # Results display
│   └── ImagePreview.tsx    # Image preview before grading
├── lib/
│   ├── nyckel.ts           # Nyckel API integration
│   └── pokemon-tcg.ts      # Pokemon TCG API integration
└── types/
    └── index.ts            # TypeScript types
```

## Future Improvements

- [ ] Add back-of-card analysis for better accuracy
- [ ] Integrate card identification (auto-detect which card)
- [ ] Add grading history with local storage
- [ ] Support for batch grading
- [ ] Add premium tier with Ximilar API for detailed analysis
- [ ] PWA offline support

## Disclaimer

This tool provides **estimates only** and is not affiliated with PSA (Professional Sports Authenticator). Results may vary significantly from actual professional grades. Many factors that affect grading (surface scratches, print lines, subtle centering issues) may not be detectable from photos.

## License

MIT

## Acknowledgments

- [Nyckel](https://nyckel.com/) for the free card grading classifier
- [Pokemon TCG API](https://pokemontcg.io/) for card data
- [Next.js](https://nextjs.org/) for the amazing framework
