# ZoomMaster Pro

An enterprise-grade screen recording application with smart zoom capabilities for Next.js 15.

## Features

- Screen recording with smart zoom functionality
- Auto-zoom based on cursor movement and activity
- Grid-based manual zoom control
- Webcam overlay with customizable positioning
- Speech recognition for automatic captions
- Multiple themes (Galactic, X, Dark, Light)
- Video playback with zoom data visualization
- Screenshot capability

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- HTML5 Canvas API
- MediaRecorder API
- Web Speech API

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/zoommaster-pro.git

# Navigate to the project directory
cd zoommaster-pro

# Install dependencies
npm install

# Run the development server
npm run dev
```

## Usage

1. Open the application in your browser (http://localhost:3000)
2. Click "Start Recording" to begin capturing your screen
3. Use the side panel to control zoom features:
   - Grid mode: Click on dots to zoom to specific areas
   - Auto mode: Let the system detect focus areas based on your activity
   - Off mode: Disable all zoom features
4. Use the floating controls to:
   - Toggle webcam on/off
   - Toggle speech recognition on/off
   - Change webcam position
   - Take snapshots
   - Pause/resume recording
5. Click "Stop Recording" when finished
6. Review, replay, and download your recording

## Deployment

This project is configured for easy deployment on Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments.

## License

Private - All rights reserved

## Support

For enterprise support, please contact our team.