# JavaScript Wrapper for the Apache Cordova Couchbase Plugin

This is a JavaScript / TypeScript wrapper for the official Apache Cordova Couchbase plugin.  The wrapper was created to make it easier to use the Couchbase plugin which depends completely on RESTful API endpoints.  The wrapper removes the hassle of having to work with HTTP requests.

## Installation and Configuration

This wrapper can be installed by using the Node Package Manager (NPM).  It must be used in combination with the Apache Cordova plugin.

To install the Apache Cordova plugin into your iOS and Android project:

```
cordova plugin add https://github.com/couchbaselabs/Couchbase-Lite-PhoneGap-Plugin.git
```

With the plugin installed, the wrapper can be installed by executing the following:

```
npm install cordova-couchbase --save
```

At this point both are ready to be used within your mobile hybrid project.

## Usage

The following are some examples on how to use the wrapper within your project.  It doesn't cover every scenario, but the full list of commands can be determined by visiting the **src/couchbase.ts** and **src/database.ts** files.

### Opening a Database

Before working with data the database must be created and opened.  The following asynchronous command will accomplish that task:

```
(new Couchbase()).openDatabase("example-db").then(database => {
    // 'database' will be used with every future interaction with Couchbase
}, error => {
    console.error(error);
});
```

The `openDatabase` command will check to see if the database exists.  If it does not exist, it will create the database first before trying to open it.

It is very important that the `openDatabase` command be called in the Apache Cordova `deviceready` listener.  Because the Apache Cordova plugin uses native APIs, the wrapper and plugin itself cannot be used until Apache considers the device to be ready.  Other hybrid frameworks have similar mechanisms for handling this.

### Creating a New Document

With the database opened, documents can be created.  Documents are JavaScript objects that can be infinitely complex.  For example they can contain nested objects and nested arrays.

```
database.createDocument({type: "todo", title: "Wash Car"}).then(result => {
    // Do something with the result
}, error => {
    console.error(error);
});
```

The result of the `createDocument` command is asynchronous.

### Retrieving a Document by its Key

Documents can be retrieved individually by their key.  The key can be determined numerous ways including through querying, change events, or other means.

```
database.getDocument("document-key-here").then(result => {
    // Result is JSON object stored in Couchbase
}, error => {
    console.error(error);
});
```

Like with the other commands so far, the `getDocument` method is asynchronous.

### Creating a MapReduce View

Views are used for querying documents based on certain logic.  Multiple views can be created at once each with their own logic.  The views are then stored in a design document which acts as a collection of similar views.

```
let views = {
    items: {
        map: function(doc) {
            if(doc.type == "list" && doc.title) {
                emit(doc._id, {title: doc.title, rev: doc._rev})
            }
        }.toString()
    }
};
database.createDesignDocument("_design/todo", views);
```

The views emit a key-value pair where they key and value can be whatever you'd like.  In the above example, the view will emit a key-value pair for all documents that have a property called `type` that equals "list" and also has a property called `title` that can equal anything.

### Querying a MapReduce View

Each view can be queried for documents.  The results will be the emitted key-value pair that matched the conditions in the view itself.

```
database.queryView("_design/todo", "items", {}).then(result => {
    for(var i = 0; i < result.rows.length; i++) {
        // result.rows[i].value;
    }
}, error => {
    console.error(error);
});
```

The `queryView` method is asynchronous.

### Listening for Database Changes

Sometimes it doesn't make sense to query the database, but instead listen for any changes made within the database.

```
database.listen(change => {
    console.log(change.detail);
});
```

The above command will start a listener that will continuously listen for changes in the database.  Any time a change was found, the change will be printed to the logs.  Changes include new local or remote documents, changes to a document, and even removal of documents.

### Syncing with Couchbase Sync Gateway

While single direction replication exists in the wrapper, a convenient two-way `sync` method exists as well.

```
database.sync("http://192.168.57.1:4984/example", true);
```

The above command will continuously sync between the remote instance and the local database in both directions.  Changes to the local database will be picked up via the listener.

## Resources

Couchbase - [http://www.couchbase.com](http://www.couchbase.com)

Apache Cordova - [https://cordova.apache.org](https://cordova.apache.org)