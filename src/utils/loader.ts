import path from 'path';

/**
 * Type representing the parameters that can be passed to the constructor.
 */
type ConstructorParams = unknown[];
type Cache = Record<string, any>;

/**
 * Class Loader dynamically loads a module, instantiates it, and passes the required parameters.
 * The module is loaded asynchronously, and the file location is dynamically determined.
 */
export class Loader {
    protected directory: string;

    /**
     * Internal cache storage.
     * Contains key-value pairs where both key and value are T.
     */
    protected _cache: Cache;

    /**
     * The single instance of the Loader class.
     */
    protected static instance: Loader;

    /**
     * Constructor for the Loader class.
     * @param {ConstructorParams} directory - The directory containing the modules to load.
     * @throws Error if the directory path is invalid or empty.
     */
    constructor(directory?: string) {
        directory = (directory && typeof directory !== 'string') || !directory ? __dirname + "/../methods" : directory;
        // Convert to absolute path for safety
        this.directory = path.resolve(directory);
        this._cache = {};
    }

    /**
     * Dynamically loads a module by its name from the specified directory.
     * @template T - Generic type for the class being loaded.
     * @param {string} name - The name of the module to load (without file extension).
     * @param {ConstructorParams} params - An array of parameters to pass to the module's constructor.
     * @returns {Promise<T>} A promise resolving to an instance of the loaded class.
     * @throws Error if the file does not exist or the module cannot be loaded.
     */
    public async get<T>(name: string, params: ConstructorParams = [], directory: string | null = null): Promise<T> {
        try {
            // Dynamically construct the full path to the module
            const modulePath = path.join(directory || this.directory, `${name}.js`);

            // Improve the performance
            if (this.cache[modulePath]) {
                return this.cache[modulePath] as T;
            }

            // Dynamically import the module
            const module = await import(modulePath);

            if (!module.default) {
                throw new Error(`Module "${name}" does not have a default export.`);
            }

            // Dynamically instantiate the default export using provided parameters
            this.cache[modulePath] = new module.default(...params);

            // Return the required resource
            return this.cache[modulePath];
        } catch (error) {
            throw new Error(`Failed to load module "${name}" from directory "${this.directory}": ${(error as Error).message}`);
        }
    }

    /**
     * Static method to retrieve or create the single instance of the Loader class.
     * @returns {Loader} The single instance of Loader.
     */
    public static getInstance(): Loader {
        if (!Loader.instance) {
            Loader.instance = new Loader();
        }
        return Loader.instance;
    }

    /**
     * Getter method for accessing the cache.
     * @returns {Record<string, any>} The entire cache object, containing all key-value pairs.
     */
    get cache() {
        return this._cache;
    }

    /**
     * Getter method for accessing the cache content.
     * @returns {Record<string, any>} The entire cache object, containing all key-value pairs.
     */
    public get cachedData(): Record<string, any> {
        return this.cache;
    }

    /**
     * Setter method for adding or updating a value in the cache.
     * @param {Object} param - The object containing the key and value to store in the cache.
     * @param {string} param.key - The key for the cache entry.
     * @param {any} param.value - The value for the cache entry.
     */
    public set cachedData({ key, value }: { key: string; value: any }) {
        this.cache[key] = value;
    }

    /**
     * Getter method for retrieving all keys currently stored in the cache.
     * @returns {string[]} An array of all the keys in the cache.
     */
    public get cacheKeys(): string[] {
        return Object.keys(this.cache);
    }
}

