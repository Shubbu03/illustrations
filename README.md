# Ilustraciones 🎨

A real-time collaborative drawing platform where creativity meets collaboration. Draw together with friends, colleagues, or anyone around the world on the canvas.

## ✨ Features

### 🎨 **Intuitive Drawing Tools**

- **Pencil** - Free-hand drawing with smooth curves
- **Shapes** - Rectangles, circles, diamonds, and lines with arrow heads
- **Fill Tool** - Add colors to your shapes with a beautiful color palette
- **Eraser** - Remove elements with precision
- **Color Picker** - Choose from 10 beautiful preset colors

### 🌐 **Real-time Collaboration**

- **Live Drawing** - See everyone's strokes appear instantly as they draw
- **WebSocket Technology** - Ultra-low latency for seamless collaboration
- **Room-based Sessions** - Create private drawing rooms or join existing ones
- **Multi-user Support** - No limits on concurrent collaborators

### 🎯 **Canvas Features**

- **High DPI Support** - Crystal clear drawing on all devices
- **Theme Support** - Light and dark modes for comfortable drawing
- **Export** - Download your masterpieces as JPEG files
- **Share** - Easy sharing with room codes

### 🔐 **Authentication & Management**

- **Multiple Auth Options** - Google and GitHub OAuth integration
- **Personal Dashboard** - Manage all your illustrations in one place
- **Secure Sessions** - JWT-based authentication with NextAuth

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **TanStack Query** - Data fetching and state management
- **Lucide React** - Beautiful, customizable icons

### **Backend**

- **WebSocket Server** - Real-time communication with native WebSocket
- **NextAuth.js** - Authentication with OAuth providers
- **Prisma** - Type-safe database ORM
- **BullMQ** - Redis-based queue system for background jobs
- **JWT** - Secure token-based authentication

### **Infrastructure**

- **Turborepo** - Monorepo build system for scalability
- **Redis** - In-memory data store for queues and caching
- **PostgreSQL** - Robust relational database (via Prisma)
- **pnpm** - Fast, disk space efficient package manager

### **Development Tools**

- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking across the entire stack

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **pnpm** 9.0.0 or higher
- **Redis** (for queue system)
- **PostgreSQL** (for database)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ilustraciones.git
   cd ilustraciones
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ilustraciones"

   # Authentication
   NEXTAUTH_SECRET="your-secret-here"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"

   # JWT
   JWT_SECRET="your-jwt-secret"

   # WebSocket
   WS_URL="ws://localhost:8080"

   # Redis (for queue system)
   REDIS_URL="redis://localhost:6379"
   ```

4. **Set up the database**

   ```bash
   pnpm --filter @repo/db generate
   ```

5. **Start development servers**

   ```bash
   pnpm dev
   ```

   This will start:

   - **Web app** on `http://localhost:3000`
   - **WebSocket server** on `ws://localhost:8080`

## 📁 Project Structure

```
ilustraciones/
├── apps/
│   ├── web/                 # Next.js frontend application
│   └── ws-backend/          # WebSocket server for real-time features
├── packages/
│   ├── auth/               # Authentication utilities
│   ├── db/                 # Prisma database schema and client
│   ├── queue/              # BullMQ queue system
│   ├── types/              # Shared TypeScript types
│   ├── config/             # Shared configuration
│   ├── eslint-config/      # ESLint configuration
│   └── typescript-config/  # TypeScript configuration
└── README.md
```

## 🤝 Contributing

We welcome contributions from everyone! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features when applicable
- Update documentation as needed
- Ensure all checks pass before submitting PR
