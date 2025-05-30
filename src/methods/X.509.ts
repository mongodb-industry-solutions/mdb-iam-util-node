import { AuthGeneric } from './Generic';
import { Db } from 'mongodb';

/**
 * X.509-based authentication strategy.
 */
export class AuthX509 extends AuthGeneric {

    async getUsername(username?: string): Promise<string> {
        try {
            if (username) {
                return username;
            }

            if (this.username) {
                return this.username;
            }
            
            await this.connect();
            const adminDb: Db = this.client!.db('admin');
            const userInfo = await adminDb.command({ connectionStatus: 1 });

            // MongoDB returns the authenticated user's DN under `${externalUsers}`
            this.username = userInfo?.authInfo?.authenticatedUsers?.[0]?.user;

            if (!this.username) {
                throw new Error('Authenticated user cannot be determined.');
            }

            // Example DN: CN=username,OU=team,O=org,L=city,ST=state,C=country
            return this.username;
        } catch (e) {
            console.error(`Failed to retrieve authenticated user: ${e}`);
            throw e;
        }
    }
}

export default AuthX509;
