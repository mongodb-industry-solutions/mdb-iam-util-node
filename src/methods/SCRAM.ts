import { AuthGeneric } from './Generic';
import { AuthOptions } from '../models/AuthOptions';

/**
 * SCRAM-based authentication strategy.
 */
export class AuthSCRAM extends AuthGeneric {
    protected password: string | null = null;

    constructor(opt?: string | AuthOptions) {
        super(opt);
        this.extractCredentials(this.opts.uri);
    }

    private extractCredentials(uri?: string): void {
        if (!uri) {
            return;
        }
        const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
        if (Array.isArray(match)) {
            this.username = match[1];
            this.password = match[2];
        }
    }
}

export default AuthSCRAM;
