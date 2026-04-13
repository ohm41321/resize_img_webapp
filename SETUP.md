# Image Size Reducer - Quick Setup

## Local Development

### 1. Install Dependencies
```bash
# Install frontend dependencies
cd react-app
npm install

# Install API dependencies
cd api
npm install
cd ..
```

### 2. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

### Method 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd react-app
vercel
```

### Method 2: GitHub
1. Push code to GitHub
2. Go to vercel.com
3. Import your repository
4. Deploy!

## Important Notes

- Images are processed server-side using Sharp
- Processed images are returned as base64 (no file storage needed)
- Works perfectly on Vercel's serverless platform
- No external dependencies required

## Tech Stack
- React 18 + Vite
- TailwindCSS
- Sharp (image processing)
- Vercel Serverless Functions
