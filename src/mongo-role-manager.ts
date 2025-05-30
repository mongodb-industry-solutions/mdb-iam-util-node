import { AuthOptions } from './models/AuthOptions';
import { IRoleManager } from './models/IRoleManager';
import { Loader } from './utils/loader';

export class MongoRoleManager implements IRoleManager {

    protected opts: AuthOptions;
    protected ioc: Loader;


    constructor(uri?: string | AuthOptions) {
        this.opts = (typeof uri === "string" ? { uri } : uri) || {};
        this.ioc = Loader.getInstance();
    }

    getSrv(): Promise<IRoleManager> {
        return this.ioc.get<IRoleManager>(this.opts.type!, [this.opts]);
    }

    async getUsername(username?: string): Promise<string> {
        let srv = await this.getSrv();
        return srv.getUsername(username);
    }

    async getUserRoles(username?: string): Promise<string[]> {
        let srv = await this.getSrv();
        return srv.getUserRoles(username);
    }

    async getPrivilegesOfRole(roleName: string): Promise<string[]> {
        let srv = await this.getSrv();
        return srv.getUserRoles(roleName);
    }

    async verifyPermissions(requiredPermissions: string[], roleNames?: string[]): Promise<{ extra: string[]; missing: string[]; present: string[]; }> {
        let srv = await this.getSrv();
        return srv.verifyPermissions(requiredPermissions, roleNames);
    }
}