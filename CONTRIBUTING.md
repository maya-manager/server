## Contributing

[fork]: /fork
[pr]: /compare
[code-of-conduct]: CODE_OF_CONDUCT.md

Hi there! We're thrilled that you'd like to contribute to this project. Your help is essential for keeping it great.

Please note that this project is released with a [Contributor Code of Conduct][code-of-conduct]. By participating in this project you agree to abide by its terms.

## Issues and PRs

If you have suggestions for how this project could be improved, or want to report a bug, open an issue! We'd love all and any contributions. If you have questions, too, we'd love to hear them.

We'd also love PRs. If you're thinking of a large PR, we advise opening up an issue first to talk about it, though! Look at the links below if you're not sure how to open a PR.

1. [Fork][fork] and clone the repository.
2. Create a new branch: `git checkout -b my-branch-name`.
3. Work on your issue/feature
4. Before committing the changes run tests using `yarn test`
5. Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for writing commit messages
6. Push to your fork and [submit a pull request][pr] in `main` branch
7. Pat your self on the back and wait for your pull request to be approved and merged.

Here are a few things you can do that will increase the likelihood of your pull request being accepted:

-   Keep your changes as focused as possible. If there are multiple changes you would like to make that are not dependent upon each other, consider submitting them as separate pull requests.
-   Follow [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

Work in Progress pull requests are also welcome to get feedback early on, or if there is something blocked you. (just mark them as draft)

## Setting up the development environment

### Prerequisites

-   [Node.js](https://nodejs.org/en/)
-   [Yarn](https://yarnpkg.com/)
-   [PostgreSQL](https://www.postgresql.org/)
-   [Docker](https://www.docker.com/) (optional)

> :memo: This project uses [Yarn workspaces](https://yarnpkg.com/features/workspaces) to manage multiple packages in a single repository. You will need to use Yarn to install the dependencies and run the scripts.

### Installation

#### _Server_

1. Create a PostgreSQL database for the project.
2. You will need to create a `.env` file in the root of the project. You can copy the `.env.example` file and rename it to `.env`.
3. create another `.env` file inside `apps/server` directory. You can copy the `.env.example` file and rename it to `.env`.

4. Create database migrations by running

```bash
yarn workspace @maya/server prisma:migrate
```

5. Generate the prisma client by running

```bash
yarn workspace @maya/server prisma:generate
```

6. Run the server by using

```bash
yarn workspace @maya/server start:dev
```

#### _Client_

1. create another `.env` file inside `apps/client` directory. You can copy the `.env.example` file and rename it to `.env`.

    > make sure update the environment variables based on your needs.

1. Run the client by using

```bash
yarn workspace @maya/client start
```

#### Docker

1. Use the `docker-compose.yml` file to start the server, client and postgreSQL containers.

2. You will need to create a `.env` file in the root of the project. You can copy the `.env.example` file and rename it to `.env`.

3. create another `.env` file inside `apps/server` directory. You can copy the `.env.example` file and rename it to `.env`.

4. create another `.env` file inside `apps/client` directory. You can copy the `.env.example` file and rename it to `.env`.

> make sure update the environment variables based on your needs.

5. Run the containers by using

```bash
docker-compose up
```

> :warning: If you are using docker to run client than you need to manually put the `IP` address of your machine in the `expo` to run the app on your phone.
> example if `IP` address of your machine is `192.172.36.18` than you expo url will be `exp://192.172.36.18:19000` and you will need to put this address in your emulator or phone in expo app.

## Resources

-   [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
-   [About Pull Requests](https://help.github.com/articles/about-pull-requests/)
-   [GitHub Help](https://help.github.com)
-   [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
-   [Conventional commits vscode extension](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits)
-   [Github issues and pull requests vscode extension](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github)
