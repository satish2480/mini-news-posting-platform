# Mini News Posting Platform


- `Mini News Posting Platform`
- `Breaking News API`
- `Live News Card Viewer`

The application lets a reporter post news, browse news, search by keyword, filter by date, and test a separate breaking-news API. MongoDB is the source, and Elasticsearch is used as an optional search engine for keyword queries

## Tech Stack

- Backend: `Node.js`, `Express.js`, `MongoDB`, `Mongoose`
- Frontend: `React`, `Vite`
- Search: `Elasticsearch`
- Local infrastructure: `Docker Compose`

## Implementation

### 1. Full-Stack Task

- Reporter can submit `headline`, `content`, `category`, `image`, `sourceName`, and `sourceUrl`
- News listing page with pagination
- Keyword search
- Date range filter
- India-context seed data
- Responsive React UI
- Loading skeletons while data is fetching
- Breaking-news strip at the top of the listing page

### 2. Backend-Only API Task

- `POST /api/breaking-news`
- `GET /api/breaking-news?category=xyz`
- Latest items returned first
- Default limit is `10`
- Pagination supported with `page` and `limit`

### 3. Frontend-Only Task

- React UI fetches API data
- Displays headline, date, category, image, and content preview
- Search works
- Date range filter works
- Responsive layout using CSS Grid/Flexbox
- Uses React hooks such as `useState`, `useEffect`, and custom hooks

## Stack Informantion

- `Node.js` 18+
- `npm`
- `Docker Desktop` or Docker Engine


### 1. Start MongoDB and Elasticsearch

From the project root:

```bash
docker compose up -d
```

This starts:

- MongoDB on `mongodb://127.0.0.1:27017`
- Elasticsearch on `http://127.0.0.1:9200`

### 2. Configure Environment Files

Backend:

```bash
copy backend\.env.example backend\.env
```

Frontend:

```bash
copy frontend\.env.example frontend\.env
```

If you are using Git Bash or another Unix-like shell, use:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Install Dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### 4. Seed Demo Data

From the `backend` folder:

```bash
npm run seed
```



### 5. Start the Backend

From the `backend` folder:

```bash
npm run dev
```

Backend base URL:

```text
http://localhost:5000
```

### 6. Start the Frontend

From the `frontend` folder:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173/#news
```

## One-Line Run Flow

After Docker is running:

```bash
docker compose up -d
cd backend && npm install && copy .env.example .env && npm run seed && start powershell -NoExit -Command "npm run dev"
cd ../frontend && npm install && copy .env.example .env && npm run dev
```

If you prefer, run backend and frontend in separate terminals for clarity.

## Docker Services

Defined in [docker-compose.yml](docker-compose.yml):

- `mongo`
- `elasticsearch`

Start services:

```bash
docker compose up -d
```

Stop services:

```bash
docker compose down
```

Stop services and remove volumes:

```bash
docker compose down -v
```

## Environment Variables

### Backend

Defined in [backend/.env.example](/backend/.env.example):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mini-news-platform
CLIENT_URL=http://localhost:5173
ELASTICSEARCH_URL=http://127.0.0.1:9200
ELASTICSEARCH_INDEX=news
```

### Frontend

Defined in [frontend/.env.example](frontend/.env.example):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## API Reference

Base API URL:

```text
http://localhost:5000/api
```

### Main News API

#### `POST /api/news`

Creates a news article for the main platform.

Example request:

```json
{
  "headline": "ISRO schedules next reusable launch vehicle test",
  "content": "Engineers completed the final round of ground checks before the next planned trial.",
  "category": "Science",
  "imageUrl": "https://example.com/image.jpg",
  "sourceName": "Demo Desk",
  "sourceUrl": "https://example.com/story",
  "timestamp": "2026-07-08T10:30:00.000Z"
}
```

Example `curl`:

```bash
curl -X POST http://localhost:5000/api/news ^
  -H "Content-Type: application/json" ^
  -d "{\"headline\":\"Metro extension approved in Bengaluru\",\"content\":\"State officials cleared the next phase of the metro corridor project.\",\"category\":\"Infrastructure\",\"sourceName\":\"Demo Desk\"}"
```

#### `GET /api/news`

Returns paginated news for the listing UI.

Supported query parameters:

- `search`
- `category`
- `startDate`
- `endDate`
- `page`
- `limit`

Examples:

```bash
curl "http://localhost:5000/api/news"
curl "http://localhost:5000/api/news?search=ISRO"
curl "http://localhost:5000/api/news?category=Sports&page=2&limit=8"
curl "http://localhost:5000/api/news?startDate=2026-07-01&endDate=2026-07-08"
```

Response shape:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 26,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Breaking News API

This is the API For backend-only task.

### `POST /api/breaking-news`

Accepts:

- `title` or `headline`
- `content`
- `category`
- optional `timestamp`
- optional `imageUrl`
- optional `sourceName`
- optional `sourceUrl`

Example:

```json
{
  "title": "Parliament session extended by one day",
  "content": "The session was extended to complete debate on the finance bill.",
  "category": "Politics",
  "timestamp": "2026-07-08T09:00:00.000Z"
}
```

Example `curl`:

```bash
curl -X POST http://localhost:5000/api/breaking-news ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Heavy rain alert issued in Mumbai\",\"content\":\"Authorities advised commuters to avoid waterlogged routes.\",\"category\":\"Weather\"}"
```

### `GET /api/breaking-news`

Returns the latest breaking news first.

Supported query parameters:

- `category`
- `page`
- `limit`

Examples:

```bash
curl "http://localhost:5000/api/breaking-news"
curl "http://localhost:5000/api/breaking-news?category=Weather"
curl "http://localhost:5000/api/breaking-news?category=Politics&page=1&limit=10"
```

Notes:

- Default limit is `10`
- Results are sorted by `timestamp` descending
- Response includes pagination metadata
- Response also includes `title` for compatibility with the task wording

## Search Implementation

### MongoDB Search

Without Elasticsearch, the backend performs case-insensitive matching against:

- `headline`
- `content`
- `category`

### Elasticsearch Search

When Elasticsearch is available and a `search` query is provided:

- news records are indexed into Elasticsearch
- keyword search is served from Elasticsearch
- MongoDB remains the source of truth for saved data

Elasticsearch is initialized from:

- [backend/src/config/elasticsearch.js](/backend/src/config/elasticsearch.js)
- [backend/src/services/searchService.js](backend/src/services/searchService.js)

## Database Design

Main schema file:

- [backend/src/models/News.js](backend/src/models/News.js)

Stored fields:

- `headline`
- `content`
- `category`
- `imageUrl`
- `sourceName`
- `sourceUrl`
- `timestamp`

Indexes:

- text index on `headline`, `content`, `category`
- compound index on `category` and `timestamp`

## Frontend Notes

Main UI includes:

- list view page at `#news`
- separate posting page at `#post`
- compact filters row
- loading skeletons
- flat card-based listing
- top breaking-news spotlight

Important frontend files:

- [frontend/src/App.jsx](frontend/src/App.jsx)
- [frontend/src/hooks/useNewsFeed.js](/frontend/src/hooks/useNewsFeed.js)
- [frontend/src/components/BreakingNewsBar.jsx](frontend/src/components/BreakingNewsBar.jsx)
- [frontend/src/components/NewsList.jsx](frontend/src/components/NewsList.jsx)
- [frontend/src/components/NewsForm.jsx](frontend/src/components/NewsForm.jsx)



### API Test

1. `GET /api/news`
2. `GET /api/news?search=ISRO`
3. `POST /api/news`
4. `GET /api/breaking-news?category=Weather`
5. `POST /api/breaking-news`
6. `GET /api/breaking-news?page=1&limit=10`

## Scripts

### Backend

```bash
npm run dev
npm start
npm run seed
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

