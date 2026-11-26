# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Development workflow

You need Node.js 26 (see `.nvmrc`) and [pnpm](https://pnpm.io/). The repository pins the pnpm version in `package.json`; pnpm switches to it automatically.

Install the dependencies of the library and the example app from the root directory:

```sh
pnpm install
```

While developing, run the [example app](/example/) to test your changes. It is an Expo app that uses the library's source directly, so changes show up without a rebuild. Each screen covers one test scenario; [`example/CHECKLIST.md`](/example/CHECKLIST.md) describes what to check on each, including VoiceOver and TalkBack.

```sh
pnpm example start    # start Metro
pnpm example ios      # run on iOS
pnpm example android  # run on Android
```

Make sure your code passes type checking, linting and formatting:

```sh
pnpm typecheck
pnpm example typecheck
pnpm lint
pnpm format:check
```

To format all files, run:

```sh
pnpm format
```

Remember to add tests for your change if possible. Run the unit tests with:

```sh
pnpm test
```

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

```
<type>(<optional scope>): <subject>
```

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module.
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. update dependencies.
- `ci`: CI configuration, e.g. update GitHub actions.
- also allowed: `build`, `perf`, `style`, `revert`.

Rules the commit-msg hook ([commitlint](https://commitlint.js.org/)) checks:

- `type` is lowercase and one of the types above.
- The subject must not start with a capital letter or be in Title Case, and must not end with a period.
- The first line is at most 100 characters; so are lines in the body.

| ✅ Passes                                          | ❌ Fails                                             |
| -------------------------------------------------- | ---------------------------------------------------- |
| `chore: update license`                            | `chore: Update License` (capitalized subject)        |
| `fix(multiselect): hide chips when value is empty` | `Fix: hide chips` (capitalized type)                 |
| `docs: add country picker recipe`                  | `docs: add country picker recipe.` (trailing period) |

Our pre-commit hooks verify that your commit message matches this format when committing.

### Linting and tests

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [oxlint](https://oxc.rs/docs/guide/usage/linter) for linting (including React Compiler and React Native accessibility rules), [oxfmt](https://oxc.rs/docs/guide/usage/formatter) for formatting, and [Jest](https://jestjs.io/) with [React Native Testing Library](https://oss.callstack.com/react-native-testing-library/) for testing.

Our pre-commit hook formats the staged files, then lints and type checks them.

### Publishing to npm

We use [release-it](https://github.com/release-it/release-it) to make it easier to publish new versions. It handles common tasks like bumping version based on semver, creating tags and releases etc.

To publish new versions, run the following:

```sh
pnpm release
```

### Scripts

The `package.json` file contains various scripts for common tasks:

- `pnpm typecheck`: type-check the library with TypeScript.
- `pnpm lint`: lint files with oxlint.
- `pnpm format` / `pnpm format:check`: format files with oxfmt, or check their formatting.
- `pnpm test`: run unit tests with Jest.
- `pnpm prepack`: build the library into `lib/` with react-native-builder-bob.
- `pnpm example <script>`: run a script of the example app, e.g. `start`, `ios`, `android` or `typecheck`.
- `type-tests/run.sh <react-native> <react>`: type-check a small app against the packed library, e.g. `type-tests/run.sh 0.83 19.2`.

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
