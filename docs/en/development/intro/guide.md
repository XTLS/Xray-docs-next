# Development Standards

## Basic

### Version Control

Project X's code is hosted on GitHub:

- Xray Core [xray-core](https://github.com/XTLS/Xray-core)
- Installation script [Xray-install](https://github.com/XTLS/Xray-install)
- Configuration template [Xray-examples](https://github.com/XTLS/Xray-examples)
- Xray documentation [Xray-docs-next](https://github.com/XTLS/Xray-docs-next)

You can use [Git](https://git-scm.com/) to get the code.

### Branch

- The main branch is the backbone of this project.
- The main branch is also the release branch of this project.
- It is necessary to ensure that main can be compiled and used normally at any time.
- If you need to develop new features, please create a new branch for development. After development and sufficient testing, merge it back to the main branch.
- Please delete branches that have been merged into the main branch and are no longer necessary.

### Release

<Badge text="WIP" type="warning"/> (Note: this is not translatable as it is a technical tag)

- Create two release channels: one for the beta version and another for the stable version.
  - The beta version, also known as the daily build, is mainly used for specific testing, experimentation, and instant feedback and improvement.
  - The stable version, updated regularly (e.g. monthly), merges stable modifications and releases them.

### Citing other projects

- Golang
  - It is recommended to use the Golang standard library and libraries under [golang.org/x/](https://pkg.go.dev/search?q=golang.org%2Fx) for product code;
  - If you need to reference other projects, please create an issue for discussion beforehand;
- Other
  - Tools that do not violate the agreement of both parties and are helpful to the project can be used.

## Development Process

### Before Writing Code

If you encounter any issues or have any ideas for the project, please create an [issue](https://github.com/XTLS/Xray-core/issues) for discussion to reduce redundant work and save time spent on coding.

### Modify the code

- Golang
  - Please refer to [Effective Go](https://golang.org/doc/effective_go.html);
  - Run `go generate core/format.go` before each push;
  - If you need to modify protobuf, such as adding new configuration items, please run: `go generate core/proto.go`;
  - It is recommended to pass the test before submitting a pull request: `go test ./...`;
  - It is recommended to have more than 70% code coverage for newly added code before submitting pull requests.
- Other
  - Please pay attention to the readability of the code.

### Pull Request

- Before submitting a PR, please run `git pull https://github.com/xray/xray-core.git` to ensure that the merge can proceed smoothly;
- One PR only does one thing. If there are fixes for multiple bugs, please submit a PR for each bug;
- Due to Golang's special requirements (Package path), the PR process for Go projects is different from other projects. The recommended process is as follows:
  1. Fork this project first and create your own `github.com/<your_name>/Xray-core.git` repository;
  2. Clone your own Xray repository to your local machine: `git clone https://github.com/<your_name>/Xray-core.git`;
  3. Create a new branch based on the `main` branch, for example `git branch issue24 main`;
  4. Make changes on the new branch and commit the changes;
  5. Before pushing the modified branch to your own repository, switch to the `main` branch, and run `git pull https://github.com/xray/xray-core.git` to pull the latest remote code;
  6. If new remote code is obtained in the previous step, switch to the branch you created earlier and run `git rebase main` to perform branch merging. If there is a file conflict, you need to resolve the conflict;
  7. After the previous step is completed, you can push the branch you created to your own repository: `git push -u origin your-branch`
  8. Finally, send a PR from your new pushed branch in your own repository to the `main` branch of `xtls/Xray-core`;
  9. Please fully describe the purpose of this PR, including the problem solved, the new feature added, or the modifications made in the title and body of the PR;
  10. Please be patient and wait for the developer's response.

### Modifying Code

#### Functional issue

Please submit at least one test case to verify changes to existing functionality.

#### Performance Related

Please provide the necessary test data to demonstrate performance issues in existing code or performance improvements in new code.

#### New Feature

- If the new feature does not affect the existing functionality, please provide a toggle (such as a flag) that can be turned on/off, and keep the new feature disabled by default.
- For major new features (such as adding a new protocol), please submit an issue for discussion before development.

#### Other

It depends on the specific situation.

## Xray Coding Guidelines

The following content is applicable to Golang code in Xray.

### Code Structure

```
Xray-core
├── app        // Application module
│   ├── router // Router
├── common     // Common code
├── proxy      // Communication protocol
│   ├── blackhole
│   ├── dokodemo-door
│   ├── freedom
│   ├── socks
│   ├── vmess
├── transport  // Transport module
```

### Coding Standards

Basic practices are consistent with the recommendations of the official Golang, with a few exceptions. Written here to help everyone familiarize themselves with Golang.

#### Naming

- Use a single English word for file and directory names, such as hello.go;
  - If not possible, use a hyphen for directories / underscore for files to connect two (or more) words, such as hello-world/hello_again.go;
  - Use \_test.go to name test code files;
- Use PascalCase for types, such as ConnectionHandler;
  - Do not force lowercase for abbreviations, i.e. HTML does not need to be written as Html;
- Use PascalCase for public member variables;
- Use camelCase for private member variables, such as `privateAttribute`;
- For easy refactoring, it is recommended to use PascalCase for all methods;
  - Place completely private types in `internal`.

#### Content Organization

- A file contains a main type and its related private functions;
- Testing-related files, such as Mock tools, should be placed in the testing subdirectory.
