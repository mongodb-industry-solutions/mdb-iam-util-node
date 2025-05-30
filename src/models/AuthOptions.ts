import { MongoClientOptions } from "mongodb";

export type AuthType = "SCRAM" | "X.509" | "OAUTH" | "AWS.IAM" | "Kerberos" | "Generic";

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
    type?: AuthType;
}
