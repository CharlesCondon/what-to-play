interface Category {
    id: number;
    description: string;
}

interface CachedGame {
    appid: number;
    categories: Category[];
}

class GameCache {
    private cache: Map<number, Category[]> = new Map();

    async getCategories(appid: number): Promise<Category[]> {
        // Check if we already have this game cached
        if (this.cache.has(appid)) {
            return this.cache.get(appid)!;
        }

        // Fetch from API
        try {
            const response = await fetch(
                `http://store.steampowered.com/api/appdetails?appids=${appid}`
            );
            const data = await response.json();
            
            const gameData = data[appid];
            
            if (gameData?.success && gameData?.data?.categories) {
                const categories = gameData.data.categories as Category[];
                this.cache.set(appid, categories);
                return categories;
            }
            
            // Cache empty array for games without categories
            this.cache.set(appid, []);
            return [];
        } catch {
            this.cache.set(appid, []);
            return [];
        }
    }

    getCacheSize(): number {
        return this.cache.size;
    }

    clearCache(): void {
        this.cache.clear();
    }
}

// Export a singleton instance
export const gameCache = new GameCache();