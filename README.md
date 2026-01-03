# 📖 Kuran App

Cross-platform Quran application with multi-language support.

## Features

- 📚 Full Quran text (114 Surahs, 6,236+ Verses)
- 🌍 6 Language translations:
  - 🇹🇷 Turkish (Diyanet)
  - 🇬🇧 English (Sahih International)
  - 🇩🇪 German
  - 🇫🇷 French
  - 🇨🇳 Chinese
  - 🇸🇦 Arabic
- 🔍 Surah search functionality
- 📱 Mobile-first responsive design
- 🌐 Full UI localization

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── context/        # React Context providers
├── data/           # Quran data (JSON files)
└── i18n/           # Internationalization strings
```

## Data Sources

Quran text and translations from [AlQuran Cloud API](https://alquran.cloud/).

## License

MIT
