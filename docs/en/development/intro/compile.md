# Compilation Documentation

## Prerequisites

Xray uses [Golang](https://golang.org/) as its programming language. You need to install the latest version of Golang to compile it.

::: tip TIP
Install Golang: [golang.org/doc/install](https://golang.org/doc/install)
:::

> If you are unfortunately using Windows, please **be sure** to use PowerShell.

## Pull Xray Source Code

```bash
git clone https://github.com/XTLS/Xray-core.git
cd Xray-core && go mod download
```

> If you have nothing better to do, you can try the GitHub official tool: `gh repo clone XTLS/Xray-core`

Note: In network environments where Google cannot be accessed normally, dependencies cannot be pulled correctly. You need to set `GOPROXY` first:

```bash
go env -w GOPROXY=https://goproxy.io,direct
```

## Build Binary

:::warning
The commands in this section need to be run inside the Xray root directory.
:::

### Windows (Powershell)

```powershell
$env:CGO_ENABLED=0
go build -o xray.exe -trimpath -buildvcs=false -ldflags "-s -w -buildid=" ./main
```

### macOS, Linux

```bash
CGO_ENABLED=0 go build -o xray -trimpath -buildvcs=false -ldflags "-s -w -buildid=" ./main
```

Running the above commands will generate the `xray` executable file in the directory.

::: tip
If you need to compile a debuggable program (i.e., you can attach `dlv` to the running program for debugging), please remove the `-w -s` options from `ldflags`.

- `-w`: Disable DWARF generation (debug info). After using this option, you cannot use gdb for debugging.
- `-s`: Disable the symbol table.

PS: Actually, debugging with VSCode or other IDEs seems more convenient.
:::

## Cross Compilation

Here is an example of compiling for a Linux server in a Windows (Powershell) environment:

```powershell
$env:CGO_ENABLED=0
$env:GOOS="linux"
$env:GOARCH="amd64"

go build -o xray -trimpath -buildvcs=false -ldflags "-s -w -buildid=" ./main
```

After uploading to the server, remember to execute `chmod +x xray` in the server terminal.

::: tip
Run `go tool dist list` to view all supported systems and architectures.
:::

## Reproducible Build

Use the following command to build (`<short commit ID>` should be replaced with the first seven characters of the corresponding commit SHA-256):

```bash
CGO_ENABLED=0 go build -o xray -trimpath -buildvcs=false -gcflags="all=-l=4" -ldflags="-X [github.com/xtls/xray-core/core.build=](https://github.com/xtls/xray-core/core.build=)<short commit ID> -s -w -buildid=" -v ./main
```

For MIPS/MIPSLE architectures, you should use:

```bash
CGO_ENABLED=0 go build -o xray -trimpath -buildvcs=false -gcflags="-l=4" -ldflags="-X [github.com/xtls/xray-core/core.build=](https://github.com/xtls/xray-core/core.build=)<short commit ID> -s -w -buildid=" -v ./main
```

::: warning
Please ensure that the Golang version you are using is consistent with the one used to compile the Release.
:::

## Compiling for Windows 7

Replace the Golang tools with the version provided in [go-win7](https://github.com/XTLS/go-win7), and then proceed with the compilation steps above.
