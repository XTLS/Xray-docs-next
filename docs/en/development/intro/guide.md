# Development Standards

## Basic

### Version Control

Project X code is hosted on GitHub:

- Xray Core: [Xray-core](https://github.com/XTLS/Xray-core)
- Install Script: [Xray-install](https://github.com/XTLS/Xray-install)
- Configuration Templates: [Xray-examples](https://github.com/XTLS/Xray-examples)
- Xray Documentation: [Xray-docs-next](https://github.com/XTLS/Xray-docs-next)

You can use [Git](https://git-scm.com/) to fetch the code.

### Branches

- The trunk branch of this project is `main`.
- The release branch of this project is also `main`.
- Ensure that `main` is compilable and usable at any given time.
- If you need to develop new features, please create a new branch for development. After development is complete and fully tested, merge it back into the trunk branch.
- Branches that have already been merged into the trunk and are no longer necessary should be deleted.

### Release

<Badge text="WIP" type="warning"/>

- Establish two release channels: Bleeding Edge and Stable.
  - Bleeding Edge: Can be daily builds, mainly used for specific testing scenarios, trying out new features, and obtaining immediate feedback for further improvement.
  - Stable: Scheduled updates (e.g., monthly), merging stable changes and releasing.

### Referencing Other Projects

- Golang
  - For product code, it is recommended to use the Golang standard library and libraries under [golang.org/x/](https://pkg.go.dev/search?limit=25&m=package&q=golang.org%2Fx).
  - If you need to reference other projects, please create an issue for discussion beforehand.
- Others
  - Tools that do not violate the agreements of either party and are helpful to the project can be used.

## Development Process

### Before Writing Code

If you find any issues or have any ideas for the project, please create an [issue](https://github.com/XTLS/Xray-core/issues) for discussion to reduce repetitive work and time spent on code.

### Modifying Code

- Golang
  - Please refer to [Effective Go](https://golang.org/doc/effective_go.html).
  - Before every push, please run: `go generate core/format.go`.
  - If you need to modify protobuf, such as adding new configuration items, please run: `go generate core/proto.go`.
  - Before submitting a pull request, it is recommended to pass tests: `go test ./...`.
  - Before submitting a pull request, it is recommended that new code has over 70% code coverage.
- Others
  - Please pay attention to code readability.

### Pull Request

- Before submitting a PR, please run `git pull https://github.com/XTLS/Xray-core.git` to ensure the merge can proceed smoothly.
- One PR should do one thing. If there are fixes for multiple bugs, please submit a separate PR for each bug.
- Due to the special requirements of Golang (Package path), the PR process for Go projects differs from other projects. The recommended process is as follows:
  1. Fork this project first and create your own `github.com/<your_name>/Xray-core.git` repository.
  2. Clone your own Xray repository locally: `git clone https://github.com/<your_name>/Xray-core.git`.
  3. Create a new branch based on the `main` branch, e.g., `git branch issue24 main`.
  4. Make changes and commit them on the newly created branch.
  5. Before pushing the completed branch to your own repository, switch to the `main` branch and run `git pull https://github.com/XTLS/Xray-core.git` to pull the latest remote code.
  6. If new remote code was pulled in the previous step, switch back to the branch you created and run `git rebase main` to perform the branch merge operation. If you encounter file conflicts, you need to resolve them.
  7. After the previous step is completed, you can push your created branch to your own repository: `git push -u origin your-branch`.
  8. Finally, send a PR from the newly pushed branch in your repository to the `main` branch of `XTLS/Xray-core`.
  9. In the title and body of the PR, please fully describe the problem solved / new feature added / intention of the code changes, etc.
  10. Wait patiently for the developers' response.

### Changes to Code

#### Functional Issues

Please submit at least one Test Case to verify changes to existing functions.

#### Performance Related

Please submit necessary test data to prove performance defects in existing code or performance improvements in new code.

#### New Features

- If the new feature does not affect existing features, please provide a switch (e.g., flag) that can turn it on/off, and keep the new feature off by default.
- Before developing large new features (such as adding a new protocol), please submit an issue first and proceed with development after discussion.

#### Others

To be determined based on the specific situation.

## Xray Coding Standards

The following applies to Golang code in Xray.

### Code Structure

```
Xray-core
├── app        // Application module
│   ├── router // Router
├── common     // Common code
├── proxy      // Communication protocols
│   ├── blackhole
│   ├── dokodemo-door
│   ├── freedom
│   ├── socks
│   ├── vmess
├── transport  // Transport module
```

### Coding Standards

Basically consistent with the practices recommended by official Golang documentation, with some exceptions. Written here to help everyone get familiar with Golang.

#### Naming

- Try to use single English words for file and directory names, such as `hello.go`.
  - If unavoidable, use hyphens for directories / underscores for filenames to connect two (or more) words, e.g., `hello-world/hello_again.go`.
  - Test code should end with `_test.go`.
- Use PascalCase for types, such as `ConnectionHandler`.
  - Abbreviations are not forced to be lowercase, i.e., `HTML` does not need to be written as `Html`.
- Public member variables also use PascalCase.
- Private member variables use [lowerCamelCase](https://en.wikipedia.org/wiki/Camel_case), such as `privateAttribute`.
- To facilitate refactoring, it is recommended to use PascalCase for all methods.
  - Put completely private types into `internal`.

#### Content Organization

- A file contains one main type and its related private functions, etc.
- Test-related files, such as Mock utility classes, should be placed in the `testing` subdirectory.

#### Int32Range

**For end user**

A value representing an optional range, which can be written in the following ways:

- A single number or range enclosed in quotes:
  - `""` (Treated as 0. Note: Not setting a field at all and setting it to empty might be two different concepts for some fields.)
  - `"114"`
  - `"114-514"`

- An independent int (in this case, it can only be a single number):
  - `114`

**For dev**

If you need to include a range in the configuration file, please use the `Int32Range` type.

Use `.From` and `.To` to get values. When From > To (e.g., 1919-810), the values will be automatically swapped to ensure From is less than To. If you want to get the raw values, you can use `.Left` and `.Right`.
