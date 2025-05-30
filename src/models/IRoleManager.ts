/**
 * Interface for authentication strategies.
 * Defines methods for managing roles and permissions in MongoDB.
 */
export interface IRoleManager {
    /**
     * Retrieves the username.
     * @param {string} [username] Optional username for role fetching; may be derived dynamically.
     * @returns username for role fetching based on the authentication method.
     */
    getUsername(username?: string): Promise<string>;

    /**
     * Retrieves the roles assigned to a user.
     * @param {string} username Optional username for role fetching; may be derived dynamically.
     * @returns A promise resolving to a list of roles.
     */
    getUserRoles(username?: string): Promise<string[]>;

    /**
     * Retrieves the privileges associated with a specific role.
     * @param {string} roleName The name of the role.
     * @returns A promise resolving to a list of privileges.
     */
    getPrivilegesOfRole(roleName: string): Promise<string[]>;

    /**
     * Verifies permissions against required permissions.
     * @param {Array<string>} requiredPermissions List of permissions to check against.
     * @param {Array<string>} roleNames Optional list of role names to limit verification scope.
     * @returns A promise resolving to an object containing extra, missing, and present permissions.
     */
    verifyPermissions(
        requiredPermissions: string[],
        roleNames?: string[]
    ): Promise<{ extra: string[]; missing: string[]; present: string[] }>;
}