import { AuthAdm } from './AuthAdm';
import { Db } from 'mongodb';

/**
 * X.509-based authentication strategy.
 */
export class AuthAdmX509 extends AuthAdm {

    async getUsername(username?: string): Promise<string> {
        try {
            if (username) {
                return username;
            }
            await this.connect();
            const adminDb: Db = this.client!.db('admin');
            const userInfo = await adminDb.command({ connectionStatus: 1 });

            // MongoDB returns the authenticated user's DN under `${externalUsers}`
            const authenticatedUser = userInfo?.authInfo?.authenticatedUsers?.[0]?.user;

            if (authenticatedUser) {
                return authenticatedUser; // Example DN: CN=username,OU=team,O=org,L=city,ST=state,C=country  
            }

            throw new Error('Authenticated user cannot be determined.');
        } catch (e) {
            console.error(`Failed to retrieve authenticated user: ${e}`);
            throw e;
        }
    }
}
