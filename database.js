const sqlite3 = require('sqlite3').verbose();
const fs = require('fs-extra');
const path = require('path');

class Database {
    constructor(dbPath = './sneakflix.db') {
        this.dbPath = dbPath;
        this.db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log('Connected to SQLite database');
                this.createTables().then(resolve).catch(reject);
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const createMoviesTable = `
                CREATE TABLE IF NOT EXISTS movies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    file_path TEXT UNIQUE NOT NULL,
                    file_size INTEGER,
                    duration TEXT,
                    resolution TEXT,
                    format TEXT,
                    thumbnail TEXT,
                    year INTEGER,
                    genre TEXT,
                    description TEXT,
                    subtitles TEXT,
                    added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_watched DATETIME,
                    watch_count INTEGER DEFAULT 0
                )
            `;

            this.db.run(createMoviesTable, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('Movies table created or already exists');
                resolve();
            });
        });
    }

    async addMovie(movieData) {
        return new Promise((resolve, reject) => {
            const {
                title,
                file_path,
                file_size,
                duration,
                resolution,
                format,
                thumbnail,
                year,
                genre,
                description,
                subtitles
            } = movieData;

            const sql = `
                INSERT OR REPLACE INTO movies 
                (title, file_path, file_size, duration, resolution, format, thumbnail, year, genre, description, subtitles)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Convert subtitles array to JSON string
            const subtitlesJson = subtitles ? JSON.stringify(subtitles) : null;

            this.db.run(sql, [
                title,
                file_path,
                file_size,
                duration,
                resolution,
                format,
                thumbnail,
                year,
                genre,
                description,
                subtitlesJson
            ], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            });
        });
    }

    async getAllMovies() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM movies ORDER BY added_date DESC';
            
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    async getMovieById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM movies WHERE id = ?';
            
            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    }

    async searchMovies(query) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM movies 
                WHERE title LIKE ? OR genre LIKE ? OR description LIKE ?
                ORDER BY added_date DESC
            `;
            
            const searchTerm = `%${query}%`;
            
            this.db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    async updateWatchStats(movieId) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE movies 
                SET last_watched = CURRENT_TIMESTAMP, watch_count = watch_count + 1
                WHERE id = ?
            `;
            
            this.db.run(sql, [movieId], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.changes);
            });
        });
    }

    async movieExists(filePath) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id FROM movies WHERE file_path = ?';
            
            this.db.get(sql, [filePath], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(!!row);
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

module.exports = Database;
