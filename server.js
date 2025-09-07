const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const mime = require('mime-types');
const Database = require('./database');

const app = express();

// Load configuration if it exists
let config = {};
try {
    config = require('./config.js');
} catch (error) {
    console.log('No config.js found, using defaults');
}

const PORT = process.env.PORT || config.port || 3000;
const MEDIA_PATH = process.env.MEDIA_PATH || config.mediaPath || './media';

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SneakFlix API',
            version: '1.0.0',
            description: 'Local network media streaming server API for SneakFlix - your personal Netflix-like service',
            contact: {
                name: 'SneakFlix',
                email: 'support@sneakflix.local'
            },
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server',
            },
            {
                url: 'http://[PI_IP]:3000',
                description: 'Raspberry Pi server',
            },
        ],
        components: {
            schemas: {
                Movie: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'Unique movie ID' },
                        title: { type: 'string', description: 'Movie title' },
                        year: { type: 'integer', description: 'Release year' },
                        resolution: { type: 'string', description: 'Video resolution (e.g., 1080p)' },
                        format: { type: 'string', description: 'Video format (e.g., mp4, mkv)' },
                        file_path: { type: 'string', description: 'Relative path to video file' },
                        file_size: { type: 'integer', description: 'File size in bytes' },
                        duration: { type: 'integer', description: 'Duration in seconds' },
                        subtitles: { type: 'array', items: { type: 'string' }, description: 'Available subtitle files' },
                        watch_count: { type: 'integer', description: 'Number of times watched' },
                        last_watched: { type: 'string', format: 'date-time', description: 'Last watch timestamp' },
                        created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', description: 'Error message' }
                    }
                }
            }
        }
    },
    apis: ['./server.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SneakFlix API Documentation'
}));

// Serve React build or fallback to vanilla frontend
if (fs.existsSync('public-react')) {
    app.use(express.static('public-react'));
} else {
    app.use(express.static('public'));
}

// Ensure media directory exists
fs.ensureDirSync(MEDIA_PATH);

// Routes

// Serve the main page (React or vanilla)
app.get('/', (req, res) => {
    if (fs.existsSync('public-react')) {
        res.sendFile(path.join(__dirname, 'public-react', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Get all movies
 *     description: Retrieve a list of all movies in the media library with optional filtering
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, popular, favorites]
 *         description: Filter movies by category
 *     responses:
 *       200:
 *         description: List of movies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await db.getAllMovies();
        res.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

/**
 * @swagger
 * /api/movies/search:
 *   get:
 *     summary: Search movies
 *     description: Search movies by title, year, resolution, or format
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by release year
 *       - in: query
 *         name: resolution
 *         schema:
 *           type: string
 *         description: Filter by video resolution
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, year, created_at, watch_count]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
app.get('/api/movies/search', async (req, res) => {
    try {
        const { q } = req.query;
        const movies = await db.searchMovies(q);
        res.json(movies);
    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({ error: 'Failed to search movies' });
    }
});

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get movie details
 *     description: Retrieve detailed information about a specific movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await db.getMovieById(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).json({ error: 'Failed to fetch movie' });
    }
});

/**
 * @swagger
 * /api/movies/{id}/watch:
 *   post:
 *     summary: Update watch statistics
 *     description: Increment watch count and update last watched timestamp for a movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Watch stats updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Success message
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/movies/:id/watch', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        
        if (isNaN(movieId)) {
            return res.status(400).json({ error: 'Invalid movie ID' });
        }

        // Check if movie exists
        const movie = await db.getMovieById(movieId);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        // Update watch count and last watched timestamp
        await db.updateWatchStats(movieId);
        
        res.json({ success: true, message: 'Watch stats updated' });
    } catch (error) {
        console.error('Error updating watch stats:', error);
        res.status(500).json({ error: 'Failed to update watch stats' });
    }
});

/**
 * @swagger
 * /api/stream/{id}:
 *   get:
 *     summary: Stream video file
 *     description: Stream video content with support for HTTP range requests (seeking)
 *     tags: [Streaming]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Movie ID
 *       - in: header
 *         name: Range
 *         schema:
 *           type: string
 *         description: HTTP range header for partial content requests
 *         example: "bytes=0-1023"
 *     responses:
 *       200:
 *         description: Full video stream
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *       206:
 *         description: Partial video content (range request)
 *         headers:
 *           Content-Range:
 *             schema:
 *               type: string
 *             description: Range of bytes being served
 *           Accept-Ranges:
 *             schema:
 *               type: string
 *             description: Indicates server accepts range requests
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Movie or video file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/stream/:id', async (req, res) => {
    try {
        const movie = await db.getMovieById(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        const videoPath = path.join(MEDIA_PATH, movie.file_path);
        
        // Check if file exists
        if (!await fs.pathExists(videoPath)) {
            return res.status(404).json({ error: 'Video file not found' });
        }

        const stat = await fs.stat(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            // Support for range requests (seeking in video)
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': mime.lookup(videoPath) || 'video/mp4',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Range',
                'Access-Control-Expose-Headers': 'Content-Range, Content-Length',
            };
            
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            // No range request, serve entire file
            const head = {
                'Content-Length': fileSize,
                'Content-Type': mime.lookup(videoPath) || 'video/mp4',
                'Accept-Ranges': 'bytes',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Range',
                'Access-Control-Expose-Headers': 'Content-Length, Accept-Ranges',
            };
            
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).json({ error: 'Failed to stream video' });
    }
});

/**
 * @swagger
 * /api/subtitles/{id}/{filename}:
 *   get:
 *     summary: Get subtitle file
 *     description: Serve subtitle files with automatic SRT to WebVTT conversion
 *     tags: [Streaming]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Movie ID
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Subtitle filename
 *         example: "movie.en.srt"
 *     responses:
 *       200:
 *         description: Subtitle file content
 *         content:
 *           text/vtt:
 *             schema:
 *               type: string
 *           text/srt:
 *             schema:
 *               type: string
 *       404:
 *         description: Movie or subtitle file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/subtitles/:id/:filename', async (req, res) => {
    try {
        const { id, filename } = req.params;
        const movie = await db.getMovieById(id);
        
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        // Parse subtitles from database
        let subtitles = [];
        if (movie.subtitles) {
            subtitles = typeof movie.subtitles === 'string' 
                ? JSON.parse(movie.subtitles) 
                : movie.subtitles;
        }

        // Check if the requested subtitle file exists in the movie's subtitle list
        if (!subtitles.includes(filename)) {
            return res.status(404).json({ error: 'Subtitle file not found in movie data' });
        }

        // Get the directory of the video file
        const videoPath = movie.file_path;
        const videoDir = path.dirname(videoPath);
        const subtitlePath = path.join(MEDIA_PATH, videoDir, filename);

        // Check if subtitle file exists
        if (!await fs.pathExists(subtitlePath)) {
            return res.status(404).json({ error: 'Subtitle file not found on disk' });
        }

        // Determine content type based on file extension
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'text/plain';
        
        switch (ext) {
            case '.srt':
                contentType = 'text/srt';
                break;
            case '.vtt':
                contentType = 'text/vtt';
                break;
            case '.ass':
            case '.ssa':
                contentType = 'text/x-ssa';
                break;
            default:
                contentType = 'text/plain';
        }

        // Set headers for subtitle serving
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Range');
        
        // If it's an SRT file, we might need to convert it to WebVTT for better browser support
        if (ext === '.srt') {
            try {
                const srtContent = await fs.readFile(subtitlePath, 'utf8');
                const vttContent = convertSrtToVtt(srtContent);
                res.setHeader('Content-Type', 'text/vtt');
                res.send(vttContent);
            } catch (error) {
                console.error('Error converting SRT to VTT:', error);
                // Fallback to serving the original file
                fs.createReadStream(subtitlePath).pipe(res);
            }
        } else {
            // Serve the subtitle file directly
            fs.createReadStream(subtitlePath).pipe(res);
        }

    } catch (error) {
        console.error('Error serving subtitle:', error);
        res.status(500).json({ error: 'Failed to serve subtitle' });
    }
});

// Helper function to convert SRT to WebVTT format
function convertSrtToVtt(srtContent) {
    let vttContent = 'WEBVTT\n\n';
    
    // Replace SRT timestamp format (00:00:00,000) with WebVTT format (00:00:00.000)
    vttContent += srtContent
        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
        .replace(/\r\n|\r/g, '\n');
    
    return vttContent;
}

// Get thumbnail
app.get('/api/thumbnail/:id', async (req, res) => {
    try {
        const movie = await db.getMovieById(req.params.id);
        if (!movie || !movie.thumbnail) {
            return res.status(404).json({ error: 'Thumbnail not found' });
        }

        const thumbnailPath = path.join(MEDIA_PATH, 'thumbnails', movie.thumbnail);
        
        if (!await fs.pathExists(thumbnailPath)) {
            return res.status(404).json({ error: 'Thumbnail file not found' });
        }

        res.sendFile(path.resolve(thumbnailPath));
    } catch (error) {
        console.error('Error serving thumbnail:', error);
        res.status(500).json({ error: 'Failed to serve thumbnail' });
    }
});

/**
 * @swagger
 * /api/scan:
 *   post:
 *     summary: Scan media directory
 *     description: Scan the media directory for new movies and update the database
 *     tags: [Administration]
 *     responses:
 *       200:
 *         description: Media scan completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 found:
 *                   type: integer
 *                   description: Number of video files found
 *                 added:
 *                   type: integer
 *                   description: Number of new movies added to database
 *                 updated:
 *                   type: integer
 *                   description: Number of existing movies updated
 *       500:
 *         description: Scan failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/scan', async (req, res) => {
    try {
        const MediaScanner = require('./mediaScanner');
        const scanner = new MediaScanner(MEDIA_PATH, db);
        
        const result = await scanner.scanDirectory();
        res.json({ 
            message: 'Media scan completed', 
            found: result.found,
            added: result.added 
        });
    } catch (error) {
        console.error('Error scanning media:', error);
        res.status(500).json({ error: 'Failed to scan media' });
    }
});

/**
 * @swagger
 * /api/info:
 *   get:
 *     summary: Get server information
 *     description: Retrieve server status and configuration information
 *     tags: [Administration]
 *     responses:
 *       200:
 *         description: Server information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Server name
 *                 version:
 *                   type: string
 *                   description: Server version
 *                 mediaPath:
 *                   type: string
 *                   description: Current media directory path
 *                 port:
 *                   type: integer
 *                   description: Server port number
 */
app.get('/api/info', (req, res) => {
    res.json({
        name: 'SneakFlix',
        version: '1.0.0',
        mediaPath: MEDIA_PATH,
        serverTime: new Date().toISOString()
    });
});

/**
 * @swagger
 * /api/settings/media-path:
 *   post:
 *     summary: Update media directory path
 *     description: Update the server's media directory path and save to configuration
 *     tags: [Administration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mediaPath
 *             properties:
 *               mediaPath:
 *                 type: string
 *                 description: New media directory path
 *                 example: "E:\\Movies"
 *     responses:
 *       200:
 *         description: Media path updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 mediaPath:
 *                   type: string
 *                   description: Updated media path
 *       400:
 *         description: Invalid request or path doesn't exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/settings/media-path', async (req, res) => {
    try {
        const { mediaPath } = req.body;
        
        if (!mediaPath) {
            return res.status(400).json({ error: 'Media path is required' });
        }

        // Check if the directory exists
        if (!fs.existsSync(mediaPath)) {
            return res.status(400).json({ error: 'Directory does not exist' });
        }

        // Update the config file
        const configPath = path.join(__dirname, 'config.js');
        let configContent;
        
        try {
            configContent = fs.readFileSync(configPath, 'utf8');
        } catch (error) {
            return res.status(500).json({ error: 'Could not read config file' });
        }

        // Replace the mediaPath in the config
        const updatedConfig = configContent.replace(
            /mediaPath:\s*process\.env\.MEDIA_PATH\s*\|\|\s*['"`][^'"`]*['"`]/,
            `mediaPath: process.env.MEDIA_PATH || '${mediaPath.replace(/\\/g, '\\\\')}'`
        );

        fs.writeFileSync(configPath, updatedConfig, 'utf8');

        res.json({ 
            success: true, 
            message: 'Media path updated successfully. Please restart the server for changes to take effect.',
            newPath: mediaPath
        });
    } catch (error) {
        console.error('Error updating media path:', error);
        res.status(500).json({ error: 'Failed to update media path' });
    }
});

// Catch all handler for React Router (SPA) - MUST be last!
app.get('*', (req, res) => {
    // Only handle non-API routes
    if (!req.path.startsWith('/api')) {
        if (fs.existsSync('public-react')) {
            res.sendFile(path.join(__dirname, 'public-react', 'index.html'));
        } else {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        }
    }
});

// Initialize database and start server
async function startServer() {
    try {
        await db.initialize();
        console.log('Database initialized successfully');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🎬 SneakFlix server running on http://0.0.0.0:${PORT}`);
            console.log(`📁 Media directory: ${path.resolve(MEDIA_PATH)}`);
            console.log(`🌐 Access from other devices: http://[YOUR_PI_IP]:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
