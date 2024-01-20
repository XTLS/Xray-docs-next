# Compile the document

## Preparatory Work

Xray uses [Golang](https://golang.org/) as its programming language, so you need to install the latest version of Golang first in order to compile.

::: tip TIP
Install Golang: [golang.org/doc/install](https://golang.org/doc/install)
:::

If you happen to use Windows, please **make sure** to use Powershell.

## Pull Xray source code

```bash
git clone https://github.com/XTLS/Xray-core.git
cd Xray-core && go mod download
```

If you have free time, you can try GitHub's official tool: `gh repo clone XTLS/Xray-core`

Note: In a network environment where Google cannot be accessed normally, dependencies cannot be pulled normally, and `GOPROXY` needs to be set first:

```bash
go env -w GOPROXY=https://goproxy.io,direct
```

## Build Binary

:::warning
This command needs to be executed within Xray root directory.
:::

### Windows(Powershell):

```powershell
$env:CGO_ENABLED=0
go build -o xray.exe -trimpath -ldflags "-s -w -buildid=" ./main
```

### macOS, Linux:

```bash
CGO_ENABLED=0 go build -o xray -trimpath -ldflags "-s -w -buildid=" ./main
```

Running the above command will generate an xray executable file in the directory.

::: tip
If you need to compile a program that can be debugged, i.e., you can use dlv to attach to the running program for debugging, please remove the '-w -s' options from the ldflags.

- w option disables the generation of debug information. After using this option, gdb cannot be used for debugging.
- s option disables the symbol table.
  PS: Actually, debugging with vscode or other IDEs seems to be more convenient.

## Cross compilation:

Here, we take the example of compiling to a Linux server in a Windows (Powershell) environment:

```powershell
$env:CGO_ENABLED=0
$env:GOOS="linux"
$env:GOARCH="amd64"
```

go build -o xray -trimpath -ldflags "-s -w -buildid=" ./main```

After uploading to the server, remember to execute `chmod +x xray` in the server terminal.

::: tip
Execute `go tool dist list` to view all supported systems and architectures.
:::

## Reproducible Build:

Following the above steps, it is possible to compile and release an identical binary file as the one in Release.

::: warning
Please confirm that you are using the same Golang version as the one used to compile the release.
:::
