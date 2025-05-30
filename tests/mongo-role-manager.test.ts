import { MongoRoleManager } from '../src/mongo-role-manager';
import dotenv from 'dotenv';

dotenv.config();

describe('MongoRoleManager with SCRAM', () => {
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

    it('should have valid properties', () => {
        expect((roleManager as any).ioc).toBeDefined();
        expect((roleManager as any).opts).toBeDefined();
    });

    it('should extract credentials from connection string', async () => {
        let srvScram = await roleManager.getSrv();
        expect((srvScram as any).username).toBeDefined();
        expect((srvScram as any).password).toBeDefined();
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

        await expect(invalidRoleManager.getUserRoles()).rejects.toThrow('Username must be provided or extracted from the connection string.');

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

describe.skip('MongoRoleManager with X.509', () => {
    let roleManager: MongoRoleManager;

    beforeAll(() => {
        roleManager = new MongoRoleManager({
            uri: `mongodb+srv://cluster0.b4znk.mongodb.net/?authSource=$external&authMechanism=MONGODB-X509`,
            tls: true,
            tlsCertificateKeyFile: __dirname + '/../dist/X509-cert-5614286992162784116.pem',
            // tlsCAFile: 'path/to/ca.pem',
            authMechanism: 'MONGODB-X509'
        });
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

        expect(res.extra.length).toBeGreaterThan(5);
        expect(res.missing.length).toBeGreaterThan(2);
        expect(res.present.length).toBeGreaterThan(1);
    });
});