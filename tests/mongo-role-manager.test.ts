import { MongoRoleManager } from '../src/mongo-role-manager';
import dotenv from 'dotenv';

dotenv.config();

describe('MongoRoleManager', () => {
    let connectionString: string;
    let roleManager: MongoRoleManager;

    beforeAll(() => {
        const dbUsername = process.env.DB_USERNAME;
        const dbPassword = process.env.DB_PASSWORD;
        const dbHost = process.env.DB_HOST;

        if (!dbUsername || !dbPassword || !dbHost) {
            throw new Error('Environment variables DB_USERNAME, DB_PASSWORD, and DB_HOST must be set.');
        }

        connectionString = `mongodb+srv://${dbUsername}:${dbPassword}@${dbHost}/?retryWrites=true&w=majority&appName=SolutionsAssurance`;
        roleManager = new MongoRoleManager(connectionString);
    });

    it('should extract credentials from connection string', () => {
        expect((roleManager as any).username).toBeDefined();
        expect((roleManager as any).password).toBeDefined();
    });

    it('should get user roles', async () => {
        const userRoles = await roleManager.getUserRoles();
        expect(Array.isArray(userRoles)).toBe(true);
    });

    it('should get privileges of a role', async () => {
        const roleName = 'readWrite'; // Replace with a valid role name in your MongoDB
        const privileges = await roleManager.getPrivilegesOfRole(roleName);
        expect(Array.isArray(privileges)).toBe(true);
    });

    it('should verify permissions', async () => {
        const requiredPermissions = [
            'search',
            'read',
            'find',
            'insert',
            'update',
            'remove',
            'collMod',
        ];

        const res = await roleManager.verifyPermissions(requiredPermissions);

        expect(Array.isArray(res.extra)).toBe(true);
        expect(Array.isArray(res.missing)).toBe(true);
        expect(Array.isArray(res.present)).toBe(true);

        expect(res.missing.sort()).toEqual(['search', 'read'].sort());
        expect(res.present.sort()).toEqual(
            ['find', 'insert', 'update', 'remove', 'collMod'].sort()
        );
        expect(res.extra.length).toBeGreaterThan(5);
    });

    it('should handle errors gracefully', async () => {
        const invalidConnectionString = 'invalid-connection-string';
        const invalidRoleManager = new MongoRoleManager(invalidConnectionString);

        const roles = await invalidRoleManager.getUserRoles();
        expect(roles).toEqual([]);

        const privileges = await invalidRoleManager.getPrivilegesOfRole('invalidRole');
        expect(privileges).toEqual([]);

        const permissions = await invalidRoleManager.verifyPermissions([]);
        expect(permissions).toEqual({ extra: [], missing: [], present: [] });
    });

    it('should handle missing username', async () => {
        // Create a new instance without username and password
        const invalidConnectionString = 'mongodb+srv://@mydb.kts.mongodb.net/?retryWrites=true&w=majority&appName=MyLocalApp';
        const invalidRoleManager = new MongoRoleManager(invalidConnectionString);

        await expect(invalidRoleManager.getUserRoles()).rejects.toThrow('Username must be provided or extracted from the connection string.');
    });
});