import AuthGeneric from "../methods/Generic";
import AuthSCRAM from "../methods/SCRAM";
import AuthX509 from "../methods/X.509";
import { AuthType } from "../models/AuthOptions";

/**
 * Dictionary that maps authentication types to their respective implementations.
 * Supports multiple authentication mechanisms such as SCRAM, X.509, and more.
 */
export const methods: Record<AuthType, any> = {
    "Generic": AuthGeneric,        // Generic authentication method implementation.
    "SCRAM": AuthSCRAM,            // SCRAM-SHA-based authentication method.
    "X.509": AuthX509,             // X.509 certificate-based authentication method.
    "OAUTH": null,                 // Placeholder for OAuth authentication method.
    "AWS.IAM": null,               // Placeholder for AWS IAM authentication method.
    "Kerberos": null               // Placeholder for Kerberos authentication method.
};

/**
 * Dynamically retrieves an authentication method and creates an instance with the provided constructor parameters.
 * Includes error handling for unsupported authentication types or uninitialized implementations.
 *
 * @param type - The authentication type to retrieve, e.g., "SCRAM", "X.509".
 * @param params - An array of parameters to pass to the constructor of the method being invoked.
 * @returns An instance of the requested authentication method, or `null` if uninitialized or unsupported.
 * @throws Error if the authentication type is undefined, unsupported, or fails to initialize.
 */
export function get<T>(type: AuthType, params: Array<any> = []): T | null {
    try {
        // Validate the provided authentication type
        if (!type) {
            throw new Error("Authentication type is undefined. Please provide a valid authentication type.");
        }

        // Retrieve the corresponding authentication method from the dictionary
        const method = methods[type];
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
