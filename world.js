class World {
    constructor(tileSize) {
        this.tileSize = tileSize;
        this.chunkSize = 16;
        this.chunks = new Map();
        this.obstacles = [];
    }

    generateChunk(chunkX, chunkY) {
        const chunkKey = `${chunkX},${chunkY}`;
        if (!this.chunks.has(chunkKey)) {
            const chunk = [];
            for (let y = 0; y < this.chunkSize; y++) {
                chunk[y] = [];
                for (let x = 0; x < this.chunkSize; x++) {
                    // 20% chance of obstacle
                    if (Math.random() < 0.2) {
                        chunk[y][x] = 1; // Obstacle
                        this.obstacles.push({
                            x: (chunkX * this.chunkSize + x) * this.tileSize,
                            y: (chunkY * this.chunkSize + y) * this.tileSize,
                            width: this.tileSize,
                            height: this.tileSize
                        });
                    } else {
                        chunk[y][x] = 0; // Walkable
    }

    save() {
        const chunksArray = Array.from(this.chunks.entries());
        return JSON.stringify({
            chunks: chunksArray,
            obstacles: this.obstacles,
            tileSize: this.tileSize,
            chunkSize: this.chunkSize
        });
    }

    load(data) {
        const savedData = JSON.parse(data);
        this.chunks = new Map(savedData.chunks);
        this.obstacles = savedData.obstacles;
        this.tileSize = savedData.tileSize;
        this.chunkSize = savedData.chunkSize;
    }
}
            }
            this.chunks.set(chunkKey, chunk);
        }
    }

    getTile(x, y) {
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkY = Math.floor(y / this.chunkSize);
        const chunkKey = `${chunkX},${chunkY}`;
        
        if (!this.chunks.has(chunkKey)) {
            this.generateChunk(chunkX, chunkY);
        }
        
        const chunk = this.chunks.get(chunkKey);
        const tileX = x % this.chunkSize;
        const tileY = y % this.chunkSize;
        return chunk[tileY][tileX];
    }

    isColliding(rect) {
        // Check nearby chunks
        const minChunkX = Math.floor((rect.x - this.tileSize) / (this.chunkSize * this.tileSize));
        const maxChunkX = Math.floor((rect.x + rect.width) / (this.chunkSize * this.tileSize));
        const minChunkY = Math.floor((rect.y - this.tileSize) / (this.chunkSize * this.tileSize));
        const maxChunkY = Math.floor((rect.y + rect.height) / (this.chunkSize * this.tileSize));
        
        for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
            for (let chunkY = minChunkY; chunkY <= maxChunkY; chunkY++) {
                this.generateChunk(chunkX, chunkY);
            }
        }
        
        return this.obstacles.some(obstacle => {
            return rect.x < obstacle.x + obstacle.width &&
                   rect.x + rect.width > obstacle.x &&
                   rect.y < obstacle.y + obstacle.height &&
                   rect.y + rect.height > obstacle.y;
        });
    }

    draw(ctx) {
        // Calculate visible chunks
        const minChunkX = Math.floor(camera.x / (this.chunkSize * this.tileSize));
        const maxChunkX = Math.floor((camera.x + canvas.width) / (this.chunkSize * this.tileSize));
        const minChunkY = Math.floor(camera.y / (this.chunkSize * this.tileSize));
        const maxChunkY = Math.floor((camera.y + canvas.height) / (this.chunkSize * this.tileSize));
        
        // Draw visible chunks
        for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
            for (let chunkY = minChunkY; chunkY <= maxChunkY; chunkY++) {
                this.generateChunk(chunkX, chunkY);
                const chunk = this.chunks.get(`${chunkX},${chunkY}`);
                for (let y = 0; y < this.chunkSize; y++) {
                    for (let x = 0; x < this.chunkSize; x++) {
                        if (chunk[y][x] === 1) {
                            ctx.fillStyle = '#654321';
                            ctx.fillRect(
                                (chunkX * this.chunkSize + x) * this.tileSize,
                                (chunkY * this.chunkSize + y) * this.tileSize,
                                this.tileSize,
                                this.tileSize
                            );
                        }
                    }
                }
            }
        }
    }
}

