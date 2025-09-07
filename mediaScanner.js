const fs = require('fs-extra');
const path = require('path');

class MediaScanner {
    constructor(mediaPath, database) {
        this.mediaPath = mediaPath;
        this.db = database;
        this.supportedFormats = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
        this.subtitleFormats = ['.srt', '.vtt', '.ass', '.ssa', '.sub', '.idx', '.sup'];
    }

    async scanDirectory() {
        console.log(`Starting media scan in: ${this.mediaPath}`);
        
        let found = 0;
        let added = 0;

        try {
            const files = await this.getAllVideoFiles(this.mediaPath);
            found = files.length;
            
            console.log(`Found ${found} video files`);

            for (const file of files) {
                try {
                    const relativePath = path.relative(this.mediaPath, file);
                    const exists = await this.db.movieExists(relativePath);
                    
                    if (!exists) {
                        const movieData = await this.extractMovieInfo(file, relativePath);
                        await this.db.addMovie(movieData);
                        added++;
                        console.log(`Added: ${movieData.title}`);
                    }
                } catch (error) {
                    console.error(`Error processing file ${file}:`, error);
                }
            }

            console.log(`Scan completed. Found: ${found}, Added: ${added}`);
            return { found, added };

        } catch (error) {
            console.error('Error during media scan:', error);
            throw error;
        }
    }

    async getAllVideoFiles(dir) {
        let videoFiles = [];

        try {
            const items = await fs.readdir(dir);

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = await fs.stat(fullPath);

                if (stat.isDirectory()) {
                    // Skip hidden directories and common non-media directories
                    if (!item.startsWith('.') && !['thumbnails', 'temp', 'cache'].includes(item.toLowerCase())) {
                        const subFiles = await this.getAllVideoFiles(fullPath);
                        videoFiles = videoFiles.concat(subFiles);
                    }
                } else if (stat.isFile()) {
                    const ext = path.extname(item).toLowerCase();
                    if (this.supportedFormats.includes(ext)) {
                        videoFiles.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${dir}:`, error);
        }

        return videoFiles;
    }

    async extractMovieInfo(filePath, relativePath) {
        const fileName = path.basename(filePath, path.extname(filePath));
        const fileDir = path.dirname(filePath);
        const stats = await fs.stat(filePath);
        
        // Check if movie is in its own folder (like "The Secret Dare To Dream (2020) [1080p]")
        const parentDirName = path.basename(fileDir);
        const isInMovieFolder = parentDirName !== path.basename(this.mediaPath);
        
        // Use folder name as title if movie is in its own folder, otherwise use filename
        let rawTitle = isInMovieFolder ? parentDirName : fileName;
        
        // Extract title from filename/folder name (remove common patterns)
        let title = rawTitle
            .replace(/\[.*?\]/g, '') // Remove [1080p], [BluRay], etc.
            .replace(/\.(720p|1080p|4K|2160p)/gi, '')
            .replace(/\.(BluRay|BRRip|DVDRip|WEBRip|HDTV|HDRip)/gi, '')
            .replace(/\.(x264|x265|H264|H265)/gi, '')
            .replace(/[._-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Extract year from title
        const yearMatch = rawTitle.match(/\((\d{4})\)/);
        const year = yearMatch ? parseInt(yearMatch[1]) : null;
        
        // Remove year from title if found
        if (year) {
            title = title.replace(`(${year})`, '').replace(/\s+/g, ' ').trim();
        }

        // Extract resolution from folder/filename
        let resolution = 'Unknown';
        if (rawTitle.match(/(4K|2160p)/i)) resolution = '4K';
        else if (rawTitle.match(/1080p/i)) resolution = '1080p';
        else if (rawTitle.match(/720p/i)) resolution = '720p';
        else if (rawTitle.match(/480p/i)) resolution = '480p';

        // Get file format
        const format = path.extname(filePath).substring(1).toUpperCase();

        // Check for subtitles in the same directory
        const subtitles = await this.findSubtitles(fileDir, fileName);
        
        // Generate a better description based on folder structure
        let description = null;
        if (isInMovieFolder && subtitles.length > 0) {
            description = `Movie with ${subtitles.length} subtitle file(s): ${subtitles.join(', ')}`;
        } else if (subtitles.length > 0) {
            description = `Subtitles available: ${subtitles.join(', ')}`;
        }

        return {
            title: title || fileName,
            file_path: relativePath,
            file_size: stats.size,
            duration: null, // Could be extracted using ffprobe if available
            resolution: resolution,
            format: format,
            thumbnail: null, // Could generate thumbnails using ffmpeg
            year: year,
            genre: null,
            description: description,
            subtitles: subtitles
        };
    }

    async findSubtitles(directory, videoFileName) {
        const subtitles = [];
        
        try {
            const files = await fs.readdir(directory);
            
            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                if (this.subtitleFormats.includes(ext)) {
                    // Check if subtitle file matches video file name
                    const subBaseName = path.basename(file, ext);
                    const videoBaseName = videoFileName;
                    
                    if (subBaseName.includes(videoBaseName) || videoBaseName.includes(subBaseName) || 
                        subBaseName.toLowerCase().includes('subtitle') || 
                        subBaseName.toLowerCase().includes('sub')) {
                        subtitles.push(file);
                    }
                }
            }
        } catch (error) {
            console.error(`Error finding subtitles in ${directory}:`, error);
        }
        
        return subtitles;
    }

    // Generate thumbnail (requires ffmpeg)
    async generateThumbnail(videoPath, outputPath) {
        // This would require ffmpeg to be installed
        // Implementation would use child_process to run ffmpeg command
        // For now, we'll skip thumbnail generation
        return null;
    }
}

module.exports = MediaScanner;
