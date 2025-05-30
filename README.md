# MongoDB IAM Utilities for Node.Js (JavaScript/TypeScript)

This repository is a utility project focused on streamlining IAM processes for MongoDB, leveraging the native driver (Node.js this case), with the understanding that similar projects could be developed for other platforms. Its goal is to simplify and accelerate security-related tasks, making IAM management more efficient.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/mongodb-industry-solutions/mdb-iam-util-node)

Role Rectifier is a package that helps manage and validate user roles and privileges in MongoDB databases. It allows developers to:

- ✅ Retrieve all roles assigned to a user across multiple databases.
- ✅ Identify custom roles (excluding built-in roles).
- ✅ Retrieve detailed privileges of specific roles.
- ✅ Verify missing and extra permissions for a given list of required permissions.

This package is designed for system administrators, DevOps engineers, and developers who manage MongoDB access control and want to ensure role consistency and security.

Developed by [Solution Assurance](https://sites.google.com/mongodb.com/solutions-assurance/).

## 📌 Installation

```sh
npm install @mongodb-solution-assurance/iam-util
```

## 🔬 Test

```sh
npm test
```

## SCRAM Authentication

SCRAM (Salted Challenge Response Authentication Mechanism) is a secure username-password authentication protocol that protects credentials using hashing and salting techniques, making it suitable for securing access to databases like MongoDB. Applying an automated role rectification process is vital to periodically validate, revoke, or update user roles to prevent unauthorized access, reduce privilege accumulation, and maintain compliance with security policies. MongoDB Atlas supports role-based access control (RBAC) and transaction safeguards, ensuring that compromised or misconfigured credentials and roles can be promptly deauthorized and replaced. These measures align with industry standards for maintaining a robust security posture and preventing privilege escalation risks.

### 🛠 Usage Example

Connect to MongoDB and Retrieve User Roles

```js
import { MongoRoleManager } from "@mongodb-solution-assurance/iam-util";

(async () => {
  // Replace with your MongoDB connection string data
  const dbUsername = "db_username";
  const dbPassword = "db_password";
  const dbHost = "mydb.kts.mongodb.net";
  const dbApp = "MyLocalApp";
  const connectionString = `mongodb+srv://${dbUsername}:${dbPassword}@${dbHost}/?retryWrites=true&w=majority&appName=${dbApp}`;

  // Create the role manager instance
  let roleManager = new MongoRoleManager(connectionString);

  // Get user roles
  let userRoles = await roleManager.getUserRoles();

  console.log(userRoles);
  /* OUTPUT:
        [
            'MyCustomRole',
            'read',
            'readWrite'
        ]
    */
})();
```

This code snippet establishes a connection to a MongoDB database using a constructed connection string, then utilizes a `MongoRoleManager` instance to retrieve the roles assigned to the authenticated user. It serves to programmatically access and display the user's role-based access control within the MongoDB environment, facilitating security audits and role management.

### 🚀 Verify Missing & Extra Permissions

Checking access privileges for the user defined in the connection string of the previous example:

```js
let requiredPermissions = [
  "search",
  "read",
  "find",
  "insert",
  "update",
  "remove",
  "collMod",
];

let permissions = await roleManager.verifyPermissions(requiredPermissions);

// over-privileged
console.log("Extra Permissions:", permissions["extra"]);

// under-privilidged
console.log("Missing Permissions:", permissions["missing"]);

// required-privileged
console.log("Valid Permissions:", permissions["present"]);

/* OUTPUT:

    Extra Permissions: [
        'changeStream',
        'createCollection',
        'dbStats',
        'listCollections',
        'collStats',
        'dbHash',
        'killCursors',
        'listIndexes',
        'listSearchIndexes',
        'planCacheRead',
        'convertToCapped',
        'createIndex',
        'dropCollection',
        'dropIndex'
    ]

    Missing Permissions: [ 'search', 'read' ]

    Valid Permissions: [ 'find', 'insert', 'update', 'remove', 'collMod' ]
*/
```

The provided code snippet demonstrates how to effectively verify and manage user permissions within a MongoDB environment. Utilizing the `verifyPermissions` method, it compares a list of `requiredPermissions` against the actual privileges granted to the user, as determined by their assigned roles.

This process then categorizes permissions into three distinct groups:

- **Extra Permissions:** highlights any privileges exceeding the required set, indicating potential over-privileging.
- **Missing Permissions:** identifies necessary permissions that are absent, revealing under-privileging.
- **Valid Permissions:** confirms the required privileges that are correctly assigned.

This functionality allows for precise auditing and adjustment of user access, ensuring adherence to security best practices and minimizing risks associated with excessive or insufficient permissions.

## X.509 Certificate Authentication
Using X.509 certificates eliminates passwords, delegates authentication to a CA, and can optionally integrate with LDAP for role-based authorization:
- **Easy Mode:** Auto-generates certificates for MongoDB users.
- **Advanced Mode:** Allows organizations to upload custom CA certificates, combining with LDAP or LDAPS for enterprise-level authorization workflows.

### 🛠 Usage Example

Connect to MongoDB and Retrieve User Roles

```js
import { MongoRoleManager } from "@mongodb-solution-assurance/iam-util";

(async () => {
  // Replace with your MongoDB connection string data
  const options = {
    /**
     * Enables Transport Layer Security (TLS) for encrypted and authenticated communication.
     * TLS ensures traffic between the client and MongoDB Atlas cluster is secure and cannot be intercepted.
     * Required for all MongoDB Atlas connections.
     */
    tls: true,
    /**
     * Specifies the authentication mechanism as `MONGODB-X509`, enabling passwordless authentication.
     * MongoDB uses certificates issued by trusted Certificate Authorities (CA) to validate the client.
     * This authentication approach eliminates reliance on traditional username-password credentials.
     */
    authMechanism: "MONGODB-X509",
    /**
     * The uri parameter specifies the connection string for a MongoDB database or cluster. It defines how the client
     * connects to MongoDB, including various important configurations, such as the cluster address, authentication
     * method, and additional security options.
     */
    uri: `mongodb+srv://cluster0.b4znk.mongodb.net/?authSource=$external&authMechanism=MONGODB-X509`,
    /**
     * Specifies the file path to the PEM file containing both the client's X.509 certificate and private key.
     * The PEM file is used for passwordless authentication and verifies the client's identity.
     * This aligns with MongoDB’s advanced X.509 mode for organizations using certificate management infrastructure.
     */
    tlsCertificateKeyFile: "/path/to/certificate.pem",
    /**
     * The tlsCAFile option specifies the path to a PEM file containing the Certificate Authority (CA)
     * certificates that MongoDB uses to validate server certificates during the TLS handshake.
     */
    tlsCAFile: "/path/to/ca.pem",
  };

  // Create the role manager instance
  let roleManager = new MongoRoleManager(options);

  // Get user roles
  let userRoles = await roleManager.getUserRoles();

  console.log(userRoles);
  /* OUTPUT:
        [
            'MyCustomRole',
            'read',
            'readWrite'
        ]
    */
})();
```

For a better understanding, please refer to the article ["Flexible Authentication with MongoRoleManager"](./doc/MongoRoleManager.md).


## Related projects

- [mdb-iam-util-demo](https://github.com/mongodb-industry-solutions/mdb-iam-util-demo): Demo application to implement some utilities, packages, and libraries related to IAM processes.
- [mdb-iam-util-python](https://github.com/mongodb-industry-solutions/mdb-iam-util-python): This repository is a utility project focused on streamlining IAM processes for MongoDB and Python
- [mdb-iam-util-node](https://github.com/mongodb-industry-solutions/mdb-iam-util-node): This repository is a utility project focused on streamlining IAM processes for MongoDB and Node.Js
