
# Overview
- Gadget is a full-stack application development and hosting platform. It provides developers with all of the tools needed to build, debug, deploy, host and scale apps, under one roof
- Gadget is used to build web applications in Javascript or Typescript. It is suitable for any project whose frontend or backend can be coded in Javascript or Typescript
- While Gadget apps can be full-stack, they don't necessarily need to be. Often the platform is used for projects without a frontend (e.g.integrating two APIs to automate data flow)
- The purpose of Gadget is to help developers deploy projects 100x faster (than with other tools) by building an end-to-end experience that rids the developer of undifferentiated work like infrastructure setup, glue code, CRUD APIs and all forms of other repetitive work
- Gadget accomplishes this purpose by offering an experience that couples the language, tooling, infrastructure, and boilerplate features and exposes them to the developer through a framework that saves time, and is highly extensible
- Gadget provides a cloud-based development environment that hosts and runs both the development version and production version of the app, with all requisite infrastructure like databases already set up
- Gadget provides a terminal that can be used to run terminal commands in the app's cloud development environment sandbox. The feature is only available in the Gadget cloud IDE."

# Database
- Every Gadget environment gets persistent data storage in a shared Postgres that is secured, and scaled by Gadget.
- The database is administered through a UI inside of the Gadget IDE, which allows the user to create tables, add/edit fields and validations, and configure additional options. All schema migrations are handled by Gadget under the hood.
- When choosing to work locally using Gadget's CLI, the database can also be managed via a schema file that is exposed for each model in Gadget.
- There is no direct SQL access to the database for the developer. The database can be accessed in three ways: (1) via an auto-generated, permissioned, public, GraphQL API that respects the validations in place, (2) via an internal API with system admin privileges that can override validations, and (3) Gelly, a simple expression language (files end with `.gelly` are considered Gelly files), which allows direct data access without SQL for complex reads and aggregates.
- The Public API is to be used for all reads from the frontend, and any write from the frontend or backend that wants to run the entire action (including its business logic, and not just the data mutation).
- The internal API is to be used in two scenarios: (1) writes to the database from the backend that do not require the action's business logic to run and (2) data migrations and other data manipulation scenarios that require the user to be able to manipulate data in a table while ignoring all of the existing validations in place. The internal API is never to be used from the frontend.
- Gelly is used to access data for aggregates and computations that cannot be done via the API. Gelly can currently only be used inside of Gadget's computed fields offering, and within permission filters.

# Backend
- Gadget apps use a node.js backend with the Gadget JS framework
- The backend framework offers three core concepts: models, actions, and http routes (sometimes referred to as backend routes)
- Models are a Gadget framework concept that represents the storage layer (database) in the backend
- Each table in your database is represented by a model in the application's /api folder
- Each row in the table is represented by a model record
- Models are setup through the table editor interface inside the Gadget IDE
- Models have a defined schema composed of fields with different types, configs and validations
- Models in Gadget can be related to each other through a rich system of relationships; the following relationships are supported:
  * `belongs to`: used for one-to-many relations, where a record references zero or one other parent record
  * `has one`: used for one-to-one relations, where a record references one other child record
  * `has many`: used for one-to-many relations, where a record references zero or more other child records
  * `has many through`: used for many-to-many relations, where a record references zero or more other sibling records, and that the sibling records are related to the original record through an intermediate join model
- Each field represents a column in the application's database, with the exception of the 'file' and 'computed field' fields which are simplifications of other storage options offered by Gadget
- Actions are a Gadget framework concept, and represent the bulk of the server-side logic of the app
- Actions should only ever be used for **writes** to models or external systems, and never for just reading data
- Actions have many benefits over traditional backend routes:
  (1) they offer built-in triggers like schedulers, GraphQL API endpoints, and webhooks from built-in Plugins
  (2) they get typesafe, and have auto-generated GraphQL endpoints, JS clients and documentation
  (3) they are instantly permissioned through the framework's role-based permissioning system
  (4) they offer intuitive hooks that allow you to extend them to do any work, while ensuring that backend best practices are followed
- Actions come with built-in triggers that force an action to start to run when the trigger's conditions are met. Supported triggers include:
  * the API trigger
  * the scheduler trigger (for global actions only)
- Every action generated by Gadget comes with a bulk variant that allows it to be called with a list of records. Bulk actions are automatically added to the API when the action is created, and are marked with `bulkInvocation: true` in the action's metadata.
  - The api identifier for the bulk action is the same as the action's api identifier but with the `bulk` prefix. For example, if the action's api identifier is `create`, the bulk action's api identifier is `bulkCreate`.
- The trigger will validate any input parameter types, and check that the call is initiated by a role that has permission to run the action. Once these conditions are met, the trigger will pass the necessary parameters to the action and the action will run
- Actions that interact with records on a model are sometimes referred to as model-scoped actions, whereas actions that don't directly interact with a record are sometimes called global-scoped actions.
-  As soon as a new model is added to Gadget, the default create, update, delete model-scoped action files are generated, along with their API endpoints. By default, the files are coded to simply update the record's value. But
- Model-scoped actions have additional capabilities beyond basic CRUD :
  * The GraphQL endpoint for reads and writes (create, update, and delete) are automatically permissioned via a role-based authentication system reading data from that table
  * The input and output parameters for the actions are set to match the fields of the model by default, but can be changed in code.
  * The writes come with an editable JS/TS file that runs when the API endpoint is triggered. This file has two built-in functions:
    (1) `onRun`, is a function that takes the parameters sent into the GraphQL API endpoint and adds,edits, or deletes the record in context. You can customize the function by adding JS logic immediately before or after the database save, and choosing to save to the database transactionally, or not.
    (2) `onSuccess`, executes if the `run` function ends successfully and is intended for business logic, like sending an email, or sms, or charging a card
- The framework allows for the creation of model-scoped actions with custom names other than create, update, and delete. While these custom model-scoped actions come with the same features as the default CRUD actions, they allow for better breaking down of the problem. Specifically, the framework directs developers to create custom named actions for distinct, high-frequency update operations on specific fields of a model, that are accompanied by business logic. Usually, these occur when the record's status fields change (an email sent to subscribers when a blog post's status goes from draft to published, whereas no email is sent when the blog post's title is updated). By mandating this convention, the framework prevents update actions from being overloaded with too much conditional business logic, keeps actions very declarative, and makes the application a lot more scalable
- Model-scoped actions always have a record in context, whereas global-scoped actions do not
- Model-scoped actions should always be used to house any logic related to interacting with records in its corresponding model.
- Global-scoped actions differ from model-scoped actions in that:
  * They need their inputs and output parameters defined, and do not inherit them as default from a model's schema
  * They do not have a record in context by default
  * Their `run` function does not save edits made to records to the database, and because of this the `run` function is usually used for all business logic
  * The `onSuccess` function is rarely used, other than to help breakdown work, as it has no capabilities that differ the run function
- Gadget also supports simple backend HTTP routes that aren't part of the auto generated API. Backend routes, can fully control the HTTP request and response to do things like HTTP streaming, render images, or other things that are impossible to use an action for. Http routes run on Fastify
- HTTP routes are ONLY to be used as an escape hatch out of Gadget's backend framework. They are not nearly as powerful, nor as easy to work with as actions, and should only be recommended when actions are not suitable
- HTTP routes can leverage Fastify's plugin ecosystem. To register fastify plugins or to otherwise modify the Fastify server instance, boot plugins are used. They must be registered before any other route plugins or the routes themselves. Boot plugins should live in the `api/boot` folder (otherwise they will not work as expected)
- You can place arbitrary files in the backend `api` folder and import them anywhere in the backend code, from within actions or HTTP routes. This is particularly useful for shared utilities, business logic, or API clients to external services
- Every Gadget app only serves requests over HTTPS; there is no need to modify any Gadget app to ensure it is HTTPS only. This is handled automatically by the framework
- Actions and HTTP routes both come pre-configured with a rich context that connects the action to Gadget's tooling (e.g. logger), allows access to the incoming trigger's contents, provides the ability to read from the database, as well as the ability to call the app's API server-side
- If a global-scoped action or http route wants to update a record in a model, it must first call a model-scoped action which will then actually edit the record.
- Http routes do not have the trigger in context, because they do not take triggers in the same sense that actions do
- All backend code has access to Gadget's backend tooling like the database and logger

# API
- Gadget autogenerates a GraphQL API for each data model and exposes a rich, type-safe TypeScript API client that can communicate with this API easily
- The API only allows reads and writes that have been explicitly granted to the role that is making the request
- The API is public and can be accessed by any client that has the URL, on the backend or frontend
- Every Gadget model has a Query field that can be used to read data from the model. The auto-generated client will have a collection of methods to interact with this field to read one or many records
- Every action has an associated GraphQL mutation that can be used to call the action. The auto-generated client will have a method to call this mutation

# Tenancy
- Gadget apps can be made multi-tenant, where tenants are isolated from one another and can only access their own data
- Tenancy is typically implemented through a tenant model (like `user`, `organization`, or `shopifyShop`) and `belongsTo` relationships from other models to this tenant model
- In Shopify apps, the `shopifyShop` model serves as the tenant model, and other models should have a `belongsTo` field named `shop` to establish tenancy
- For action code, Gadget provides utility functions to ensure that actions the actor invoking an action can act on the records in context
- Tenancy restrictions are enforced through the permission system using tenancy filters, which ensure users can only access records belonging to their tenant
- Tenancy can be enforced across relationships (e.g., if `comment` belongs to `post` and `post` belongs to `user`, tenancy can be enforced through `post.user`)

# Access control
- The Gadget framework always governs all data access control with a built in role-based access control system. Actors (users or API keys) in the system have roles, and actors can read model data or run actions if any of their roles have been granted permission
- All apps always have a `unauthenticated` role representing what actors without a session are entitled to, and a `system-admin` role that has every permission
- Row-level security is accomplished by extending the permissioning system by adding a Gelly filter to a specific permission to further refine it
- HTTP routes are not automatically secured by Gadget's framework and must be secured in code

# Authentication
Standalone apps, internal tools, or SaaS apps, use Gadget's built-in user authentication system, which supports email/password auth and Google SSO to secure an app. These apps will get a pre-configured `user` model for storing users, and each `session` model belongsTo a `user`. Session or user properties can then be used in access control checks to allow or disallow reads and writes to data. The `user` model has a `roleList` field that lists which roles each user has and thus what data it can read and actions it can run  

# Session management
Sessions in Gadget are always managed using a server-side `session` model that every full-stack app has (backend, api only apps do not have a session model). The `session` model is just like any other model in that it has an API and can store arbitrary data, but it's backed by Redis for better performance. Gadget's generated Javascript, TypeScript and React clients track their current session ID, including across domains or from within embedded iframes.

# Frontend
- Every full-stack Gadget environment gets a fully setup, and hosted React frontend using Vite
- The frontend will often contain an unauthenticated area that is separated from an authenticated area via a login form, using Gadget's auth plugin
- Depending on the type of application being built, there may be a design system setup for the frontend already
- The frontend has the javascript/typescript API client automatically installed and configured, and always kept up to date with the latest version so there is no need to setup the API client, or update it when the backend is updated. Changes to the backend are exposed to the frontend instantly via this API.
- The frontend can also call the backend via the headless React hooks in the `@gadgetinc/react` library.


# Plugins
Plugins in Gadget are pre-built solutions or integrations to third APIs and services that make it easy for developers to add extensible blocks of common functionality. There are two types of plugins in Gadget: Connections, and Authentication methods. Connections are plugins that connect Gadget's backend to other services on the internet. Authentication methods offer extensible backend and frontend functionality for email/password login flows and Google SSO.

## Shopify connection
Gadget offers a managed data connection to Shopify that can be setup without code, and offers: (1) OAuth setup for single tenant apps installed on one store, or multitenant apps distributed on Shopify's app store, (2) instant scope and webhook registration and management, (3) webhook processing and routing to Gadget actions, (4) data syncing to replica database tables that are setup in Gadget's database instantly, (5) daily data reconciliation to see if any Shopify webhooks were missed, (6) an authenticated client that allows easy read and write access to Shopify's APIs, and (7) a fully setup admin UI embedded inside of Shopify's Admin for any stores that install the app.

## BigCommerce connection
Gadget offers a managed data connection to BigCommerce that can be setup without code, and offers: (1) OAuth setup for BigCommerce's "Single-Click" app type , (2) instant scope and webhook registration and management, (3) webhook processing and routing to Gadget actions, (4) an authenticated client that allows easy read and write access to Bigcommerce's APIs, and (5) a fully setup admin UI embedded inside of BigCommerce's control panel for any stores that install the app.

## OpenAI connection
Gadget offers a connection to OpenAI that provides an authenticated api client for calling OpenAI's API. The connection is configured to use a Gadget-managed API key, or a user-provided API key.

## Sentry connection
Gadget offers a connection to Sentry that reports runtime errors to Sentry. The connection is configured with a user-provided data source name (DSN).

## Email/Password Authentication Method
Gadget offers a built-in authentication method that allows developers to sign up, sign in, manage and reset passwords. This authentication method is tied to the presence of a user table in the developer's application.

## Google SSO Authentication Method
Gadget offers a built-in authentication method that allows users to sign up and sign in using their Google account. This authentication method is tied to the presence of a user table in the developer's application.

# Environment variables
Gadget allows users to set environment variables from the Gadget editor. These variables are available to the backend code in the `process.env` JavaScript object. Additionally, any environment variables that start with `GADGET_PUBLIC_` are exposed on the frontend/client side in the `process.env` global that is set using Vite's `define` macro.

  
## Project layout

Every Gadget app is stored as an on-disk folder of files of source code. Gadget stores an app's source code and allows developers to sync it to their local development environment if needed. Developers can source-control their apps using git, but Gadget has no source control system built-in.

By convention, all files in Gadget apps are named using camelCase. An app's filesystem might look like this:

api/ # stores all the backend code for the app
  actions/
    someGlobalAction.ts # defines a global action named "someGlobalAction"
  models/
    todo/ # defines a model named "todo"
      actions/
        create.ts # defines the create action for the todo model
        update.ts # defines the update action for the todo model
        delete.ts # defines the delete action for the todo model
  routes/
    GET-hello.ts # defines a backend HTTP route that can be accessed at /hello via a GET request
    foo/
      POST-bar.ts # defines a backend HTTP route that can be accessed at /foo/bar via a POST request
  boot/
    index.ts # a boot plugin that can set up project context, like API clients, plugins, etc
    multipart.ts # a boot plugin that registers @fastify/multipart
  utils/
    formatEmails.ts # a utility function for formatting emails
  twilio.ts # a module that sets up a Twilio client
web/  # stores all the frontend code for the app
  routes/
    index.tsx # an example root-level index route
    about.tsx # the /about route
  components/
    Header.tsx # a React component that renders the header for the app
   main.tsx # the entry point for the frontend
package.json
vite.config.ts
index.html # the entry point for the frontend

The one exception to the camelCase naming rule is files who's names define URLs, which are backend and frontend routes. By convention, URLs in Gadget apps are dash separated, like /foo/bar/baz-qux, and not camel cased, as web URLs are not reliably case sensitive. So, files should be named like `api/routes/foo/bar/GET-baz-qux.ts` instead of `api/routes/foo/bar/GET-bazQux.ts` or similar on the backend. On the frontend, routes should be named with dashes as well, like `web/routes/foo.bar.baz-qux.tsx`.

Gadget apps don't define import aliases by default. When importing from files within the project, use relative imports.

  
## Naming data models

Data model identifiers and field identifiers must be both valid JavaScript and GraphQL identifiers, and are camelCase by convention.

## Fields

Every data model has a list of fields, similar to columns in a SQL table. Every data model will automatically have an `id` field storing an auto-incrementing primary key, and `createdAt` and `updatedAt` datetime fields storing the date and time the record was created and last updated. Fields are nullable by default but can be made mandatory with validations.

### Available field types

 - `number`: stores a number in arbitrary precision
 - `string`: stores a string of any length
 - `boolean`: stores a boolean
 - `dateTime`: stores a datetime or just a date
 - `email`: stores an email address as a string
 - `url`: stores a URL as a string
 - `enum`: stores a short string selected from a predefined list of values
 - `encryptedString`: stores a string that is encrypted at rest for added security
 - `password`: stores a secure salted one-way hash of a string
 - `json`: stores a valid JSON literal, including objects, arrays, and scalars
 - `file`: stores a file in an automatically managed cloud storage bucket
 - `vector`: stores a vector for vector similarity operations
 - `richText`: stores markdown formatted text
 - `roleList`: stores a set of access control role IDs that a record possesses for authorization checks
 - `belongsTo`: stores a reference to a record of another data model by storing it's ID
 - `hasOne`: defines a one-cardinality virtual reference to a record of another data model powered by a belongsTo field on the other model
 - `hasMany`: defines a many-cardinality virtual reference to a set of records of another data model powered by a belongsTo field on the other model
 - `hasManyThrough`: defines a many-cardinality virtual reference to a set of records of another data model powered by an intermediate join model to a third sibling data model, where the join model has belongsTo fields pointing at each outer model
 - `recordState`: stores a special state value for a state machine. can't be created by you or by users and is only used for framework provided functionality
 - `computed`: computes an arbitrary value like a count or a sum using a simple expression language called Gelly

There are no other types beyond these. There's also no support for arrays of these types, though the enum type supports storing an array of specific strings, and the json type supports storing any JSON including arrays. There's no `id` type, as Gadget automatically creates a mandatory `id` field for every data model. To store a reference to a different record's `id`, use a relationship field type like `belongsTo`.

Gadget will autogenerate a feature-rich API for each data model that supports reading and writing and is able to do most of what SQL can do. The API always includes features for reading data out of the box with no need to manually add list actions or routes ever. For writes, the API is defined by the list of actions and global actions on the models. Calling Actions from the API will apply any listed validations and store data in the automatically managed database. The combination of data models and this automatic API will be used to build the application's logic and interface.

  
Gadget code is written in Javascript or TypeScript to run using real node.js v20 on the backend and modern browsers on the frontend. Gadget apps are like other nodejs apps in that they can use standard project layouts, modern JS features and use packages from npm. The Gadget framework takes care of booting the application and auto-generating a GraphQL API and TypeScript API client for that API for the application. Instead of implementing manual API endpoints, Gadget developers define actions in the Gadget framework, and Gadget takes care of exposing actions as mutations in the API, validating data on the way in and out, and invoking the action's code when API calls are made.

Backend code resides within the `api` directory and frontend code resides within the `web` directory with a shared `package.json` file at the root. Gadget uses file name conventions to define new actions, routes, and plugins, such that a file's path has meaning and implications about how it is treated.

Models are defined in the `api/models` directory, so model actions live in the `api/models/<some-model>/actions` directory, for example, `api/models/user/actions/create.ts`.
Global actions are defined in the `api/actions` directory, for example, `api/actions/sendWelcomeEmail.ts`.
Routes are defined in the `api/routes` directory, for example `api/routes/GET-hello.ts` or `api/routes/posts/[id]/POST-update.ts`.
Boot plugins are defined in the `api/boot` directory, for example `api/boot/twilio.ts`.
Other files can defined in any other subdirectory of the `api` directory, but are often conventionally put within the `api/lib` folder.

Gadget apps don't need to manually set up a GraphQL API or API client -- Gadget automatically generates a GraphQL API based on the actions and triggers, and exposes a pre-connected instance of the TypeScript API client for the app everywhere. Within a model action, global action, or route, the api instance should always be destructured from the passed context object. Because Gadget's API automatically adds functionality for reading data to the API, don't define any actions, global actions, or routes just for reading data.

```typescript
export const run: ActionRun = async ({ api }) => {
  const widget = await api.widget.findFirst();
};
```

Outside of these places you can also access an api client by importing it from the `gadget-server` package.

```typescript
import { api } from "gadget-server";
await api.todo.create({name: "foo});
```

### Logging

Gadget offers developers a built in log viewer. Action and route contexts include a pino `logger` object that can be used to emit log entries viewable in Gadget's Log Viewer, and a `logger` object can be imported from the `gadget-server` package to be used in other parts of the app. On the backend, structured pino loggers should be used over console.log.

Gadget also already emits log entries at the start of requests and actions regardless of outcome. Unless you have important extra context to add, don't add log statements just to say that an action is starting or an action completed, as the framework is already logging that.

### API call basics

To read or write data to your app's database, use the Gadget app's generated API client. In both frontend and backend code, this API client allows reading data and running actions, similar to how you might use a database ORM in other frameworks.

#### Reading data

Each model of the application has reader functions exposed on the API client. For example, if I have a `todo` model, I can read todos like this:

```typescript
// get the first page of todos
let todos = await api.todo.findMany();

// get one todo by id, throw if not found
const todo = await api.todo.findOne("123");

// get 10 todos where the completed field is false, ordered by the createdAt field ascending
todos = await api.todo.findMany({ first: 10, filter: { completed: { equals: false } }, sort: { createdAt: "Ascending" } });
``
When calling reader functions or actions, you can control which fields are loaded by passing the `select` option. `select` accepts an object with keys for each field that should be loaded. Nested fields can be loaded using nested objects, nesting under the key of the relationship field you're selecting through.

Note that the type of the `id` field is `string`, so you should always use `string` literals for anything related to `id` fields.

```typescript
// get 10 todos, selecting only the id, title, completed fields from the todo model, and select the id field and title field of a related category model
todos = await api.todo.findMany({
  first: 10,
  select: {
    id: true,
    title: true,
    completed: true,
    category: { id: true, title: true },
  },
});
```

CRITICAL: the API client can ONLY return/fetch/query at most 250 records at a time. Setting the `first` or `last` option to a number greater than 250 will result in an error.

##### Filtering data

To filter data, pass a `filter` option to the reader function. The `filter` option accepts an object with keys for each field that should be used to filter the data. Each field's value should be an object with a key for the operator and a value for the operand.

Supported filter keys for different field types include:

- equals: Supported by string, number, boolean, dateTime, ID, enum, JSON, recordState, and vector fields. Filters records where the field is exactly equal to the given value.
- notEquals: Supported by string, number, boolean, dateTime, ID, enum, JSON, recordState, and vector fields. Filters records where the field is not equal to the given value.
- isSet: Supported by string, number, boolean, dateTime, ID, enum, JSON, recordState, and vector fields. Filters records where the field is set to any value other than `null`.
- in: Supported by string, number, dateTime, ID, enum, recordState, and JSON fields. Filters records where the field is exactly equal to one of the provided values.
- notIn: Supported by string, number, dateTime, ID, enum, recordState, and JSON fields. Filters records where the field is not equal to any of the provided values.
- lessThan: Supported by string, number, dateTime, and ID fields. Filters records where the field is less than the given value.
- lessThanOrEqual: Supported by string, number, dateTime, and ID fields. Filters records where the field is less than or equal to the given value.
- greaterThan: Supported by string, number, dateTime, and ID fields. Filters records where the field is greater than the given value.
- greaterThanOrEqual: Supported by string, number, dateTime, and ID fields. Filters records where the field is greater than or equal to the given value.
- startsWith: Supported by string fields. Filters records where the string field starts with the given string.
- contains: Supported by enum fields with `allowMultiple` configuration. Filters records where the field contains the given value.
- matches: Supported by JSON fields. Filters records where the JSON field contains the given key-value pair.
- before: Supported by dateTime fields. Filters records where the date-time field is before the given date-time.
- after: Supported by dateTime fields. Filters records where the date-time field is after the given date-time.
- cosineSimilarity: Supported by vector fields. Filters vector fields based on their cosine similarity to an input vector.
- l2Distance: Supported by vector fields. Filters vector fields based on their L2 (Euclidean) distance to an input vector.

Example usage:

```typescript
// get records with quantity greater than 10
await api.widget.findMany({
  filter: {
    quantity: {
      greaterThan: 10,
    },
    isPublished: {
      equals: true,
    },
  },
});
```

```typescript
// get tickets that have a status of "backlog" or "in-progress"
await api.tickets.findMany({
  filter: {
    status: {
      in: ["backlog", "in-progress"],
    },
  },
});
```

```typescript
// get posts created after a specific date-time
await api.post.findMany({
  filter: {
    createdAt: {
      greaterThan: "2023-07-15T10:00:00Z",
    },
  },
});
```

You can also use the `AND` and `OR` operators to combine multiple filter conditions.

```typescript
// get orders that have a total price between 100 and 200 and a financial status of either "paid" or "refunded"
await api.shopifyOrder.findMany({
  filter: {
    AND: [
      { totalPrice: { greaterThan: 100 } },
      { totalPrice: { lessThan: 200 } },
      {
        OR: [
          { financialStatus: { equals: "paid" } },
          { financialStatus: { equals: "refunded" } }
        ]
      }
    ]
  }
});
```

Note that when filtering on `recordState` fields, state values are nested under a `created` key by convention, and you must pass fully qualified state values, like `created.installed` or `created.uninstalled` for states.

##### Sorting data

To sort data, pass a `sort` option to the reader function. The `sort` option accepts an object or array of objects that should have a field name to sort by as the key and the direction as the value.

```
// sort by one field
await api.post.findMany({
  sort: {
    publishedAt: "Descending"
  }
});

// sort by multiple fields
await api.post.findMany({
  sort: [
    {
      publishedAt: "Descending"
    },
    {
      title: "Ascending"
    }
  ]
});
```

### Available fields for sorting

Records can be sorted by most fields of their model in either the `Ascending` or `Descending` direction. The following field types are sortable:

 - string, email, url: sorted using Postgres's alphanumeric sorting rules
 - richText: sorted using Postgres's alphanumeric sorting rules on the `markdown` source text
 - number: sorted by the number's value along the number line
 - boolean: sorted with true higher than false. Descending puts true's first
 - dateTime: sorted by the date and time's value, with earlier dates coming before later dates when using Ascending order
 - id: sorted by the ID's numeric value, with lower IDs coming before higher IDs when using Ascending order
 - enum: sorted by the enum values as strings, using Postgres's alphanumeric sorting rules
 - json: sorted by the JSON string representation, using Postgres's alphanumeric sorting rules
 - vector: sorted by a given vector distance operation

These field types aren't sortable: file, encryptedString, password, hasMany, hasOne, hasManyThrough, computed

#### Writing data

To write data to the app's database, call actions on the API client.

```typescript
// create a new todo record
const todo = await api.todo.create({title: "example todo", completed: false});

// update a todo record by id
await api.todo.update("435", {title: "example todo", completed: false});
```

For `belongsTo` fields, you must set the ID of the related record using the `{ _link: "<id>" }` syntax.

```typescript
await api.todo.update("435", {
  title: "example todo",
  completed: false,
  category: {
    // category is a belongsTo field on the todo model pointing to a category model, and "123" is an ID of a category record
    _link: "123"
  }
});
```

##### Selecting which data to read

When calling reader functions or actions on models, you can control which fields are loaded in the result by passing the `select` option. `select` accepts an object with keys for each field that should be loaded.

You can select a limited set of fields by passing an object with keys for each field that should be loaded.

```typescript
// get the first page of todos, selecting only the title, completed fields from the todo model
const todos = await api.todo.findMany({
  first: 10,
  select: {
    id: true,
    title: true,
    completed: true,
  }
});
```

You can also select data of related records by nesting under the key of the relationship field you're selecting through. For belongsTo and hasOne relationships, nest your selection directly under the name of the relationship field. For hasMany relationships, nest your selection under the name of the relationship field with `edges` and `node` keys to traverse the GraphQL Relay-style connection. Ensure you include the `id` field of a related record in your selection if you need it.

```typescript
// get the first page of todos, selecting only the title, completed fields from the todo model, and select the title field of a related category model
const posts = await api.posts.findMany({
  first: 10,
  select: {
    title: true,
    body: true,
    // single value relationship selects directly
    author: { email: true }
    // list relationship selects through edges and node
    comments: {
      edges: {
        node: {
          id: true,
          body: true,
          createdAt: true
        }
      },
      // gadget supports relay-style pagination, so select the page info if you need it as well
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: true,
        endCursor: true
      }
    }
  }
});
```

Related data can then be accessed at properties with the same shape as the selection:

```typescript
// get the first post's author's email
const email = posts[0].author.email;

// get all the comment bodies for the first post
const commentBodies = posts[0].comments.edges.map((edge) => edge.node.body);
```

##### Selecting from rich field types

When selecting from `richText` fields, you must use a subselection to select either the raw markdown source, or rendered HTML. The rendered HTML isn't styled but can be useful for display.

```typescript
const post = await api.posts.findOne("123", {
  select: {
    id: true,
    someRichTextField: {
      markdown: true,
      truncatedHTML: true
    }
  }
});

const markdown = post.someRichTextField.markdown;
const html = post.someRichTextField.truncatedHTML;
```

##### Selecting from file fields

File fields are a special type of field that store files in the app's cloud storage bucket. File fields have multiple sub properties, and you must select the ones you need.

```typescript
const post = await api.posts.findOne("123", {
  select: {
    id: true,
    someFileField: {
      // a url to the file in cloud storage
      url: true,
      // the filename of the file
      filename: true,
      // the mime type of the file
      mimeType: true,
      // the size of the file in bytes
      size: true
    }
  }
});
```

##### Selecting belongsTo field ids

Each `belongsTo` field allows you to retrieve the related record, or the id of the related record with a second, automatically available selection field suffixed by `id`.

```typescript
// select fields of the related record related record
const todo = await api.todo.findOne("123", {
  select: {
    id: true,
    // select fields from the related record
    category: { id: true, title: true }
  }
});

// or just select the id of the related record
const todo = await api.todo.findOne("123", {
  select: {
    id: true,
    // select the id of the related record
    categoryId: true
  }
});
```

##### Selecting on action results

You can select fields from the result of an action by passing the `select` option to the action.
```typescript
// create a new todo record
const todo = await api.todo.create({title: "example todo", completed: false}, { select: { id: true, title: true } });

// get the id and title of the todo
const id = todo.id;
const title = todo.title;
// completed won't be loaded on the returned todo because it wasn't selected
```

##### Default selection of fields

If you don't pass a `select` option to a reader function, Gadget will select stored fields of the record by default. Computed fields will be excluded. Any fields of related records will be excluded.

If you do pass a `select` option, Gadget will select exactly the fields you pass, and exclude all other fields. This means that if you need fields like `id`, `createdAt`, or `updatedAt` in addition to your own fields, you must select them explicitly.

```typescript
const todos = await api.todo.findMany({
  first: 10,
  select: {
    id: true,
    title: true,
    completed: true,
    // ensure you select the system fields you need in addition to others
    createdAt: true,
  }
});
```

#### Background actions

All actions that have an API trigger can also be enqueued for execution in a background job system. For example:

```typescript
// how you'd execute an action imperatively in the foreground
await api.widget.create({name: "foo"});

// how you'd execute an action imperatively in the background
await api.enqueue(api.widget.create, {name: "foo"});
```

#### Sending emails

To send emails in backend code, use the `emails` object in the action or route context.

#### Scheduling a global action

To schedule a global action, add a `scheduler` field to the action options.

#### Calling the API from React components

Gadget offers React-specific hooks for reading data and calling actions with the API client within React components, like `useFindMany`, `useFindOne`, `useAction`, and `useGlobalAction`. These hooks manage the asynchronous nature of the API calls like intermediate loading states and errors for you. They use `urql` under the hood.

  
Model actions always operate on one record (new or existing) from the database table. Models always start with three actions: `create`, `update`, and `delete`. These actions are used to create, update, and delete records in the model. Developers can add more actions or remove these defaults.

Global actions do not operate on any particular model, and can be used to perform arbitrary logic.

Model actions and global actions are Javascript or TypeScript files that export:
 - a `run` function, called by Gadget when an action is run
 - an optional `onSuccess` function, called by Gadget when all the actions in an action group have `run` successfully and any database transactions have been committed
 - an optional `options` object which configures things like the action's triggers, action type, timeout, etc
 - an optional `params` object which defines extra inputs to the action

By default, model actions accept all the fields of the model as inputs, and return the record they operated on as output. By default, global actions accept no inputs and return the result of the `run` function.

### Action context

The `run` and `onSuccess` functions of model actions and global actions are passed one argument, `context`, which is always destructured to access the necessary elements. Action contexts have these keys:
- api: A connected, authorized instance of the generated API client for the current Gadget application.
- params: The incoming data from the API call invoking this action.
- record: The root record this action is operating on (only available in model actions). Is an instance of the `GadgetRecord` class.
- session: A record representing the current session, if there is one.
- config: An object of all the environment variables registered in Gadget's Environment Variables web editor.
- connections: An object containing client objects for all connections.
- logger: A Pino logger object suitable for emitting log entries viewable in Gadget's Log Viewer.
- model: An object describing the metadata for the model currently being operated on, like the fields and validations this model applies.
- request: An object describing the incoming HTTP request that triggered this action, if it was an HTTP request that triggered it.
- currentAppUrl: The current URL for the environment. e.g. https://my-app.gadget.app
- trigger: An object containing what event caused this action to run.
- emails: An object that allows sending emails from Gadget. It is based on the `nodemailer` library.

For each action Gadget defines a module by module types `ActionRun` and `ActionOnSuccess` that are the types for the `run` and `onSuccess` functions. Important: the `ActionRun` and `ActionOnSuccess` types NEVER need to be imported, Gadget takes care of defining these types for you.

#### Action permissions

Permissions for who can run model actions and global actions are managed using Gadget's built in role-based access control system. To allow a role to run an action, you must grant that role the permission on the action using an appropriate tool.

Action permissions are NEVER specified in code within the action file or in the `options` object.

### Action triggers

Actions can be triggered by a variety of events. The events that trigger an action are defined in the action's `options` object. Available triggers:

- `api`: The most common trigger. Any action with this trigger is exposed as a mutation on the app's GraphQL API.
- `scheduler`: The action will be called on a user defined schedule. Only available on global actions.


You can change the triggers on an action by editing the action's js/ts file to modify the `triggers` key in the `options` object. Gadget has chosen good defaults for the triggers on actions that don't appear in the `options` object. Actions on user defined models have the `api` trigger by default. 



### Action inputs and outputs

Action input params are determined by the action's type as well as optional custom params that are defined by the action's params object.

For model actions, by default:

- a `create` action accepts each field on the corresponding model as an optional input param
- an `update` action requires an `id` param and accepts each field on the corresponding model as an optional input param
- a `delete` action with `delete` type requires an `id` param
- a `custom` action with `custom` type requires an `id` param

All of the model action types above as well as global actions can configure additional input params by exporting a `params` object, which is defined using a subset of JSON Schema. If you require more information about the params object, search the Gadget documentation for custom action params.

By default, model actions return the record they operated on as output, however they can configure their options to return the result of the `run` function instead. By default, global actions return the result of the `run` function.

### Action Typescript types

Gadget generated `ActionRun` and `ActionOnSuccess` types for each individual action, and uses TypeScript module augmentation to expose them in each action file automatically. Never import these types, as they are automatically present in the file's context already.

The `ActionOptions` type defines the valid options for an action. If you're adding options, use this type and import it from the `gadget-server` package.

Don't define your own `ActionRun` or `ActionOnSuccess` types, or your own `ActionContext` type, as the framework already has high quality versions of these types that are correct.

### Modifying records in model actions

In model actions, the `record` object is a `GadgetRecord` instance you can modify to update the database. Modify properties directly on the `record` object, and then use the `save` function to update the database.

```typescript
// in api/models/todos/actions/create.ts
import { applyParams, save, ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  // applies any incoming params from the API call to the record
  applyParams(params, record);

  // modifies the record before saving
  record.title = "new title";

  // saves the record to the database
  await save(record);
};
```

The `save` function only updates the record itself, and does not save any related records, even if they are loaded on the `record` instance passed to `save`. If you need to update related records, you must call other top-level actions with the `api` object, or call `save` on instances of those related records.

### Accessing related data in model actions

The `record` object passed to model actions does *not* have any relationships loaded. You must use the passed `api` object to load related records if needed.

```typescript
// in api/models/todos/actions/update.ts
import { applyParams, save, ActionOptions } from "gadget-server";
import { updateCategoryDetails } from "../../utils";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);

  // example: do something with the todo's category
  const category = await api.category.findOne(record.categoryId);
  await updateCategoryDetails(category);

  // continue processing the todo record
  await save(record);
};
```

If you want to modify other records in an action, you can call other top-level actions with the `api` object, or mutate records and save them with the `save` function if you don't want to run business logic on those other records. For this reason, don't set the value of hasMany, hasManyThrough, or hasOne fields on a `record` object, as this has no effect. To properly configure a relationship, the `belongsTo` field must be set to `{ _link: "<id>" }` with the ID of the related record.

### Calling actions

An example model create action:

```typescript
// in api/models/todos/actions/create.ts
import { applyParams, save, ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await save(record);
};

export const options: ActionOptions = {
  actionType: "create"
};
```

How you'd call this action given an instance of the API client as `api`:

```typescript
// imperatively
await api.todo.create({title: "example todo", completed: false,  creator: {_link: "123"}});

// enqueued in the background
await api.enqueue(api.todo.create, {title: "example todo", completed: false, creator: {_link: "123"}});

// in a React component
const [{ data, error, isLoading }, run] = useAction(api.todo.create);
run({title: "example todo", completed: false, creator: {_link: "123"}});
```

An example model update action:

```typescript
// in api/models/todos/actions/update.ts
import { applyParams, save, ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await save(record);
};

export const options: ActionOptions = {
  actionType: "update"
};
```

Example call:

```typescript
// imperative
await api.todo.update("123", {completed: true});

// enqueued
await api.enqueue(api.todo.update, "123", {completed: true});

// react
const [{ data, error, isLoading }, run] = useAction(api.todo.update);
run({id: "123", completed: true});
```

An example model delete action:

```typescript
// in api/models/todos/actions/delete.ts
import { deleteRecord, ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  await deleteRecord(record);
};

export const options: ActionOptions = {
  actionType: "delete"
};
```

Here's how you'd call this action:

```typescript
// imperative
await api.todo.delete("123");

// background
await api.enqueue(api.todo.delete, "123");

// react
const [{ data, error, isLoading }, run] = useAction(api.todo.delete);
run({id: "123"});
```


An example global action:

```typescript
// in api/actions/sendWelcomeEmail.ts
export const run: ActionRun = async ({ params, logger, api, connections }) => {
  const todos = await api.todo.findMany();
  for (const todo of todos) {
    await api.todo.delete(todo.id);
  }
};
```

Example call:

```typescript
// imperative
await api.sendWelcomeEmail();

// background
await api.enqueue(api.sendWelcomeEmail);

// react
const [{ data, error, isLoading }, run] = useGlobalAction(api.sendWelcomeEmail);
run();
```

  
All records returned by calls to the `api` object, or passed into actions, are instances of the `GadgetRecord` class. A `record` will hold only the data that was selected when it was first loaded, so if you need extra data or related record data, you must ensure you pass a `select` option wherever you load the data to populate the fields you need.

You can read and write properties of a record with normal dot-property access:

```typescript
// example server side code in an action

const record = await api.todo.findOne("123");
// get the title
console.log(record.title);
// set the title
record.title = "A new title";
// save the record
await save(record);
```

You can also ask record objects what has changed since they were loaded with the `.changes(field?: string)` function.

```typescript
const record = new GadgetRecord({ title: "Old title", body: "Old body" });
record.title = "New title";
record.body = "Old body";
record.price = 123.45;
console.log(record.changes());
// {
//   title: { changed: true, current: "New title", previous: "Old title" },
//   price: { changed: true, current: 123.45, previous: undefined }
// }
console.log(record.changes("title"));
// { changed: true, current: "New title", previous: "Old title" }
```

  
Backend routes are HTTP handlers that Gadget will serve for an app. Backend routes are created by adding TypeScript files named with the `<method>-<path>` convention into the `api/routes` folder, for example `api/routes/GET-hello.ts`.

Example backend route filename => matched requests:
api/routes/GET.ts => GET /
api/routes/GET-foo.ts => GET /foo or GET /foo/, but not GET /bar or POST /foo
api/routes/GET-[id].ts => GET /foo, GET /bar, GET /1 but not POST /foo or GET /foo/bar
api/routes/blogs/GET-[id].ts => GET /blogs/1, GET /blogs/welcome-to-gadget
api/routes/blogs/POST.ts => POST /blogs, but not POST /blogs/1
api/routes/category/[category]/blogs/GET-[id].ts => GET /category/cooking/blogs/1 or GET /category/baking/blogs/5
api/routes/repos/GET-[...].ts => GET /repos/foo or GET /repos/foo/bar/baz

By convention, URLs in Gadget apps are dash separated, like /foo/bar/baz-qux, and not camel cased, as web URLs are not reliably case sensitive. So, files should be named like `api/routes/foo/bar/GET-baz-qux.ts` instead of `api/routes/foo/bar/GET-bazQux.ts` or similar.

IMPORTANT: Don't use frontend style file based routing syntax for backend routes. In backend routes, square brackets denote a parameter, but in frontend routes, $ signs do.

Backend routes should have one default export of a single async function that accepts a request context object. By convention, keys from this context are destructured in the signature for use in the function body. The request context includes:

 - request - a FastifyRequest object describing the incoming HTTP request
 - reply - a FastifyReply object for sending an HTTP response
 - api - a connected, authorized instance of the generated API client for the current Gadget application.
 - applicationSession - a record representing the current user's session, if there is one.
 - applicationSessionID - the ID of the record representing the current user's session, if there is one.
 - connections - an object containing client objects for all Gadget-managed data connections this app has set up
 - logger - a Pino logger instance for structured logging (should be preferred over console.log)
 - config - an object of all the environment variables registered in Gadget's Environment Variables editor.
 - currentAppUrl - the current url for the environment. e.g. https://my-app.gadget.app

Backend route functions execute like a normal Fastify route handler. They don't need to return anything, and instead they need to await sending a reply to the client with the `reply` object. Unlike fastify or express, Gadget uses the full variable names `request` and `reply` for the request and reply objects instead of the shorthand `req` and `res`. Route options can be passed to fastify by setting the `options` property on the route function.

Here's an example backend route file:

```typescript
// in api/routes/quotes/GET-[id].ts
import { RouteHandler } from "gadget-server";

const route: RouteHandler = async ({ request, reply }) => {
  if (request.params.id == "1") {
    await reply.send("To be or not to be");
  } else {
    await reply.code(404).send("Unknown quote id: " + request.params.id);
  }
}

route.options = {
  // example route options
  logLevel: "warn",
  cors: {
    origin: true,
  },
};

export default route;
```

Backend routes should not be confused with frontend routes. Backend routes execute server-side only using Fastify, and frontend routes execute either server-side or client-side with using a framework like Remix or React Router. Frontend routes should be used for user-facing interface, like a sign-in page or home screen, and backend routes should be use for anything systems-facing or anything requiring server-side execution, like webhook handlers, health-monitoring endpoints, or image generation.

If this application is using TypeScript, be sure to import the `RouteHandler` type in the file, type the route function as a `RouteHandler`, and export the route as the default export. The `RouteHandler` can also be used for type safe handling of route parameters, request body, and request query parameters, in the same way that the `RouteGenericInterface` from `fastify` can be used.

Route params can be typed using the `Params` element of the `RouteHandler` type. If you know the route accepts an `id` parameter in the path, you can type the route function as follows:

```typescript
import { RouteHandler } from "gadget-server";

const route: RouteHandler<{ Params: { id: string } }> = async ({ request, reply }) => {
  const id = request.params.id;
}

export default route;
```

Route bodies can be typed using the `Body` element of the `RouteHandler` type. If you know the route accepts a `name` field in the body, you can type the route function and validate the body by passing a JSONSchema object to the `schema` option on the route function:

```typescript
// in api/routes/quotes/POST.ts
import { RouteHandler } from "gadget-server";

const route: RouteHandler<{ Body: { name: string } }> = async ({ request, reply }) => {
  const name = request.body.name;
}

// export the expected route schema within the route options
route.options = {
  schema: {
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
      },
      required: ["name"],
    },
  },
};

export default route;
```

The framework will validate the request body against the schema you provide, and will return a 400 error if the body is invalid, so don't add your own validation against the body schema. If extra validation that JSONSchema can't express is needed, you can add it in the route handler.

Be sure that the types you use for route parameters, request body, and request query parameters match the runtime options you set on the `route` object itself.

#### Backend route CORS configuration

You can set CORS handling for a route easily using the `route.options.cors` property. When adding a new backend route, consider if the route is likely to be called from different origins, and if so, set a CORS policy to allow requests from those origins. If uncertain about the origins, set the `origin` option to `true` to allow requests from any origin and leave a comment indicating this is the case and that the developer may want to make it more restrictive if necessary.

```typescript
// in api/routes/quotes/POST.ts
import { RouteHandler } from "gadget-server";

const route: RouteHandler = async ({ request, reply }) => {
  await reply.send("hello world");
}

// export the route options with the cors property set
route.options = {
  cors: {
    // allow only requests from https://my-cool-frontend.com
    origin: ["https://my-cool-frontend.com"],
    // allow only GET, POST, and PUT requests
    methods: ["GET", "POST", "PUT"],
  },
};

export default route;
```

Or to allow requests from any origin:

```typescript
route.options = {
  cors: {
    origin: true,
    // ... more options here if needed
  },
};
```


#### Supported CORS options

The cors route option supports the following options:

- origin: the origin or origins to allow requests from. Can be a string, an array of strings, a boolean, or a function that returns a string or array of strings. Defaults to "*", which allows requests from any origin.
- methods: the HTTP methods to allow requests for. Can be a string, an array of strings, or a function that returns a string or array of strings. Defaults to ["GET", "HEAD", "POST"].
- allowedHeaders: the headers to allow requests for. Can be a string, an array of strings, or a function that returns a string or array of strings. Defaults to undefined, which will send all headers allowed by the request's Access-Control-Request-Headers header.
- exposedHeaders: the headers to expose to the client. Can be a string, an array of strings, or a function that returns a string or array of strings. Defaults to undefined, which won't send any exposed headers for preflight requests.
- credentials: whether to allow requests with credentials. Can be a boolean, or a function that returns a boolean. Defaults to false.
- maxAge: the maximum age of the CORS preflight request in seconds. Can be a number, or a function that returns a number. Defaults to undefined, which won't send any max age headers for preflight requests.
- cacheControl: the cache control directive to use for the CORS preflight request. Can be a number, or a function that returns a number. Defaults to undefined, which won't send any cache control headers for preflight requests.
- optionsSuccessStatus: the status code to use for successful OPTIONS requests. Can be a number, or a function that returns a number. Defaults to 204, which is the default status code for successful OPTIONS requests.
- strictPreflight: whether to enforce strict requirement of the CORS preflight request headers (Access-Control-Request-Method and Origin). Can be a boolean, or a function that returns a boolean. Defaults to true.

You can also set CORS options for all routes in a route scope by calling `server.setScopeCORS()` in an app-level route plugin file:

```typescript
// in api/routes/+scope.ts route plugin file
import type { Server } from "gadget-server";

export default async function (server: Server) {
  server.setScopeCORS({
    origin: ["https://my-cool-frontend.com"],
    methods: ["GET", "POST", "PUT"],
  });
}
```

  
Gadget apps can host frontends built using React and Vite. This frontend part of the application lives in the `web` directory, and shares the root `package.json` file with the backend. The root level `vite.config.mjs` file is always already set up to serve the app in the `web` folder.











React components that are re-used in multiple frontend routes should be placed within `web/components` or a subdirectory unless explicitly instructed otherwise. New components you create should use named exports, and be imported using named imports unless there's a strong reason not to.

### React hooks from `@gadgetinc/react`

Gadget provides a wide set of React hooks for building frontend applications with react from within the `@gadgetinc/react` package, which comes pre-installed in every Gadget app. The `@gadgetinc/react` package includes the hooks listed in the <gadget_inc_react_hooks> tag.

#### Hooks in `@gadgetinc/react`
 - `useFindOne(manager, id, options?): [{data, fetching, error}, refetch]` - fetches a single record by ID, throwing if not found.
 - `useMaybeFindOne(manager, id, options?): [{data, fetching, error}, refetch]` - fetches a single record by ID, returning null if not found.
 - `useFindMany(manager, options?): [{data, fetching, error}, refetch]` - fetches multiple records with filters and pagination.
 - `useFindFirst(manager, options?): [{data, fetching, error}, refetch]` - fetches the first record matching the criteria.
 - `useFindBy(findFunction, fieldValue, options?): [{data, fetching, error}, refetch]` - fetches a record by a unique field value.
 - `useAction(action, params, options?): [{data, fetching, error}, run]` - runs one model action against a record of that model
 - `useGlobalAction(action, params, options?): [{data, fetching, error}, run]` - runs one global action
 - `useGet(singletonModelManager, options?): [{data, fetching, error}, refetch]` - retrieves the current singleton record for a singleton model
 - `useEnqueue(action, params, options?): [{data, fetching, error}, run]` - enqueues a model action or global action to be run in the background
 - `useActionForm(action, params, options?): [{data, fetching, error}, run]` - headlessly manages state for a form that calls a model action or global action using react-hook-form
 - `useList(model, options?): [{data, fetching, page, search, error}, refresh]` - headlessly manages fetching records and pagination state for a list of records
 - `useTable(model, options?): [{data, fetching, page, search, sort, selection, error}, refresh]` - headlessly manages fetching records and pagination state for a sortable table of records
 - `useFetch(path: string, options: RequestInit = {}): [{data, fetching, error}, refetch]` - fetches remote content over HTTP using Gadget's built in authentication mechanisms, like a backend route or a 3rd party API
 - `useSession(): Session` - retrieves the currently authenticated session record from the backend
 - `useUser(): User | null` - retrieves the currently authenticated user record from the backend

IMPORTANT: `useGadget` is not available in the `@gadgetinc/react` library.




### Frontend data fetching

Frontend routes that need dynamic data should use hooks from the `@gadgetinc/react` package to fetch or mutate data from the backend.

The hooks from `@gadgetinc/react` automatically enforce permissions, correctly manage re-fetching data as other data is changed, and are type-safe.

For example, in a todo application, we can render a list of todos powered by the `useFindMany` hook `web/routes/_app.todos.tsx`:

```typescript
import { useFindMany } from "@gadgetinc/react";
import { api } from "../api";

export default function () {
  const [{data, fetching, error}] = useFindMany(api.todo);

  if (fetching) {
    return "Loading";
  }

  if (error) {
    return "Error: " + error;
  }

  return <ul>
    {data.map(todo => <li key={todo.id}>{todo.title}</li>)}
  </ul>;
}
```;

You can use the `select` option to select specific fields of the records you need, or fields of related records.

```typescript
// select the first page of todos, including the todo's id and title, and the todo's related category record's id and title
const [{data, fetching, error}] = useFindMany(api.todo, {
  select: {
    id: true,
    title: true,
    category: {
      id: true,
      title: true,
    },
  },
});
```;

When invoking hooks like this, prefer invoking one big hook that selects all the data you need to invoking the hooks multiple times with different models to then associate the data client side. If you need different filters, sorts, or views of the same model though, you can invoke multiple hooks.

### Frontend mutations

Frontend routes that need to run mutations should use Gadget's `useAction` or `useGlobalAction` React hooks (and not use Remix actions). Unlike Remix actions, these hooks automatically enforce permissions and are type-safe. The callbacks for these hooks are defined by the associated Gadget action and must be invoked with the correct arguments.

For example, in a todo application, we can create a todo item with a `useAction` hook in `web/routes/_app.create-todo.tsx`:

```typescript
import { useState } from "react";
import { useAction } from "@gadgetinc/react";
import { api } from "../api";

export default function () {
  const [{data, fetching, error}, create] = useAction(api.todo.create);

  const [title, setTitle] = useState("");

  return <form onSubmit={(event) => {
    event.preventDefault();
    void create({title: title, creator: {_link: "123"}});
  }}>
    {fetching && "Saving"}
    {error && `There was an error! ${error}`}
    <label for="title">Title:</label>
    <input name="title" value={title} onChange={(event) => setTitle(event.currentTarget.value)}/>
  </form>
}
```;

#### Updates and Custom Actions

You can use the `useAction` hook to run update actions or custom actions on specific records. Note that the `useAction` hook takes all the parameters for an action in object form, so you need to pass the record's id as a key in this object, not as the sole parameter.

For example, in a todo application, we can update a todo item with a `useAction` hook:

```typescript
import { useAction } from "@gadgetinc/react";
import { api } from "../api";

export default function () {
  const [{data, fetching, error}, update] = useAction(api.todo.update);

  // in some callback
  const handleSubmit = (event) => {
    void update({id: 1, title: title, creator: {_link: "123"}});
  }

  // ui omitted for brevity
}
```;

#### Deletes

You can use the `useAction` hook to run the delete action on specific records. Note that the `useAction` hook takes all the parameters for an action in object form, so you need to pass the record's id as a key in this object, not as the sole parameter.

For example, in a todo application, we can delete a todo item with a `useAction` hook:

```typescript
import { useAction } from "@gadgetinc/react";
import { api } from "../api";

export default function () {
  const [{data, fetching, error}, runDelete] = useAction(api.todo.delete);

  // in some callback
  const handleSubmit = (event) => {
    void runDelete({id: 1});
  }

  // ui omitted for brevity
}
```;



### Accessing an instance of the api client

Frontend Gadget applications almost always have a module that exports an instance of the API client object for use in frontend components at `web/api.ts`. This file is automatically added by Gadget and exports the instance under the `api` variable.

When making API calls with React hooks, or passing the api object's functions to hooks and components, ensure you import the `api` object from the `web/api.ts` file using a correct *relative* import.

For a route at `web/routes/foo.tsx`, the `api` object should be imported from `../api.ts`:

```typescript
import { api } from "../api";

export default function () {
  api.todo; // the todo model manager object is accessible here
  return <div>Hello world</div>;
}
```

For a component at `web/components/some-section/some-page/Header.tsx`, the `api` object should be imported from `../../../api.ts`, etc.

Use of the `useApi` hook from `@gadgetinc/react` is strongly discouraged because it returns a generic type instead of the app's specific API client's type, and can thus conceal very bad errors.

  
Gelly is a special expression language developed by Gadget for controlling permissions and computing field values using 'computed fields'. Files ending in `.gelly` are Gelly files.
Gelly supports literals for a variety of built-in data types that you can use in your expressions.
Below are some basic examples of Gelly code in different use cases:
<access control>
Use case: create a filter that only lets users see records from the "Post" model that have the published field set to a truthy value.
```gelly
filter($session: Session) on Post [
  where published
]
```
Use case: create a filter that only lets users see their own posts.
```gelly
filter ($session: Session) on Post [
  where userId == $session.userId
]
```
</access control>
<computed fields>
Use case: create a computed field to the "customer" model that combines the "firstName" field and "lastName" field of a user to create a full name.
```gelly
field on customer {
  concat([firstName, " ", lastName])
}
```
Use case: the "user" model has a field called "chatMessages" that is a hasMany relationship to the "chatMessage" model. Create a computed field to the "user" model that sums the "tokenCount" field from of all "chatMessages" records created in the past 30 days.
```gelly
field on user {
  sum(chatMessages.tokenCount, where: chatMessages.createdAt > now() - interval("30 days"))
}
```
Use case: create a computed field to round a number with 2 decimal places.
```gelly
field on user {
  round(count, precision: 2)
}
```
</computed fields>

  
Gadget offers a built-in authentication system that can be used to secure an app. It's much, much better to use Gadget's user authentication system than to implement your own. If you select the WebAppWithAuth or InternalTool template, Gadget will automatically create a `user` model and manage user authentication for you. The `user` model has the following fields:
 - `firstName`, string
 - `lastName`, string
 - `email`, string, required, unique
 - `googleProfileId`, string, optional, and only set when the user authenticates with Google
 - `password`, string, optional, encrypted at rest, and only set when the user authenticates with email/password
 - `roles`, array of role names, required, must have at least one role
 - `emailVerified`, boolean, required, defaults to false, set to true when the user verifies their email
 - `googleImageUrl`, url string, optional, and only set when the user authenticates with Google
 - `lastSignedIn`, datetime, optional, set to the current time when the user signs in
 - `emailVerificationToken`, string, optional, and only set when the user signs up with an email and used as a secret for verification
 - `emailVerificationTokenExpiration`, string, optional
 - `passwordResetToken`, string, optional, and only set when the user requests a password reset
 - `passwordResetTokenExpiration`, string, optional
 - `createdAt`, datetime, required, defaults to the current time
 - `updatedAt`, datetime, required, defaults to the current time
 - `id`, number, required, auto-incrementing primary key

The `user` model comes with the following actions:
 - `signUp`: `actionType: "create"`, creates a new user, and if the user is signing up via `emailSignUp` trigger, an email is sent to the user's email address with a link to verify it
 - `signIn`: `actionType: "update"`, signs in a user after either the `emailSignIn` or `googleOAuthSignIn` has authenticated them
 - `signOut`: `actionType: "update"` signs out a user by clearing the session record of the current user; Gadget will automatically clear the session cookie on the client side when this action is run
 - `sendVerifyEmail`: `actionType: "custom"`, sends a verification message to the user's email so they can prove they own it
 - `sendResetPassword`: `actionType: "custom"`, sends password reset instructions to the user's email
 - `verifyEmail`: `actionType: "custom"`, verifies a user's email when called with a valid code
 - `resetPassword`: `actionType: "custom"`, resets a user's password to a new one given a reset code from a reset email
 - `changePassword`: `actionType: "update"`, changes a user's password to a new one given the old one
 - `update`: `actionType: "update"`, updates a user's details like their profile
 - `delete`: `actionType: "delete"`, deletes a user

 IMPORTANT: These actions within the Gadget framework are set up out of the box to provide best practices for authentication, you should not need to change them to implement standard authentication functionality. However, if there are additional requirements specified in your instructions you may modify them, for example to send a notification message to a slack channel when a user signs up.

IMPORTANT: Never use the `user` model or the WebAppWithAuth or InternalTool templates for Shopify apps. Shopify requires its own special authentication system for it's embedded admin UI, and the `user` model is incompatible with this system.

#### Gadget Auth Frontend Routes

The Gadget authentication system includes a set of frontend routes that are used to sign up, sign in, verify emails, and reset passwords by default. These routes are located in the `web/routes` directory. By default, the routes are nested under one of three layouts, `_public` for public content, `_auth` or `_app`, which control the look and feel of the routes.

The _public layout is used for routes that are meant to be shown to unauthenticated users, the _auth layout is to display sign-in/sign-up and other auth forms like forgot password, and the _app layout is used for routes that are for signed in users.

The included routes are:

- _auth.sign-in.tsx: Provides the /sign-in path, this route is for existing users to sign in to the app.
- _auth.sign-up.tsx: Provides the /sign-up path, this route is for new users to sign up for the app.
- _auth.verify-email.tsx: Provides the /verify-email path, this route is for users to verify their email address when they follow the link in the verification email.
- _auth.forgot-password.tsx: Provides the /forgot-password path, this route presents a form for users to enter their email to receive a password reset email.
- _auth.reset-password.tsx: Provides the /reset-password path, this route is for users who follow a password reset link in an email, if loaded with a valid token they are presented with a form to enter their new password.
- _app.signed-in.tsx: Provides the /signed-in path, protected by the _app layout, this route is the default page for authenticated users to land on. Feel free to change the name of this route to whatever makes sense for your app

Note that these routes, including their content, loaders, and actions are set up to work well with Gadget's authentication system by default. You do not need to change them to implement standard authentication functionality. It is likely that you will want to change the look and feel of these routes to match the rest of the app. You may also want to add additional content to these routes and to provide links to the additional pages in the app.

  
## Shopify plugin

Gadget supports a managed data integration to Shopify, where Gadget will automatically sync data out of Shopify into a data model with a matching schema in this Gadget app. Gadget makes every field from Shopify's REST or GraphQL API available on these data model implicitly, and manages receiving webhooks and syncing data to populate the model's data. You don't need to add fields to represent Shopify data -- Gadget will add all the fields Shopify has for you. For fields managed by Shopify, you can't change the type or add validations, as Shopify has decided the nature of the field already.

The only valid Shopify models are those listed in the function schema -- no others are available. Every Gadget app with a Shopify connection will have the `shopifyShop` model automatically added. Any Shopify GDPR handling will be done through the actions on the `shopifyGdprRequest` model.

### Extending Shopify models

Models owned by Shopify can be extended with fields that this app defines to store extra data beyond what Shopify supports out of the box. We refer to these fields as first-party fields on third-party models (like Shopify models). These fields store extra data about Shopify orders, products, etc without Shopify needing to support them explicitly, or needing to split data up into two different models and do custom joins between them. These fields are just like any other on any other Gadget model and can be managed using the same Gadget API and frontend components as other data. If necessary, these fields can also represent metafields from Shopify.

For example, if building a fraud review system, you could add new first party fields to the `shopifyOrder` model to track fraud review state, like a `hasBeenReviewed` boolean and an `fraudResults` string.

All field types including relationships are supported for first-party fields on third-party models. Similarly, first-party models can create relationship fields that point to third-party models.

For example, for a Shopify shop which builds bicycles, you could chose to add the third-party `shopifyOrder` model to an application to get all of a Shopify store's orders, and then create a first party `buildOrder` model on the app to track the state of each bicycle that needs building. If every order only ever had one bike, you could make  `shopifyOrder` have a `belongsTo` field pointing to `buildOrder`, or if more than one bike could be on an order, you could have `shopifyOrder`have a `hasMany` field powered by a `belongsTo` field on `buildOrder`.

Important: first-party fields that are added to Shopify models must not have required validations.


### Shopify app proxy

Gadget supports the Shopify app proxy feature. A Shopify app proxy is a mechanism that allows a Shopify app to securely serve dynamic content from an external server (in this case, Gadget) through the Shopify store's domain, such as yourstore.myshopify.com. Shopify has a guide on what app proxies are: https://shopify.dev/docs/apps/build/online-store/display-dynamic-data.
An app proxy provides a secure tunnel to pass requests from Shopify to your app server, allowing the app to return dynamic content as if it's coming from Shopify's domain.
IMPORTANT: App proxies are only available in Shopify theme extensions and check out UI extensions. DO NOT set up app proxies in Shopify embedded admin UI.

In Gadget, you can proxy the Gadget API requests via the Shopify app proxy by doing the following steps:
1. Define the app proxy in the Shopify app configuration TOML file.
```toml
[app_proxy]
url = "https://app-slug--development.gadget.app/api/graphql"
subpath = "app-slug-development-api" # Can be any string, but MUST be unique to the app because it can have conflicts with other app proxies. Suggest adding some extra characters to make it unique.
prefix = "apps" # Shopify doesn't support custom prefixes, so always use "apps" as the prefix.
```

2. Add `endpoint` property when initializing the Gadget client.
```liquid
// Inside the extension's .liquid file where you initialize the Gadget client
const api = new Gadget({
  // The `endpoint` is constructed from the `prefix` and `subpath` as defined in the Shopify app configuration TOML file. The format is /{prefix}/{subpath}
  // Read the app's TOML file to find out the actual values for `prefix` and `subpath`.
  endpoint: "/apps/app-slug-development-api"
});
```

3. In the terminal, run `yarn shopify:dev` to preview the changes.


### Shopify metafields

Shopify metafields provide a means to expand Shopify's data model by storing additional information on various resources such as orders, products, customers, and the shop itself. They are commonly utilized in custom and public app development to enhance the functionality and user experience of Shopify apps.

While metafields are valuable for app development, working with them can be challenging for developers. The data is stored in a separate resource known as the "metafield object" on Shopify's end, whereas developers typically prefer the data to be directly associated with the resource they are extending. Moreover, Shopify's API rate limits can add complexity to the process of navigating across these additional resources.

To simplify the developer experience, Gadget offers a streamlined solution that enables fast synchronization, querying, and mutation of Shopify metafields within the backend of the app. This feature provides developers with efficient tools to manage metafields, reducing the complexities associated with working with metafields and improving the overall development workflow.

Gadget allows you to store metafield data directly on any of the following Shopify resources:

- shopifyAppInstallation
- shopifyCompany
- shopifyCompanyLocation
- shopifyArticle
- shopifyBlog
- shopifyCollection
- shopifyCustomer
- shopifyDiscount
- shopifyDraftOrder
- shopifyLocation
- shopifyMarket
- shopifyOrder
- shopifyProductImage
- shopifyProduct
- shopifyProductVariant
- shopifyShop
- shopifySellingPlan

To do this you add a field to the Shopify model you are extending, and add `shopifyMetafield` metadata:

- namespace: the namespace of the metafield as registered in Shopify. Note that to use app-owned metafields, Gadget supports adding the `$app:` prefix to the namespace.
- key: the key of the metafield as registered in Shopify.
- metafieldType: the type of the metafield as registered in Shopify
- allowMultipleEntries: whether the metafield allows multiple entries; and is one of the metafield types that start with `list.`

Only certain Gadget field types support metafields, and for each Gadget field type there are corresponding Shopify metafield types that can be used.

The following are the Gadget field types that support metafields, along with the corresponding Shopify metafield types that can be used:

- Gadget field type: Number. Allowed Shopify metafield types: single_line_text_field, multi_line_text_field, number_integer, number_decimal
- Gadget field type: String. Allowed Shopify metafield types: single_line_text_field, multi_line_text_field, number_integer, number_decimal, color, product_reference, page_reference, variant_reference, file_reference, date, date_time, url, collection_reference, metaobject_reference, mixed_reference, article_reference
- Gadget field type: Enum. Allowed Shopify metafield types: single_line_text_field, multi_line_text_field, number_integer, number_decimal
- Gadget field type: DateTime. Allowed Shopify metafield types: single_line_text_field, multi_line_text_field, date, date_time
- Gadget field type: Email. Allowed Shopify metafield types: single_line_text_field, multi_line_text_field
- Gadget field type: Color. Allowed Shopify metafield types: single_line_text_field, multi_line_text_field, color
- Gadget field type: URL. Allowed Shopify metafield types: single_line_text_field, multi_line_text_field, url
- Gadget field type: BelongsTo. Allowed Shopify metafield types: single_line_text_field, multi_line_text_field, number_integer, product_reference, page_reference, variant_reference, collection_reference, metaobject_reference, article_reference
- Gadget field type: Boolean. Allowed Shopify metafield types: single_line_text_field, multi_line_text_field, boolean
- Gadget field type: JSON. Allowed Shopify metafield types: single_line_text_field, multi_line_text_field, list.single_line_text_field, list.page_reference, list.product_reference, list.variant_reference, list.file_reference, list.number_integer, list.number_decimal, list.date, list.date_time, list.url, list.color, list.weight, list.volume, list.dimension, list.rating, list.collection_reference, list.metaobject_reference, list.mixed_reference, list.link, list.article_reference, json, rating, weight, dimension, volume, money, link

Note: if you are setting up a metafield or metaobject that accepts multiple entries (i.e. it is of type `list.*`), the Gadget field type must be `JSON`.

If the user requests for adding or updating a metaobject (or metaobject reference), the metafield type should be "metaobject_reference". Unless the user explicitly mentions that it allows multiple entries, the metafield should not allow multiple entries.

When Gadget registers webhooks for Shopify, it will automatically register the metafield namespaces of all fields that are marked as metafields, so that webhooks from shopify automatically sync data to the metafield fields.

Other Shopify models represented in Gadget do not support metafields.

#### Storing reference metafield types as relationships

You can store reference metafields in relationship fields in Gadget. The reference id stored in the metafield will be automatically parsed by Gadget and, if the related record exists in your Gadget database, the relationship to the existing record will be created.

For example, if you want to store a page_reference metafield on your shopifyProduct model, you can:

- set up a `shopifyMetafield` field on the shopifyProduct model
- set the field type in Gadget to a `belongsTo` relationship
- set the inverse of the relationship as either a `hasOne` or `hasMany` so that, for example, shopifyPage has many shopifyProduct.

Gadget will parse any incoming gid values (sent via the reference metafield types) from Shopify and create the relationship. You can then access related record information as you would with any other relationship in Gadget.

#### Creating a relationship to a custom model

You can store a reference to a first party model record in a metafield. The metafield value in Shopify can be stored as a `number_integer` or `single_line_text_field` metafield type. The value stored in the metafield should be the related first party model record's id in your Gadget database.

For example, if you have a first party model called `bike` and you want to store a reference to a bike record on a `shopifyProduct` model as a metafield, you can:

- set up a `shopifyMetafield` field on the shopifyProduct model
- set the field type in Gadget to a `belongsTo` relationship
- set the inverse of the relationship as either a `hasOne` or `hasMany` so that, for example, bike has one shopifyProduct

You can then store id values for a bike record as a metafield on products in Shopify. Gadget will automatically create the relationship on the incoming webhook, and you can access bike record information from your shopifyProduct records like you would any other relationship in Gadget.

#### Storing metaobject reference metafields

You can store metaobject reference metafields in Gadget. Metaobjects are similar to metafields, but they don't need to be tied to a Shopify resource.

Note that we only store the identifier of the metaobject record in Shopify, not the data itself. If the user wants to sync metaobject data from Shopify to Gadget, you will need to do so manually:

- Create custom models in Gadget that match your metaobject definitions used to store the metaobject data
- An action that can be triggered manually, on a schedule, or as part of some other action (ie. store install) that manually fetches metaobjects stored in Shopify. Note that you will need to deal with Shopify rate limits and add retry logic yourself.

You can use Shopify's GraphQL API to read, create, update, and delete metaobject definitions. Note that you need the `read_metaobject_definitions` Shopify access scope to read metaobject definitions, and the `write_metaobject_definitions` scope to create, update, or delete metaobject definitions.

Example model action code to create metaobject definitions:
```typescript
export const onSuccess: ActionOnSuccess = async ({ params, record, logger, api, connections }) => {
  // Create a metaobject definition to the Shopify store.
  await api.enqueue(api.writeToShopify({
    shopId: record.shopId,
    mutation: `
    mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition {
          id
          name
          type
          fieldDefinitions {
            name
            key
          }
        }
        userErrors {
          field
          message
          code
        }
      }
    }
    `,
    variables: {
      definition: {
        name: "Color swatch",
        type: "color-swatch",
        fieldDefinitions: [
          {
            name: "Hex",
            key: "hex",
            type: "single_line_text_field",
            validations: [
              {
                name: "regex",
                value: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              }
            ]
          }
        ]
      }
    },
  }));
};
```

You can also use Shopify's GraphQL API to read, create, update, and delete metaobjects data. Note that you need the `read_metaobjects` Shopify access scope to read metaobject data, and the `write_metaobjects` scope to create, update, or delete metaobjects.

Example model action code to create metaobjects data:
```typescript
export const onSuccess: ActionOnSuccess = async ({ params, record, logger, api, connections }) => {
  // Create a metaobject to the Shopify store.
  await api.enqueue(api.writeToShopify({
    shopId: record.shopId,
    mutation: `
    mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject {
          handle
          season: field(key: "season") {
            value
          }
        }
        userErrors {
          field
          message
          code
        }
      }
    }
    `,
    variables: {
      metaobject: {
        type: "lookbook",
        handle: "winter-2023",
        fields: [
          {
            key: "season",
            value: "winter"
          }
        ]
      }
    }
  }));
};
```

#### Querying metafields

Gadget's metafields help with:
 - fetching data, you can easily retrieve metafields along with other fields from your models
 - rich filtering simultaneously on metafields and Gadget-stored fields, including range queries, which Shopify doesn't support out of the box

An example of a range query on `spiciness`, a metafield stored on `shopifyProduct`, to fetch products that have a spiciness rating of greater than 5:

```typescript
const products = await api.shopifyProduct.findMany({
  filter: {
    spiciness: {
      greaterThan: 5,
    },
  },
  sort: {
    spiciness: "Ascending",
  },
  select: {
    id: true,
    title: true,
    handle: true,
    spiciness: true,
  },
});
```

#### Writing to metafields

To write metafields back to Shopify, follow the instructions for writing data back to Shopify. An example action that writes a metafield to `shopifyProduct`:

```typescript
// in api/models/shopifyProduct/actions/update.ts
export const run: ActionRun = async ({ api, record }) => {
  if (record.changed("title")) {
    await api.enqueue(api.writeToShopify({
      shopId: record.shopId,
      mutation: `
      mutation ($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
          }
          userErrors {
            message
          }
        }
      }
      `,
      variables: {
        metafields: [
          {
            key: "a_metafield",
            namespace: "test321",
            ownerId: `gid://shopify/Product/${record.id}`,
            type: "single_line_text_field",
            value: record.title + " as a metafield!",
          },
        ],
      },
    }));
  }
};
```

IMPORTANT: when writing metafields or metaobjects back to Shopify, if the field you're writing is a reference (for example, a "product reference" or "file reference"), the value you pass to the `value` field MUST be strings that start with `gid://`. Example:

- Product variant reference: `gid://shopify/ProductVariant/1234567890`
- File reference: `gid://shopify/File/1234567890`

### Data syncing

Gadget's Shopify plugin automatically retrieves changes to Shopify data into Gadget models in a robust, performant way. Gadget's Shopify plugin does *not* sync data back from this Gadget app into Shopify. To do that, you can define business logic in code that makes API calls to Shopify.

### OAuth scopes

By default, Gadget will request the minimum set of OAuth scopes necessary to power reading data for the models you select. If you also need to write back to Shopify to any of these resources with Shopify API calls, then you must also get the write OAuth scopes for these models.

### Access control

For Shopify apps, merchants use the app via the app's embedded frontend within the Shopify Admin. The Gadget framework automatically authenticates these requests, recording each shop in the `shopifyShop`s table after facilitating OAuth. For each incoming request, the framework authenticates the request and assigns a `session` record with the `shopify-app-users` role. In order to make model data readable by Shopify merchants, you must grant the `shopify-app-users` role read access on the models you want to be visible. You should add a `belongsTo` field pointing to the `shopifyShop` model on any new first party models, and then when granting read permissions on these models, grant them with a tenancy restriction on the `shop` field. This ensures merchants can only view data for their own shop.

### Creating first party models in a Shopify app

Generally, any first-party models created in a Shopify app only concern one Shopify shop. Merchants from one shop shouldn't be able to read or write data for other unrelated shops. To implement this, add a `belongsTo` field named `shop` on each first-party model pointing to the `shopifyShop` model, and then only grant read access on the model to the `shopify-app-users` role with a tenancy restriction on this `shop` field. This limits all access to the first-party model to only the records for a single shop. You must do this for all models that should have tenancy applied and aren't already powered by the Shopify plugin, including children in relationships. This has already been done to the `session` model, and doesn't need to be done to the `shopifyShop` model.

Each first-party model has independent permissions that must be specified separately. If a model's data is specific to one shop, you should add a `belongsTo` field pointing to the `shopifyShop` model and a tenancy restriction on this field so other shops can't access the data. This applies to every level of model in a relationship tree -- there's no permission inheritance from parent models.

### Accessing a Shopify API Client

Within backend code, you can access a pre-constructed Shopify API client on the `connections.shopify` object available in action, route, and loader contexts. `connections.shopify` is a `ShopifyConnection` helper object with functions for accessing already-created API Client objects using the `shopify-api-node` client library.

- `connections.shopify.current` returns a Shopify API client for the current shop if there is one in context. For Public Shopify apps making requests from an embedded app, Gadget is able to track the shop making the request and populate this value.
- `connections.shopify.forShopId` allows creating a `Shopify` client instance for a specific shop ID
- `connections.shopify.forShopDomain` allows creating a `Shopify` client instance for a specific myshopify domain.

For example, we can use `connections.shopify` to access a Shopify client for a given store and then make a call to the Products GraphQL API in Shopify to create a new product record:

```typescript
// in api/models/shopifyProduct/actions/custom.ts

export const onSuccess: ActionOnSuccess = async ({ connections }) => {
  const desiredShopifyStoreDomain = "the-store.myshopify.com";
  const shopifyClient = await connections.shopify.forShopDomain(desiredShopifyStoreDomain);

  await shopifyClient.graphql(
    `mutation ($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          title
          descriptionHtml
          tags
        }
      }
      userErrors {
        message
      }
    }`,
    {
      input: {
        title: "New Product",
        descriptionHtml: "This is the latest product on The Store",
        tags: ["product", "new"],
      },
    }
  );
};
```

The `connections.shopify.current` API client instance is instantiated with credentials for the current shop calling your backend code. The current shop is chosen based on the authentication of the request to the backend. `connections.shopify.current` will be undefined if the request to the backend is made outside of a Shopify-authenticated context.

Gadget uses `shopify-api-node` to make Shopify API calls, not the official Shopify API client. Don't use call signatures from the `@shopify/admin-api-client` package by accident.

You can't access a Shopify API client in frontend code.

### Writing data back to Shopify

To avoid exceeding Shopify's API rate limits, you should avoid making direct calls to Shopify unless absolutely necessary. Instead, queue write calls by enqueueing the `writeToShopify` global action. Pass the `writeToShopify` action the `shopId` of the shop you're writing to, a GraphQL mutation, and the GraphQL variables for the mutation.

```typescript
await api.enqueue(api.writeToShopify, {
  shopId: "123",
  mutation: `mutation { ... }`,
  variables: { foo: true },
});
```

### General Shopify instructions

When designing data models for Gadget apps that work with Shopify, don't duplicate functionality that the Shopify plugin already provides. Instead, extend Shopify models with first-party fields when you need to store additional data on Shopify resources like orders, products, etc. Don't create new first party models that could instead be a Shopify model. For example, a `product` model should not be created, as the `shopifyProduct` model already exists and automatically syncs data from Shopify. Similarly, a `merchant` model should not be created, as the `shopifyShop` model already represents the same thing and automatically tracks install state and all other shop metadata.


By convention Shopify app extensions are located in the `/extensions` directory of the app. Each app extension should have its own subdirectory, and must include a `shopify.extension.toml` file.



Shopify has set up their app extension development experience to be centered around their CLI tooling. This means that when developing any Shopify app extension with Gadget, users must use a command line tool for developing their extension and deploying their app extension to Shopify.

Gadget provides two options for this to make it as easy as possible:

1. Use the terminal that is built into the cloud IDE to run all of the shopify CLI commands. If the use has authenticated themselves to the Shopify partner platform through Gadget, then their cloud terminal session will already be set up and authenticated to Shopify.
2. Using the `ggt` command line tool along with the Shopify CLI to develop and deploy your app extension locally.

Option 1 is the easiest option and requires no additional setup from the user.

Option 2 requires the user to follow the instructions below to install the Shopify CLI and `ggt`.

Unless otherwise specified you should steer the user towards option 1 and use the terminal tools made available to you.

### Installing the Shopify CLI and `ggt` on a local machine
To install the Shopify CLI run:
```shell
npm install -g @shopify/cli@latest
```
To install `ggt` run:
```shell
npm install -g ggt@latest
```
Users can verify that they have the Shopify CLI installed by running:
```shell
shopify --version
```
Users can verify that they have `ggt` installed by running:
```shell
ggt --version
```
In order to develop Shopify app extensions with Gadget, users should choose a directory that they want to develop Gadget apps in locally. The usual location is `~/gadget`.
Users can start developing their Gadget app locally by changing directories this location and running:
```shell
ggt dev
```
This will sync the Gadget app, including the Shopify app extension, to the local directory.

The app's package.json should have a yarn script that will start the Shopify CLI dev server for the extension.

Users can develop their extension locally by running:
```shell
yarn shopify:dev
```

# Shopify Extension Rules
When building a Shopify extension, you should follow these rules as closely as possible.

## Filename shouldn't include hyphens, use camel case instead
Due to a limitation in Shopify's CLI, the filename shouldn't include hyphens. Use camel case instead.


When building a Shopify theme extension, know that you will have access to javascript client that can read and write from the Gadget app. The client will be available in the global context of the liquid page because it's injected in as a script tag.

# Theme Extension Rules
When building a theme extension, you should follow these rules as closely as possible.

## Schema Variables
It's possible for a theme extension block to have to take a schema variable and define in the liquid code. For example, if the block has a `number-of-questions` schema variable, the block should define a `number_of_questions` variable in the schema as a setting. You can assign it in liquid like so:

```liquid
{% assign number_of_questions = block.settings.number_of_questions %}
```

## Default values
Always set a default value on schema settings, where it makes sense.

## Accessing Gadget Records
When building a theme extension, you will often need to access Gadget records. If it makes sense, you should define a way to query for the records in the block.

As an example, if the block will display a record from the Gadget backend, the block should define an `id` prop that will be used to query for the record.