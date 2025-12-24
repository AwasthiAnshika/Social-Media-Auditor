# Social Media Auditor

A comprehensive web application for auditing and analyzing social media profiles across multiple platforms including YouTube, Instagram, and TikTok. Generate detailed analytics reports, visualize performance metrics, and receive insights via email.

## Features

- **Multi-Platform Analysis**: Analyze profiles on YouTube, Instagram, and TikTok
- **Comprehensive Analytics**: Get insights on trends, hashtags, top performers, and performance metrics
- **Visual Reports**: Generate PDF reports with charts and visualizations
- **Email Integration**: Send detailed reports directly to your email
- **Real-time Data**: Fetch latest data from social media APIs
- **Responsive UI**: Modern, glass-morphism themed interface built with React

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Prisma** for database management
- **Redis** for caching
- **PDFKit** for report generation
- **Chart.js** for data visualization
- **SendGrid** for email services
- **Apify** for social media data scraping
- **Puppeteer** for web automation

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Modern UI** with glass-morphism design

## Project Structure

```
Social-Media-Auditor/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers for each platform
│   │   ├── services/        # Business logic and analytics
│   │   ├── routes/          # Express routes
│   │   ├── middlewares/     # Error handling, validation
│   │   ├── config/          # Database, Redis, CORS configs
│   │   └── utils/           # Helper functions
│   ├── tests/               # Integration tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   └── assets/          # Static assets
│   ├── public/              # Public assets
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (for Prisma)
- Redis
- API keys for social media platforms and services

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your API keys and configuration:
   - Database URL
   - Redis URL
   - SendGrid API key
   - Apify API token
   - Google Generative AI API key
   - OpenAI API key

4. Run database migrations (if using Prisma):
   ```bash
   npx prisma migrate dev
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Running Both Services

From the project root, you can install and run both services:

```bash
npm run install:all  # Install dependencies for both backend and frontend
npm run build:frontend  # Build the frontend
```

Then start the backend as above, and the frontend dev server.

## API Endpoints

- `GET /health` - Health check with database and Redis status
- `POST /analyze/youtube` - Analyze YouTube channel
- `POST /analyze/instagram` - Analyze Instagram profile
- `POST /analyze/tiktok` - Analyze TikTok profile
- `POST /email/send-report` - Send analytics report via email

## Testing

Run backend tests:
```bash
cd backend
npm test
```

## Deployment

### Backend
- Build for production: `npm run build`
- Start production server: `npm start`

### Frontend
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## Screenshots

![Social Media Auditor Logo](frontend/public/vite.svg)

*Add screenshots of the application here once available.*

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.