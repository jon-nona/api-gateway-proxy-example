# Api Gateway Proxy Example :: Project Structure & Conventions <!-- omit in toc -->

## Table Of Contents <!-- omit in toc -->

- [Folder Structure](#folder-structure)
- [File and Folder Naming Conventions](#file-and-folder-naming-conventions)

## Folder Structure

The following is the folder structure used for the project

```shell
├── README.md
├── bin
│   └── api-gateway-proxy-example.ts
├── cdk
│   └── api-gateway-proxy-example-stack.ts
├── cdk.context.json
├── cdk.json
├── commitlint.config.js
├── docs
│   ├── contributing.md
│   ├── debugging.md
│   ├── gotchas.md
│   ├── misc.md
│   ├── node-version.md
│   ├── prerequisites.md
│   └── project-structure-conventions.md
├── environment.json
├── help.json
├── jest.config.js
├── jest.stack.config.js
├── package-lock.json
├── package.json
├── src
│   ├── authorizers
│   │   ├── authorizer.ts
│   │   ├── config.ts
│   │   ├── simpleTokenAuthorizationHandler.test.ts
│   │   └── simpleTokenAuthorizationHandler.ts
│   ├── common
│   │   ├── utils.test.ts
│   │   └── utils.ts
│   ├── lib
│   │   └── vendor.typings.ts
│   ├── modules
│   │   └── flickr
│   └── services
│       └── aws
├── stack-tests
│   └── api-gateway-proxy-example-stack.test.ts
├── template.yaml
├── tsconfig.build.json
└── tsconfig.json
```

- `bin` contains the cdk stack definitions for the application
- `dist` contains compiled files for deployment
- `src` contains all source code. Tests for source code are by convention kept alongside the code.
  - `handlers` contains handlers for use with AWS lambda.
  - `common` contains common code.
- `tests` contains tests for the stack definitions defined by cdk.

**[⬆ back to top](#table-of-contents)**

## File and Folder Naming Conventions

- Tests are named for the file they are testing with `.test` as a suffix e.g. `myfile.test.ts`

[⬆ back to top](#table-of-contents)
