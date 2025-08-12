# PrimeTime Work - Educational Platform

A modern educational platform for exam preparation and learning management.

## Recent Updates

### Major Webapp Refactor (Latest)
- **TypeScript Migration**: Converted React components from JSX to TSX for better type safety
- **Modern Build System**: Migrated from Create React App to Vite for faster development
- **UI/UX Enhancement**: Added new modern components with Tailwind CSS styling
- **Development Tools**: Integrated Prettier, ESLint, and comprehensive TypeScript configuration
- **Environment Management**: Added configurations for development, UAT, and production environments

## Project Structure

```
webapp/
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Shared components
│   │   ├── student/        # Student-specific components
│   │   ├── tutor/          # Tutor-specific components
│   │   └── ui/             # Reusable UI components
│   ├── theme/              # Theme configuration
│   ├── types/              # TypeScript type definitions
│   └── util/               # Utility functions
├── public/                 # Static assets
└── config files            # Build and dev configurations
```

## Getting Started

1. Navigate to the webapp directory:
   ```bash
   cd webapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: AWS Amplify
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier

## Copyright

All rights reserved - Copyright http://www.kodinghut.in/
