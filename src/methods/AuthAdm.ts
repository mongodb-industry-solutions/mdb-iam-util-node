import { MongoClient, Db, Document } from 'mongodb';
import { IRoleManager } from '../models/IRoleManager';
import { AuthOptions } from '../models/AuthOptions';

export class AuthAdm implements IRoleManager {

    protected opts: AuthOptions;
    protected client: MongoClient | null = null;
    protected username: string | null = null;

    constructor(uri?: string | AuthOptions) {
        this.opts = (typeof uri === "string" ? { uri } : uri) || {};
        this.opts.type = this.opts.type || "SCRAM";
    }

    protected async connect(): Promise<void> {
        if (!this.client && this.opts.uri) {
            this.client = new MongoClient(this.opts.uri, this.opts);
            await this.client.connect();
        }
    }

    protected async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
        }
    }

    getUsername(username?: string): Promise<string> {
        return Promise.resolve(username || this.username || "");
    }

    async getUserRoles(username?: string): Promise<string[]> {
        const rolesInfo: { [dbName: string]: Document[] } = {};

        const targetUsername = await this.getUsername(username);

        if (!targetUsername) {
            throw new Error('Username must be provided or extracted from the connection string.');
        }

        try {
            await this.connect();
            const databases = await this.client!.db().admin().listDatabases();
            for (const dbInfo of databases.databases) {
                const dbName = dbInfo.name;
                try {
                    const db: Db = this.client!.db(dbName);
                    const userInfo = await db.command({ usersInfo: targetUsername });
                    if (userInfo.users && userInfo.users.length > 0 && userInfo.users[0].roles) {
                        rolesInfo[dbName] = userInfo.users[0].roles;
                    }
                } catch (dbError) {
                    // Ignore databases where the user does not exist
                }
            }
        } finally {
            await this.disconnect();
        }

        if (rolesInfo.admin && Array.isArray(rolesInfo.admin)) {
            const rolesSet = new Set(
                rolesInfo.admin
                    .filter((item: any) => item && item.role)
                    .map((item: any) => item.role)
            );
            return Array.from(rolesSet);
        } else {
            return [];
        }
    }

    async getPrivilegesOfRole(roleName: string): Promise<string[]> {
        const privileges = new Set<string>();

        try {
            await this.connect();
            const adminDb: Db = this.client!.db('admin');
            const roleInfo = await adminDb.command({
                rolesInfo: roleName,
                showPrivileges: true,
                showBuiltinRoles: true,
            });

            if (roleInfo.roles && Array.isArray(roleInfo.roles)) {
                roleInfo.roles.forEach((role: any) => {
                    if (role.privileges && Array.isArray(role.privileges)) {
                        role.privileges.forEach((privilege: any) => {
                            if (privilege.actions && Array.isArray(privilege.actions)) {
                                privilege.actions.forEach((action: string) => privileges.add(action));
                            }
                        });
                    }
                });
            }
        } catch (e) {
            console.error(`Unexpected error: ${e}`);
        } finally {
            await this.disconnect();
        }

        return Array.from(privileges);
    }

    async verifyPermissions(
        requiredPermissions: string[],
        roleNames?: string[]
    ): Promise<{ extra: string[]; missing: string[]; present: string[] }> {
        try {
            if (!roleNames) {
                roleNames = await this.getUserRoles();
            }

            const currentPermissions = new Set<string>();
            for (const role of roleNames) {
                (await this.getPrivilegesOfRole(role)).forEach((perm) => currentPermissions.add(perm));
            }

            const requiredPermissionsSet = new Set(requiredPermissions);

            const extraPermissions = Array.from(
                new Set([...currentPermissions].filter((x) => !requiredPermissionsSet.has(x)))
            );
            const missingPermissions = Array.from(
                new Set([...requiredPermissionsSet].filter((x) => !currentPermissions.has(x)))
            );
            const presentPermissions = Array.from(
                new Set([...requiredPermissionsSet].filter((x) => currentPermissions.has(x)))
            );

            return {
                extra: extraPermissions,
                missing: missingPermissions,
                present: presentPermissions,
            };
        } catch (e) {
            console.error(`Unexpected error: ${e}`);
            return { extra: [], missing: [], present: [] };
        }
    }
}

export default AuthAdm;