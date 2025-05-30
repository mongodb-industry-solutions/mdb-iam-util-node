import { AuthOptions } from './models/AuthOptions';
import { IRoleManager } from './models/IRoleManager';
import { StaticLocator as Loader } from './utils/locator';

/**
 * Class responsible for managing roles and permissions in a MongoDB system.
 * It utilizes a dynamic loader to instantiate the appropriate role manager implementation
 * based on the selected authentication type (e.g., SCRAM or X.509).
 */
export class MongoRoleManager implements IRoleManager {
    /**
     * Authentication options defining connection details.
     * Includes the URI, authentication type, and any additional parameters.
     */
    protected opts: AuthOptions;

    /**
     * Instance of the dynamic Loader used for injecting dependencies.
     */
    protected ioc: Loader;

    /**
     * Constructor for the `MongoRoleManager` class.
     * Initializes the authentication options and prepares an instance of the Loader.
     * @param uri - Can be a string representing a MongoDB URI or an `AuthOptions` object.
     * If no value is provided, defaults to an empty options object.
     */
    constructor(uri?: string | AuthOptions) {
        try {
            this.opts = (typeof uri === 'string' ? { uri } : uri) || {};
            this.ioc = Loader.getInstance(); // Singleton instance of Loader for dependency injection.
        } catch (error) {
            throw new Error(`Failed to initialize MongoRoleManager: ${(error as Error).message}`);
        }
    }

    /**
     * Static loads and instantiates the appropriate role manager implementation.
     * The type of manager loaded (e.g., SCRAM, X.509) is based on the `type` property in `AuthOptions`.
     * @returns A promise resolving to an instance of `IRoleManager`.
     */
    async getSrv(): Promise<IRoleManager> {
        try {
            this.opts.type = this.opts.type || "SCRAM";
            let srv = this.ioc.get<IRoleManager>(this.opts.type, [this.opts]);
            if (!srv) {
                throw new Error(`No supported method: ${this.opts.type}`);
            }
            return Promise.resolve(srv);
        } catch (error) {
            throw new Error(`Failed to load RoleManager service: ${(error as Error).message}`);
        }
    }

    /**
     * Retrieves the username for the authenticated user or the specified user.
     * Delegates the operation to the dynamically loaded role manager instance.
     * @param username - Optional username to retrieve; if undefined, defaults to the current authenticated user.
     * @returns A promise resolving to the username as a string.
     */
    async getUsername(username?: string): Promise<string> {
        try {
            const srv = await this.getSrv();
            return await srv.getUsername(username);
        } catch (error) {
            throw new Error(`Failed to retrieve username: ${(error as Error).message}`);
        }
    }

    /**
     * Retrieves the roles assigned to a user.
     * Delegates the operation to the dynamically loaded role manager instance.
     * @param username - Optional username to retrieve roles for; if undefined, defaults to the current authenticated user.
     * @returns A promise resolving to a list of roles as an array of strings.
     */
    async getUserRoles(username?: string): Promise<string[]> {
        try {
            const srv = await this.getSrv();
            return await srv.getUserRoles(username);
        } catch (error) {
            throw new Error(`Failed to retrieve user roles: ${(error as Error).message}`);
        }
    }

    /**
     * Retrieves the privileges associated with a specific role.
     * Delegates the operation to the dynamically loaded role manager instance.
     * @param roleName - The name of the role to retrieve privileges for.
     * @returns A promise resolving to a list of privileges as an array of strings.
     */
    async getPrivilegesOfRole(roleName: string): Promise<string[]> {
        try {
            const srv = await this.getSrv();
            return await srv.getPrivilegesOfRole(roleName);
        } catch (error) {
            throw new Error(`Failed to retrieve privileges for role "${roleName}": ${(error as Error).message}`);
        }
    }

    /**
     * Verifies permissions against required permissions for specific roles.
     * Delegates the operation to the dynamically loaded role manager instance.
     * @param requiredPermissions - List of required permissions as an array of strings.
     * @param roleNames - Optional list of roles to check permissions for; if undefined, defaults to the current user's roles.
     * @returns A promise resolving to an object specifying extra, missing, and present permissions.
     */
    async verifyPermissions(
        requiredPermissions: string[],
        roleNames?: string[]
    ): Promise<{ extra: string[]; missing: string[]; present: string[] }> {
        try {
            const srv = await this.getSrv();
            return await srv.verifyPermissions(requiredPermissions, roleNames);
        } catch (error) {
            throw new Error(`Failed to verify permissions: ${(error as Error).message}`);
        }
    }
}
