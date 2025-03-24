# MongoDB IAM Utilities for Node.Js (JavaScript/TypeScript)
This repository is a utility project focused on streamlining IAM processes for MongoDB, leveraging the native driver (Node.js this case), with the understanding that similar projects could be developed for other platforms. Its goal is to simplify and accelerate security-related tasks, making IAM management more efficient.

Role Rectifier is a Python package that helps manage and validate user roles and privileges in MongoDB databases. It allows developers to:

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

## 🛠 Usage Example
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
})()
```
This code snippet establishes a connection to a MongoDB database using a constructed connection string, then utilizes a `MongoRoleManager` instance to retrieve the roles assigned to the authenticated user. It serves to programmatically access and display the user's role-based access control within the MongoDB environment, facilitating security audits and role management.


## 🚀 Verify Missing & Extra Permissions
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
]

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