# GradeSnap - Design Document

**Snap a photo, get an instant PSA grade estimate.**

## 1. Overview

### 1.1 Problem Statement
Pokemon card collectors need a quick way to estimate the PSA (Professional Sports Authenticator) grade of their cards before deciding whether to submit them for professional grading. Professional grading costs $20-150+ per card and takes weeks, so having an accurate pre-grading estimate saves time and money.

### 1.2 Solution
**GradeSnap** is a mobile-first web application that allows users to photograph both sides of their Pokemon cards and receive an estimated PSA grade (1-10 scale) with detailed breakdown of condition factors.

### 1.3 Key Features
- **Card Photography**: Capture front and back of Pokemon cards using phone camera
- **Card Identification**: Automatically identify which card is being graded
- **Condition Analysis**: AI-powered analysis of corners, edges, surface, and centering
- **PSA Grade Estimation**: Estimated grade on PSA's 1-10 scale with confidence level
- **Grading Visualization**: Visual overlay showing detected issues and grades per area
- **History & Tracking**: Save grading history for collection management

---

## 2. PSA Grading Criteria

Understanding PSA's grading criteria is essential for accurate estimation:

| Grade | Name | Description |
|-------|------|-------------|
| 10 | Gem Mint | Perfect condition, 55/45 to 60/40 centering |
| 9 | Mint | Slight centering variance, minor imperfection |
| 8 | NM-MT | Slight wear on corners/edges visible under close inspection |
| 7 | Near Mint | Minor wear, light scratching |
| 6 | EX-MT | Noticeable wear on corners/edges |
| 5 | Excellent | Moderate wear, corner fraying |
| 4 | VG-EX | Obvious wear, small creases |
| 3 | Very Good | Heavy wear, creases, staining |
| 2 | Good | Extreme wear, major creases |
| 1 | Poor | Severe damage, heavy creases, tears |

### Grading Factors (Weight Distribution)
- **Centering**: ~25% (front/back alignment of borders)
- **Corners**: ~25% (sharpness, whitening, wear)
- **Edges**: ~25% (chipping, whitening, roughness)
- **Surface**: ~25% (scratches, print defects, stains, indentations)

---

## 3. Available APIs & Services

### 3.1 Card Grading APIs

---

### 🆓 FREE / LOW-COST OPTIONS

---

#### Option A: Nyckel Card Grading Classifier ⭐ FREE
**URL**: https://www.nyckel.com/v1/functions/card-grading-condition/invoke

**Capabilities**:
- Pretrained ML classifier for card conditions
- **16 condition labels**: Corner Wear, Damage, Discolored, Edge Wear, Excellent, Faded, Fair, Gem Mint, Good, Mint, Near Mint, Poor, Pristine, Scratched, Very Good, Worn
- Confidence scores for predictions
- Free API access available

**Example Code**:
```python
import requests

response = requests.post(
    'https://www.nyckel.com/v1/functions/card-grading-condition/invoke',
    headers={
        'Authorization': 'Bearer YOUR_BEARER_TOKEN',
        'Content-Type': 'application/json',
    },
    json={"data": "your_image_url"}
)
print(response.json())
```

**Pros**:
- FREE to use
- Simple API, easy integration
- Provides confidence scores
- Multiple condition labels

**Cons**:
- Less detailed than Ximilar (no individual corner/edge grades)
- No centering analysis
- Labels are categories, not 1-10 numeric grades

---

#### Option B: Roboflow Card Grader Model ⭐ FREE TIER (60k inferences/month)
**URL**: https://universe.roboflow.com/group-6-major-project/card-grader

**Free Tier**: $60/month in credits = ~60,000 inferences/month

**Capabilities**:
- Object detection model for card condition issues
- Detects: corner wear, edge wear, scratches, surface damage
- Can be self-hosted (completely free) using Roboflow Inference
- 632 training images

**Self-Hosted Option** (Completely Free):
```bash
# Install and run locally
pip install inference
inference server start

# Then call locally
curl -X POST "http://localhost:9001/infer/object_detection" \
  -H "Content-Type: application/json" \
  -d '{"image": "base64_encoded_image"}'
```

**Pros**:
- Generous free tier (60k/month)
- Can self-host for unlimited free usage
- Object detection shows WHERE issues are
- Open model, can be retrained/improved

**Cons**:
- Smaller training dataset (632 images)
- May need additional processing to convert detections to grades
- Less polished than commercial options

---

#### Option C: OpenAI GPT-4 Vision 💰 LOW COST (~$0.01-0.03/image)
**URL**: https://api.openai.com/v1/chat/completions

**Pricing**: ~$0.01-0.03 per image analysis (based on image size)

**Capabilities**:
- Analyze card images with natural language prompts
- Can be prompted to evaluate corners, edges, surface, centering
- Flexible - can output in any format you specify
- Can explain reasoning behind grades

**Example Code**:
```python
from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": """Analyze this Pokemon card image for PSA grading. 
                    Evaluate on a 1-10 scale:
                    1. Corners (check all 4 for whitening/wear)
                    2. Edges (check for chips/whitening)
                    3. Surface (scratches, print lines, stains)
                    4. Centering (estimate left/right and top/bottom ratios)
                    
                    Return JSON with individual scores and estimated PSA grade."""
                },
                {
                    "type": "image_url",
                    "image_url": {"url": "data:image/jpeg;base64,{base64_image}"}
                }
            ]
        }
    ],
    max_tokens=500
)
```

**Pros**:
- Very flexible, can customize evaluation criteria
- Provides explanations for grades
- No specialized model needed
- Good at identifying specific defects

**Cons**:
- Not specifically trained for card grading
- Results may vary (prompt engineering needed)
- Costs more than free options
- Rate limits on API

---

#### Option D: Google Cloud Vision ⭐ FREE TIER (1,000/month)
**URL**: https://cloud.google.com/vision

**Free Tier**: 1,000 units/month free + $300 new user credit

**Capabilities**:
- Label detection (identify card features)
- Object localization
- Image properties (colors, quality)
- OCR for card text

**Use Case**: Can be combined with custom logic:
1. Use Vision API to detect card boundaries
2. Extract corner/edge regions
3. Run custom analysis on extracted regions

**Pros**:
- 1,000 free calls/month
- Reliable, well-documented
- Good for preprocessing (card detection, cropping)

**Cons**:
- Not card-grading specific
- Would need custom logic layer
- More development work required

---

#### Option E: Open Source Self-Hosted Models ⭐ COMPLETELY FREE

**1. Mint Condition** (59 stars, most mature)
- GitHub: https://github.com/rthorst/mint_condition
- Trained on 90,000+ eBay cards with PSA grades
- ResNet-18 CNN architecture
- Includes API, front-end, and training scripts
- Sports cards focused but adaptable

**2. Poke Cardtel** (Pokemon-specific)
- GitHub: https://github.com/kevinni20021/Deerhacks-2024_Poke_Cardtel
- VGG16 architecture with transfer learning
- 90% accuracy on test set
- Trained on 40,000+ PSA-graded Pokemon cards
- Includes React Native app + Flask backend
- **MIT License** - can be used commercially

**3. Trading Card Grading Capstone**
- GitHub: https://github.com/BrianMillerS/trading_card_grading_capstone
- CNN-based baseball card grading
- Includes data scraping and training scripts

**Self-Hosting Advantages**:
- Completely free (no API costs)
- Full control over model
- Can retrain/improve with your own data
- No rate limits
- Privacy (images don't leave your server)

**Self-Hosting Challenges**:
- Requires ML/Python knowledge
- Need to host model (GPU recommended for fast inference)
- May need to retrain for Pokemon cards specifically
- Maintenance burden

---

### 💰 PAID OPTIONS (More Comprehensive)

---

#### Option F: Ximilar Card Grading API (Most Comprehensive)
**URL**: https://api.ximilar.com/card-grader/v2/grade

**Pricing**: Credit-based (~$0.05-0.15 per grading)

**Capabilities**:
- Full condition analysis (corners, edges, surface, centering)
- Individual grades for each corner and edge (1-10 scale)
- Centering ratio calculation (e.g., "57/43 left/right")
- Support for front + back images (weighted 70/30)
- Visual overlays showing detected regions and grades
- Processing time: 10-20 seconds per image

**Endpoints**:
```
POST /v2/grade      - Full grading (corners, edges, surface, centering)
POST /v2/condition  - Quick condition check (Near Mint, Played, Damaged)
POST /v2/centering  - Centering analysis only
POST /v2/localize   - Card detection and positioning
```

**Pros**:
- Most comprehensive grading API available
- Directly outputs PSA-style grades (1-10)
- Visual overlays for user feedback
- Supports multiple condition naming modes (eBay, TCGPlayer, etc.)

**Cons**:
- Costs money per request
- Requires high-resolution images (2000px+ recommended)
- Best suited for "soft grading" not exact PSA prediction

---

### 3.2 Card Identification APIs

#### Option A: GiblTCG Card Identify API
**URL**: https://gibltcg.com/api/predict-card

**Capabilities**:
- Image-based card identification
- 40,000+ cards database (Pokemon, Yu-Gi-Oh!, MTG)
- Returns card details, confidence scores
- SDKs for multiple languages

**Example Response**:
```json
{
  "card_type": "Pokemon",
  "side": "front",
  "matches": [
    { "card_id": "xy1-1", "name": "Venusaur EX", "confidence": 0.95 }
  ]
}
```

---

#### Option B: Pokemon TCG API (Official)
**URL**: https://api.pokemontcg.io/v2/cards

**Capabilities**:
- Official card database with images
- Search by name, set, type, rarity
- No image recognition (lookup only)
- Free tier available, no API key required for basic use

**Use Case**: After identifying card via GiblTCG, fetch detailed card info from this API

---

### 3.3 API Integration Strategy

**Recommended Approach**:
```
User Photo → GiblTCG (Card ID) → Pokemon TCG API (Card Details)
                              ↓
                        Ximilar (Grading) → PSA Estimate + Visualization
```

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile Client                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │  Camera   │  │  Gallery  │  │  Results  │  │  History  │    │
│  │  Capture  │  │  Upload   │  │  View     │  │  View     │    │
│  └─────┬─────┘  └─────┬─────┘  └───────────┘  └───────────┘    │
│        │              │                                          │
│        └──────────────┴──────────────┐                          │
│                                      ▼                          │
│                            ┌─────────────────┐                  │
│                            │  Image Handler  │                  │
│                            │  (Compression)  │                  │
│                            └────────┬────────┘                  │
└─────────────────────────────────────┼───────────────────────────┘
                                      │
                                      ▼ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                        Backend API Server                        │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   /upload    │    │   /grade     │    │   /history   │       │
│  │   endpoint   │    │   endpoint   │    │   endpoint   │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                   Service Layer                         │     │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │     │
│  │  │   Card     │  │  Grading   │  │   User     │        │     │
│  │  │   Service  │  │  Service   │  │   Service  │        │     │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │     │
│  └────────┼───────────────┼───────────────┼───────────────┘     │
│           │               │               │                      │
└───────────┼───────────────┼───────────────┼──────────────────────┘
            │               │               │
            ▼               ▼               ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│    GiblTCG API    │ │   Ximilar API     │ │    Database       │
│  (Card Identify)  │ │  (Card Grading)   │ │   (PostgreSQL)    │
└───────────────────┘ └───────────────────┘ └───────────────────┘
            │
            ▼
┌───────────────────┐
│  Pokemon TCG API  │
│  (Card Details)   │
└───────────────────┘
```

### 4.2 Tech Stack Recommendations

#### Frontend (Mobile-First Web App)
- **Framework**: Next.js 14+ with App Router (React)
- **Styling**: Tailwind CSS
- **Camera**: HTML5 MediaDevices API + `react-webcam`
- **PWA**: Service workers for offline history viewing
- **State**: Zustand or React Context

#### Backend
- **Runtime**: Node.js with Express or Fastify
- **Alternative**: Python FastAPI (if ML processing needed)
- **Database**: PostgreSQL (via Supabase or Neon)
- **Cache**: Redis (for API response caching)
- **Storage**: AWS S3 / Cloudflare R2 (for images)

#### Infrastructure
- **Hosting**: Vercel (frontend) + Railway/Render (backend)
- **Alternative**: Single deployment on Vercel with API routes

---

## 5. Data Models

### 5.1 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cards table (cached card info)
CREATE TABLE cards (
  id VARCHAR(50) PRIMARY KEY,  -- e.g., "xy1-1"
  name VARCHAR(255) NOT NULL,
  set_name VARCHAR(255),
  rarity VARCHAR(50),
  image_url TEXT,
  cached_at TIMESTAMP DEFAULT NOW()
);

-- Gradings table
CREATE TABLE gradings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  card_id VARCHAR(50) REFERENCES cards(id),
  
  -- Images
  front_image_url TEXT NOT NULL,
  back_image_url TEXT,
  
  -- Overall grades
  final_grade DECIMAL(3,1),  -- 1.0 - 10.0
  condition_label VARCHAR(50),  -- "Near Mint", "Excellent", etc.
  
  -- Component grades
  corners_grade DECIMAL(3,1),
  edges_grade DECIMAL(3,1),
  surface_grade DECIMAL(3,1),
  centering_grade DECIMAL(3,1),
  
  -- Centering details
  centering_lr VARCHAR(10),  -- "55/45"
  centering_tb VARCHAR(10),  -- "52/48"
  
  -- Visualization URLs
  visualization_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  api_response JSONB  -- Store full API response
);

-- Corner details (for detailed analysis)
CREATE TABLE corner_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grading_id UUID REFERENCES gradings(id),
  position VARCHAR(20),  -- "UPPER_LEFT", "UPPER_RIGHT", etc.
  grade DECIMAL(3,1),
  bounding_box JSONB
);

-- Edge details
CREATE TABLE edge_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grading_id UUID REFERENCES gradings(id),
  position VARCHAR(20),  -- "UPPER", "RIGHT", "DOWN", "LEFT"
  grade DECIMAL(3,1),
  bounding_box JSONB
);
```

### 5.2 API Response Types

```typescript
// Card identification result
interface CardIdentification {
  cardId: string;
  name: string;
  set: string;
  rarity: string;
  imageUrl: string;
  confidence: number;
}

// Grading result
interface GradingResult {
  id: string;
  card: CardIdentification;
  
  // Overall
  finalGrade: number;  // 1.0 - 10.0
  psaEstimate: number;  // Rounded PSA grade
  conditionLabel: string;
  confidence: string;  // "High", "Medium", "Low"
  
  // Components
  grades: {
    corners: number;
    edges: number;
    surface: number;
    centering: number;
  };
  
  // Centering details
  centering: {
    leftRight: string;  // "55/45"
    topBottom: string;  // "52/48"
  };
  
  // Individual corners/edges
  cornerDetails: Array<{
    position: string;
    grade: number;
  }>;
  edgeDetails: Array<{
    position: string;
    grade: number;
  }>;
  
  // Visualizations
  visualizations: {
    gradedOverlay: string;  // URL
    centeringOverlay: string;  // URL
  };
  
  // Recommendations
  recommendations: string[];
}
```

---

## 6. User Flow

### 6.1 Main Grading Flow

```
┌─────────────────┐
│   Home Screen   │
│  [Grade Card]   │
│  [History]      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Camera Screen  │
│                 │
│  ┌───────────┐  │
│  │  Preview  │  │
│  │           │  │
│  │   Card    │  │
│  │  Outline  │  │
│  └───────────┘  │
│                 │
│  [Capture]      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Capture Front  │ ──▶ │  Capture Back   │
│  "Front of card"│     │  "Back of card" │
│                 │     │  [Skip]         │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
            ┌─────────────────┐
            │    Processing   │
            │                 │
            │  "Analyzing     │
            │   your card..." │
            │                 │
            │  [Progress Bar] │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Results Screen │
            │                 │
            │  Card: Charizard│
            │  Set: Base Set  │
            │                 │
            │  ┌───────────┐  │
            │  │    8.5    │  │
            │  │  PSA Est. │  │
            │  └───────────┘  │
            │                 │
            │  Corners: 8.0   │
            │  Edges: 9.0     │
            │  Surface: 8.5   │
            │  Centering: 8.5 │
            │                 │
            │  [View Details] │
            │  [Save]         │
            │  [Grade Another]│
            └─────────────────┘
```

### 6.2 Detailed Results View

```
┌──────────────────────────────────────┐
│  Detailed Analysis                   │
│                                      │
│  ┌────────────────────────────────┐  │
│  │     Card Image with Overlay    │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │  [8.0]            [7.5]  │  │  │
│  │  │    ╔══════════════╗      │  │  │
│  │  │    ║              ║      │  │  │
│  │  │[9.0]║   Pokemon    ║[8.5]│  │  │
│  │  │    ║    Card      ║      │  │  │
│  │  │    ║              ║      │  │  │
│  │  │    ╚══════════════╝      │  │  │
│  │  │  [8.5]            [9.0]  │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
│                                      │
│  CORNERS                             │
│  ├─ Upper Left:  8.0 ████████░░     │
│  ├─ Upper Right: 7.5 ███████░░░     │
│  ├─ Lower Left:  8.5 ████████░░     │
│  └─ Lower Right: 9.0 █████████░     │
│                                      │
│  EDGES                               │
│  ├─ Top:    8.5 ████████░░          │
│  ├─ Right:  9.0 █████████░          │
│  ├─ Bottom: 8.0 ████████░░          │
│  └─ Left:   9.0 █████████░          │
│                                      │
│  CENTERING                           │
│  Left/Right: 55/45 (Within 60/40)   │
│  Top/Bottom: 52/48 (Excellent)      │
│                                      │
│  SURFACE                             │
│  Grade: 8.5                          │
│  Notes: Minor print lines visible    │
│                                      │
│  ──────────────────────────────────  │
│                                      │
│  RECOMMENDATIONS                     │
│  • Card likely to grade PSA 8-9     │
│  • Upper right corner shows wear    │
│  • Consider submission for grading  │
│                                      │
└──────────────────────────────────────┘
```

---

## 7. API Endpoints

### 7.1 Backend API Design

```yaml
# Card Grading Endpoints

POST /api/v1/grade
  Description: Submit card images for grading
  Request:
    - front_image: File (required)
    - back_image: File (optional)
  Response:
    - grading_id: string
    - status: "processing" | "complete" | "failed"

GET /api/v1/grade/{grading_id}
  Description: Get grading results
  Response:
    - GradingResult object

POST /api/v1/identify
  Description: Identify card from image
  Request:
    - image: File
  Response:
    - CardIdentification object

# History Endpoints

GET /api/v1/history
  Description: Get user's grading history
  Query:
    - page: number
    - limit: number
  Response:
    - items: GradingResult[]
    - total: number

GET /api/v1/history/{grading_id}
  Description: Get specific grading from history
  Response:
    - GradingResult object

DELETE /api/v1/history/{grading_id}
  Description: Delete grading from history
```

### 7.2 External API Integration

```typescript
// Ximilar API integration
async function gradeCard(frontImage: Buffer, backImage?: Buffer): Promise<XimilarResponse> {
  const records = [
    { _base64: frontImage.toString('base64'), Side: 'Front' }
  ];
  
  if (backImage) {
    records.push({ _base64: backImage.toString('base64'), Side: 'Back' });
  }
  
  const response = await fetch('https://api.ximilar.com/card-grader/v2/grade', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${XIMILAR_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ records })
  });
  
  return response.json();
}

// GiblTCG API integration
async function identifyCard(image: Buffer): Promise<CardIdentification> {
  const formData = new FormData();
  formData.append('file', new Blob([image]));
  
  const response = await fetch('https://gibltcg.com/api/predict-card', {
    method: 'GET',  // or POST with file
    headers: {
      'Authorization': `Bearer ${GIBLTCG_API_KEY}`
    }
  });
  
  return response.json();
}

// Pokemon TCG API integration
async function getCardDetails(cardId: string): Promise<PokemonCard> {
  const response = await fetch(`https://api.pokemontcg.io/v2/cards/${cardId}`, {
    headers: {
      'X-Api-Key': POKEMON_TCG_API_KEY  // Optional but recommended
    }
  });
  
  return response.json();
}
```

---

## 8. Image Requirements & Processing

### 8.1 Optimal Image Requirements

For best grading accuracy:

| Requirement | Specification |
|-------------|---------------|
| Resolution | Minimum 2000px on shorter side |
| Format | JPEG or PNG |
| Lighting | Even, diffused light (no glare) |
| Background | Plain, contrasting color |
| Angle | Perpendicular to card (no tilt) |
| Focus | Sharp, clear focus on card |
| Sleeves | Remove from sleeves/slabs |

### 8.2 Image Processing Pipeline

```typescript
async function processImage(file: File): Promise<ProcessedImage> {
  // 1. Validate file type
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // 2. Load image
  const img = await loadImage(file);
  
  // 3. Check resolution
  const minDimension = Math.min(img.width, img.height);
  if (minDimension < 1000) {
    console.warn('Low resolution image may affect accuracy');
  }
  
  // 4. Resize if too large (keep aspect ratio)
  const maxDimension = 4000;
  let processedImg = img;
  if (Math.max(img.width, img.height) > maxDimension) {
    processedImg = resizeImage(img, maxDimension);
  }
  
  // 5. Optimize for upload
  const compressed = await compressImage(processedImg, {
    quality: 0.9,
    format: 'jpeg'
  });
  
  return {
    buffer: compressed,
    width: processedImg.width,
    height: processedImg.height,
    originalSize: file.size,
    compressedSize: compressed.byteLength
  };
}
```

### 8.3 Camera Capture Guidelines UI

```
┌────────────────────────────────────────┐
│           Card Capture Guide           │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │     ┌──────────────────────┐     │  │
│  │     │                      │     │  │
│  │     │                      │     │  │
│  │     │    Align card here   │     │  │
│  │     │                      │     │  │
│  │     │                      │     │  │
│  │     └──────────────────────┘     │  │
│  │                                  │  │
│  │  ✓ Good lighting                 │  │
│  │  ✓ No glare detected             │  │
│  │  ✗ Card slightly tilted          │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Tips:                                 │
│  • Use natural daylight               │
│  • Remove card from sleeve            │
│  • Hold camera parallel to card       │
│  • Avoid shadows on the card          │
│                                        │
│            [📸 Capture]                │
└────────────────────────────────────────┘
```

---

## 9. Cost Analysis

### 9.1 API Costs Comparison

| Service | Pricing Model | Cost per Grade | Free Tier |
|---------|---------------|----------------|-----------|
| **Nyckel** | Free API | **$0.00** | ✅ Free |
| **Roboflow** | Credits | **$0.00** | ✅ 60k/month |
| **Self-Hosted (Poke Cardtel)** | Self-hosted | **$0.00** | ✅ Unlimited |
| **GPT-4 Vision** | Per token | ~$0.01-0.03 | ❌ |
| **Google Cloud Vision** | Per unit | ~$0.0015 | ✅ 1k/month |
| **Ximilar** | Credits | ~$0.05-0.15 | ❌ |

### 9.2 Cost Scenarios

#### Scenario A: Completely Free Stack
```
Per card grading:
├─ Card Identification:    $0.00 (Pokemon TCG API)
├─ Grading (Nyckel):       $0.00 (Free API)
├─ Image Storage:          $0.00 (Cloudflare R2 free tier)
├─ Hosting:                $0.00 (Vercel hobby)
└─ Total:                  $0.00 per card
```

#### Scenario B: Low-Cost with GPT-4 Vision
```
Per card grading:
├─ Card Identification:    $0.00 (Pokemon TCG API)
├─ Grading (GPT-4o):       $0.02 (avg per image)
├─ Image Storage:          $0.001
└─ Total:                  ~$0.02 per card
```

#### Scenario C: Premium with Ximilar
```
Per card grading:
├─ Card Identification:    $0.01 (GiblTCG)
├─ Ximilar Grading:        $0.10
├─ Image Storage:          $0.001
└─ Total:                  ~$0.11 per card
```

### 9.3 Recommended Approach: Hybrid

Start with free options, upgrade as needed:

1. **MVP**: Use Nyckel (free) for basic grading
2. **Enhanced**: Add GPT-4 Vision for detailed analysis (~$0.02/grade)
3. **Premium**: Offer Ximilar grading as premium feature (~$0.10/grade)

### 9.4 Monetization Options

1. **Freemium**: Unlimited basic grades (Nyckel), premium detailed analysis (GPT-4/Ximilar)
2. **Ad-supported**: Free with ads
3. **Subscription**: $4.99/month for detailed grading features
4. **Tip jar**: Free app, optional donations

---

## 10. MVP Feature Scope

### Phase 1: MVP (4-6 weeks)

- [ ] Camera capture for front image
- [ ] Integration with Ximilar API for grading
- [ ] Basic card identification
- [ ] Results display with overall grade
- [ ] Simple grade breakdown (corners, edges, surface, centering)
- [ ] Mobile-responsive UI
- [ ] Basic history (local storage)

### Phase 2: Enhanced (2-3 weeks)

- [ ] Back image capture and combined grading
- [ ] Detailed visualization overlays
- [ ] User accounts and cloud history
- [ ] Card identification with Pokemon TCG API integration
- [ ] Grade comparison with actual PSA submissions

### Phase 3: Advanced (2-3 weeks)

- [ ] Collection management
- [ ] Value estimation (PSA price data)
- [ ] Batch grading
- [ ] Export/share results
- [ ] Grading tips based on detected issues
- [ ] Historical grade tracking for same card

---

## 11. Technical Challenges & Mitigations

### 11.1 Image Quality Variance

**Challenge**: User photos vary wildly in quality, lighting, and angle.

**Mitigations**:
- Real-time camera feedback (glare detection, alignment guides)
- Pre-processing pipeline to normalize images
- Clear instructions and examples
- Confidence scores to indicate reliability

### 11.2 PSA Grade Accuracy

**Challenge**: AI grading may not perfectly match PSA's human graders.

**Mitigations**:
- Present as "estimate" not definitive grade
- Show confidence intervals (e.g., "likely PSA 8-9")
- Collect user feedback on actual PSA results
- Continuous model improvement

### 11.3 API Rate Limits & Costs

**Challenge**: External API costs can scale quickly.

**Mitigations**:
- Implement request queuing and caching
- Rate limit users appropriately
- Cache card identification results
- Consider hybrid approach (basic on-device, detailed via API)

---

## 12. Future Considerations

### 12.1 On-Device ML

Explore running simpler models directly on device:
- TensorFlow.js for browser-based inference
- Corner/edge detection could run locally
- Only send to API for detailed surface analysis

### 12.2 Community Features

- Share gradings with community
- Compare grades across users
- Leaderboards for collection value
- Trading/marketplace integration

### 12.3 Expanded Card Support

- Yu-Gi-Oh! cards
- Magic: The Gathering
- Sports cards (already supported by Ximilar)
- Other TCGs

---

## 13. Summary

### Recommended Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 + Tailwind CSS |
| Backend | Next.js API Routes (or FastAPI) |
| Database | PostgreSQL (Supabase) |
| Storage | Cloudflare R2 (free tier) |
| Grading API | Nyckel (free) or GPT-4 Vision |
| Card ID | Pokemon TCG API (free) |
| Hosting | Vercel (free tier) |

### Key API Integrations (Free Options First)

#### Free Grading APIs

1. **Nyckel Card Grading** (FREE)
   - URL: `https://www.nyckel.com/v1/functions/card-grading-condition/invoke`
   - 16 condition labels with confidence scores
   - Best for: MVP, basic grading
   
2. **Roboflow Card Grader** (FREE - 60k/month)
   - URL: `https://universe.roboflow.com/group-6-major-project/card-grader`
   - Can self-host for unlimited free usage
   - Best for: Detecting specific defect locations

3. **Poke Cardtel** (FREE - Self-hosted)
   - GitHub: `https://github.com/kevinni20021/Deerhacks-2024_Poke_Cardtel`
   - 90% accuracy, trained on 40k Pokemon cards
   - Best for: Full control, no API costs

#### Low-Cost Options

4. **GPT-4 Vision** (~$0.02/image)
   - Flexible prompting for detailed analysis
   - Best for: Detailed explanations, premium feature

5. **Ximilar** (~$0.10/grade)
   - Most comprehensive, visual overlays
   - Best for: Premium tier offering

#### Card Identification

6. **Pokemon TCG API** (FREE)
   - URL: `https://api.pokemontcg.io/v2/cards`
   - Card details and official images
   - No API key required for basic use

### Quick Start (Free Stack)

1. Set up Next.js project with camera capture
2. Integrate Nyckel API for free grading
3. Use Pokemon TCG API for card lookup
4. Deploy to Vercel (free)
5. Iterate based on feedback
6. Add premium features (GPT-4/Ximilar) later

### API Comparison Quick Reference

| API | Cost | Grading Style | Best For |
|-----|------|---------------|----------|
| Nyckel | Free | Labels (Gem Mint, Near Mint, etc.) | MVP |
| Roboflow | Free | Object detection (defect locations) | Visual feedback |
| GPT-4 Vision | ~$0.02 | Flexible (1-10 or labels) | Detailed analysis |
| Ximilar | ~$0.10 | PSA-style 1-10 with breakdowns | Premium feature |
| Self-hosted | Free | Depends on model | Full control |

---

*Document Version: 1.1*  
*Created: February 2026*  
*Updated: Added free API alternatives*
