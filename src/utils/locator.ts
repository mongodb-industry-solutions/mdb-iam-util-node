import { AuthMechanism } from "mongodb";
import AuthGeneric from "../methods/Generic";
import AuthSCRAM from "../methods/SCRAM";
import AuthX509 from "../methods/X.509";

export type Cache = Record<string, any>;

export class StaticLocator {

    /**
     * Dictionary that maps authentication types to their respective implementations.
     * Supports multiple authentication mechanisms such as SCRAM, X.509, and more.
     */
    protected _cache: Cache;

    /**
     * The single instance of the Loader class.
     */
    protected static instance: StaticLocator;

    constructor() {
        this._cache = {
            "Generic": AuthGeneric,        // Generic authentication method implementation.
            "DEFAULT": AuthSCRAM,          // alias for SCRAM-SHA-based
            "PLAIN": AuthSCRAM,            // alias for SCRAM-SHA-based
            "SCRAM-SHA-1": AuthSCRAM,      // SCRAM-SHA-based authentication method.
            "SCRAM-SHA-256": AuthSCRAM,    // alias for SCRAM-SHA-based
            "MONGODB-X509": AuthX509,      // X.509 certificate-based authentication method.
            "OAUTH": null,                 // Placeholder for OAuth authentication method.
            "MONGODB-AWS": null,           // Placeholder for AWS IAM authentication method.
            "Kerberos": null,              // Placeholder for Kerberos authentication method.
            "MONGODB-OIDC": null,
            "MONGODB_CR": null,
            "MONGODB_GSSAPI": null,

        };
    }

    /**
     * Getter method for accessing the cache.
     * @returns {Record<string, any>} The entire cache object, containing all key-value pairs.
     */
    get cache(): Cache {
        return this._cache;
    }

    /**
     * Dynamically retrieves an authentication method and creates an instance with the provided constructor parameters.
     * Includes error handling for unsupported authentication types or uninitialized implementations.
     *
     * @param type - The authentication type to retrieve, e.g., "SCRAM", "X.509".
     * @param params - An array of parameters to pass to the constructor of the method being invoked.
     * @returns An instance of the requested authentication method, or `null` if uninitialized or unsupported.
     * @throws Error if the authentication type is undefined, unsupported, or fails to initialize.
     */
    get<T>(type: AuthMechanism, params: Array<any> = []): T | null {
        try {
            // Validate the provided authentication type
            if (!type) {
                throw new Error("Authentication type is undefined. Please provide a valid authentication type.");
            }

            // Retrieve the corresponding authentication method from the dictionary
            const method = this.cache[type];
            if (!method) {
                throw new Error(`Unsupported authentication type: "${type}". Implementation is not available.`);
            }

            // Ensure the method is initialized and functional
            if (method === null) {
                throw new Error(`Authentication type "${type}" is not yet implemented.`);
            }

            // Dynamically create and return an instance of the authentication method
            return new method(...params) as T;
        } catch (error) {
            console.error(`Error in authentication retrieval: ${(error as Error).message}`);
            return null; // Return `null` for unsupported or failed retrieval scenarios
        }
    }

    /**
     * Static method to retrieve or create the single instance of the Loader class.
     * @returns {StaticLocator} The single instance of Loader.
     */
    public static getInstance(): StaticLocator {
        if (!StaticLocator.instance) {
            StaticLocator.instance = new StaticLocator();
        }
        return StaticLocator.instance;
    }

    /**
     * Getter method for retrieving all keys currently stored in the cache.
     * @returns {string[]} An array of all the keys in the cache.
     */
    public get cacheKeys(): string[] {
        return Object.keys(this.cache);
    }
}

