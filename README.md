# ZoomMaster Pro

![ZoomMaster Pro](https://img.shields.io/badge/ZoomMaster-Pro-1DA1F2?style=for-the-badge)
![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.0.0-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge)

ZoomMaster Pro is an enterprise-grade screen recording application with advanced smart zoom capabilities built with Next.js 15 and TypeScript. It enables users to create professional recordings with intelligent zoom focus, auto-captioning, and customizable themes.

## Features

- **Smart Zoom Technology**: Automatically focuses on important areas during screen recordings
- **Grid-based Manual Zoom**: Precise control with interactive grid system
- **Webcam Integration**: Overlay your webcam feed with customizable positioning
- **Auto-Captions**: Real-time speech recognition for generating captions
- **Multiple Themes**: Choose from Galactic, X, Dark, or Light themes
- **Snapshot Tool**: Capture still images during recordings
- **Pause/Resume**: Control your recording sessions
- **Highlight Mode**: Emphasize important content
- **Recording Playback**: Review recordings with zoom data visualization
- **Enterprise-Grade Architecture**: Modular, maintainable code structure

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Frontend**: React 18
- **Media APIs**:
  - MediaRecorder API
  - Canvas API
  - Web Speech API
- **Architecture**: Context API for state management, Custom hooks for logic separation

## Project Structure

```
zoommaster-pro/
├── src/
│   ├── app/                # Next.js app directory
│   │   ├── page.tsx        # Main application page
│   │   ├── layout.tsx      # Root layout
│   │   ├── globals.css     # Global CSS
│   │   └── Provider.tsx    # App providers wrapper
│   ├── components/         # UI components
│   │   ├── ui/             # Basic UI components
│   │   ├── recording/      # Recording-related components
│   │   ├── zoom/           # Zoom-related components
│   │   ├── effects/        # Visual effects components
│   │   └── ZoomMasterApp.tsx  # Main app component
│   ├── context/            # React Context providers
│   │   ├── ThemeContext.tsx    # Theme management
│   │   ├── RecordingContext.tsx # Recording state
│   │   ├── ZoomContext.tsx     # Zoom functionality
│   │   └── ConfigContext.tsx   # App configuration
│   ├── hooks/              # Custom React hooks
│   │   ├── useAutoZoom.ts      # Auto-zoom functionality
│   │   ├── useCanvasDrawing.ts # Canvas drawing logic
│   │   ├── useParticleEffect.ts # Particle animations
│   │   ├── useRecordingControl.ts # Recording controls
│   │   └── useSpeechRecognition.ts # Caption generation
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
│       ├── styles.ts       # Style generators
│       └── mediaUtils.ts   # Media handling utilities
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── next.config.js         # Next.js configuration
```

## Installation

### Prerequisites

- Node.js 18.17.0 or later
- npm 9.x.x or later (or yarn/pnpm)
- Modern web browser (Chrome, Firefox, Edge, or Safari)

### Windows Installation

1. **Install Node.js and npm**:
   - Download and install Node.js from [nodejs.org](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/zoommaster-pro.git
   cd zoommaster-pro
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Open your browser and navigate to `http://localhost:3000`

### macOS Installation

1. **Install Node.js and npm** (using Homebrew):
   ```bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install Node.js
   brew install node
   
   # Verify installation
   node --version
   npm --version
   ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/zoommaster-pro.git
   cd zoommaster-pro
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Open your browser and navigate to `http://localhost:3000`

### Linux Installation

1. **Install Node.js and npm** (Ubuntu/Debian):
   ```bash
   # Using Node.js version manager (nvm)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   source ~/.bashrc
   nvm install --lts
   
   # Verify installation
   node --version
   npm --version
   ```

   For other Linux distributions, refer to [Node.js downloads](https://nodejs.org/en/download/) or your distribution's package manager.

2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/zoommaster-pro.git
   cd zoommaster-pro
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Open your browser and navigate to `http://localhost:3000`

## Browser Permissions

When using ZoomMaster Pro, you'll need to grant these browser permissions:

1. **Screen Capture**: To record your screen
2. **Microphone Access**: For audio recording
3. **Camera Access**: For webcam overlay (optional)

## Using ZoomMaster Pro

1. **Starting a Recording**:
   - Click the "Start Recording" button
   - Select the screen, window, or tab you want to record
   - Grant necessary permissions if prompted

2. **Zoom Controls**:
   - **Auto Zoom**: Automatically focuses based on your activity
   - **Grid Zoom**: Click on the grid to focus on specific areas
   - **No Zoom**: Disable zooming completely

3. **Additional Features**:
   - Toggle webcam overlay with the camera button
   - Enable/disable speech recognition for captions
   - Take snapshots with the camera icon
   - Pause/resume recording as needed
   - Use highlight mode to emphasize content

4. **Ending a Recording**:
   - Click "Stop Recording"
   - The recording will be available for playback and download

5. **Customization**:
   - Change themes using the theme selector
   - Adjust webcam position with the dropdown
   - Modify zoom settings in the zoom control panel

## Production Deployment

### Building for Production

```bash
npm run build
```

### Running in Production

```bash
npm start
```

### Deploying to Vercel

ZoomMaster Pro is optimized for deployment on Vercel:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

Alternatively, connect your GitHub repository to Vercel for automatic deployments.

## Security Considerations

- All recordings are processed locally in the browser
- No data is sent to external servers by default
- The application requires camera and microphone permissions for full functionality

## Browser Compatibility

- Chrome: 88+
- Firefox: 90+
- Edge: 88+
- Safari: 14.1+

## Known Limitations

- Speech recognition requires Chrome or Edge browsers
- Performance may vary based on system specifications
- Mobile devices have limited support for screen recording APIs

## License

Private - All rights reserved

## Contributing

This is an enterprise project with restricted contributions. For internal contributors, please follow the company's contribution guidelines.

## Support

For enterprise support, please contact our team via the internal support channel.
