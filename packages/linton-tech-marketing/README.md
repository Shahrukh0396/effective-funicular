# Linton Tech Marketing Website

A modern, high-performance marketing website built with Vue 3, Vite, and Tailwind CSS.

## 🚀 Features

### Modern UI/UX
- **Glassmorphism Effects**: Beautiful backdrop blur and transparency effects
- **Smooth Animations**: GSAP-powered scroll animations and micro-interactions
- **Responsive Design**: Mobile-first approach with perfect tablet and desktop support
- **Dark Mode Support**: Automatic dark mode detection and styling
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation and screen reader support

### Performance Optimizations
- **PWA Support**: Progressive Web App with service worker and offline capabilities
- **Code Splitting**: Automatic vendor chunk splitting for faster loading
- **Image Optimization**: WebP support with fallbacks
- **Font Loading**: Optimized Google Fonts loading with preloading
- **Bundle Analysis**: Built-in bundle analyzer for performance monitoring

### Developer Experience
- **TypeScript Support**: Full TypeScript integration with type checking
- **Hot Module Replacement**: Instant development feedback
- **ESLint + Prettier**: Consistent code formatting and linting
- **Testing Setup**: Vitest configuration with Vue Test Utils
- **Modern Tooling**: Latest Vite, Vue 3, and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite 4
- **Styling**: Tailwind CSS 3
- **Animations**: GSAP + Framer Motion
- **Icons**: Heroicons
- **Testing**: Vitest + Vue Test Utils
- **PWA**: Vite PWA Plugin
- **Type Checking**: Vue TSC

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Type checking
npm run type-check

# Code formatting
npm run format

# Bundle analysis
npm run analyze
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── ContactForm.vue
│   ├── LoadingSpinner.vue
│   ├── Navigation.vue
│   ├── PricingCard.vue
│   └── ToastContainer.vue
├── composables/         # Vue 3 composables
│   ├── useIntersectionObserver.js
│   ├── useScrollAnimation.js
│   └── useToast.js
├── views/              # Page components
│   ├── HomeView.vue
│   ├── ServicesView.vue
│   ├── PricingView.vue
│   └── ContactView.vue
├── stores/             # Pinia stores
├── services/           # API services
├── utils/              # Utility functions
├── assets/             # Static assets
└── test/               # Test files
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#3b82f6 → #8b5cf6)
- **Secondary**: Purple gradient (#8b5cf6 → #ec4899)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800, 900
- **Responsive**: Fluid typography with clamp()

### Components
- **Buttons**: Gradient backgrounds with hover effects
- **Cards**: Glassmorphism with backdrop blur
- **Forms**: Modern styling with validation
- **Navigation**: Sticky with smooth transitions

## 🚀 Performance Features

### Loading Optimizations
- **Route-based code splitting**
- **Critical CSS inlining**
- **Image lazy loading**
- **Font preloading**

### Caching Strategy
- **Service Worker**: Offline-first approach
- **Runtime caching**: API responses and assets
- **Static caching**: CSS, JS, and images

### Bundle Optimization
- **Tree shaking**: Unused code elimination
- **Minification**: Terser for JS, CSSNano for CSS
- **Gzip compression**: Automatic compression

## 📱 PWA Features

- **Offline Support**: Service worker caching
- **Install Prompt**: Add to home screen
- **Background Sync**: Offline form submissions
- **Push Notifications**: Real-time updates

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test ContactForm.test.js
```

## 🔧 Development

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Commitlint**: Conventional commit messages

### Development Workflow
1. Create feature branch
2. Make changes with tests
3. Run linting and tests
4. Submit pull request
5. Code review and merge

## 📊 Analytics & Monitoring

- **Core Web Vitals**: LCP, FID, CLS tracking
- **Error Tracking**: Sentry integration ready
- **Performance Monitoring**: Real User Monitoring
- **A/B Testing**: Feature flag support

## 🌐 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
```env
VITE_API_URL=https://api.lintontech.com
VITE_GA_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Deployment Platforms
- **Vercel**: Zero-config deployment
- **Netlify**: Git-based deployment
- **AWS S3**: Static hosting
- **Docker**: Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [docs.lintontech.com](https://docs.lintontech.com)
- **Issues**: [GitHub Issues](https://github.com/lintontech/marketing-website/issues)
- **Discord**: [Join our community](https://discord.gg/lintontech)

---

Built with ❤️ by the Linton Tech team 