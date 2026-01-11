# VoltX Frontend

React-based frontend for the VoltX adrenaline-driven social platform.

## Tech Stack

- **React 19.2.0** - UI library
- **TypeScript 5.9** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **TanStack Query** - Server state management
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=VoltX
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services
├── stores/        # Zustand stores
├── hooks/         # Custom React hooks
├── types/         # TypeScript interfaces
└── utils/         # Utility functions
```

## Features

- User authentication and profiles
- Social feed with posts and interactions
- Event creation and management
- Real-time notifications
- Responsive design
- Dark theme optimized for extreme sports