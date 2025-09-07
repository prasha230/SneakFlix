# 📚 SneakFlix API Documentation

## 🚀 Swagger UI Access

Once your SneakFlix server is running, you can access the interactive API documentation at:

**Local Development:**
```
http://localhost:3000/api-docs
```

**Raspberry Pi Deployment:**
```
http://[YOUR_PI_IP]:3000/api-docs
```

## 📋 API Overview

The SneakFlix API provides comprehensive endpoints for:

### 🎬 Movies
- **GET** `/api/movies` - Get all movies with optional filtering
- **GET** `/api/movies/search` - Search movies by various criteria
- **GET** `/api/movies/{id}` - Get detailed movie information
- **POST** `/api/movies/{id}/watch` - Update watch statistics

### 🎞️ Streaming
- **GET** `/api/stream/{id}` - Stream video with range request support
- **GET** `/api/subtitles/{id}/{filename}` - Get subtitle files (SRT/WebVTT)
- **GET** `/api/thumbnail/{id}` - Get movie thumbnails (if available)

### ⚙️ Administration
- **POST** `/api/scan` - Scan media directory for new movies
- **GET** `/api/info` - Get server information and status
- **POST** `/api/settings/media-path` - Update media directory path

## 🔧 Key Features

### HTTP Range Requests
The streaming endpoint supports HTTP range requests for:
- ✅ **Video Seeking** - Jump to any position in the video
- ✅ **Bandwidth Optimization** - Only download what's being watched
- ✅ **Resume Playback** - Continue from where you left off

### Subtitle Support
- ✅ **Multiple Formats** - SRT, WebVTT, ASS/SSA support
- ✅ **Auto-Conversion** - SRT files automatically converted to WebVTT
- ✅ **Language Detection** - Automatic language detection from filenames

### Search & Filtering
- ✅ **Full-Text Search** - Search by movie title
- ✅ **Metadata Filtering** - Filter by year, resolution, format
- ✅ **Sorting Options** - Sort by title, year, watch count, date added

## 📖 Usage Examples

### Get All Movies
```bash
curl http://localhost:3000/api/movies
```

### Search Movies
```bash
curl "http://localhost:3000/api/movies/search?query=avengers&year=2019"
```

### Stream Video (with range request)
```bash
curl -H "Range: bytes=0-1023" http://localhost:3000/api/stream/1
```

### Scan Media Directory
```bash
curl -X POST http://localhost:3000/api/scan
```

## 🎯 Response Formats

All API responses follow consistent JSON formats:

### Success Response
```json
{
  "id": 1,
  "title": "Movie Title",
  "year": 2023,
  "resolution": "1080p",
  "format": "mp4",
  "watch_count": 5,
  "subtitles": ["movie.en.srt", "movie.es.srt"]
}
```

### Error Response
```json
{
  "error": "Movie not found"
}
```

## 🔒 CORS Configuration

The API is configured for local network access with permissive CORS settings suitable for home media servers.

## 📱 Integration

The API is designed to work seamlessly with:
- ✅ **React Frontend** - Full integration with SneakFlix UI
- ✅ **Mobile Apps** - RESTful API perfect for mobile development
- ✅ **Third-Party Players** - Standard streaming protocols
- ✅ **Home Automation** - JSON API for smart home integration

---

**📝 Note:** This documentation is automatically generated from the API code using Swagger/OpenAPI 3.0 specifications. For the most up-to-date and interactive documentation, always refer to the Swagger UI at `/api-docs`.
