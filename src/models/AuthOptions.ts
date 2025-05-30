import { MongoClientOptions } from "mongodb";

/**  
 * Interface for authentication strategy options.
 */
export interface AuthOptions extends MongoClientOptions {
    /**
     * Connection string for MongoDB.
     */
    uri?: string;

    /**
     * Connection string for MongoDB.
     */
    type?: string;
}  
