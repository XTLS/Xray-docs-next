# 编译文档

## 前序工作

Xray 使用 [Golang](https://golang.org/) 作为编程语言，你需要先安装最新版本 Golang 才能够编译。

::: tip TIP
安装 Golang: [golang.org/doc/install](https://golang.org/doc/install)
:::

> 如果你不幸使用 Windows, 请 **务必** 使用 Powershell

## 拉取 Xray 源代码

```bash
git clone https://github.com/XTLS/Xray-core.git
cd Xray-core && go mod download
```

> 如果你闲的没事干，可以试试 GitHub 官方工具: `gh repo clone XTLS/Xray-core`

注意：在无法正常访问 Google 的网络环境，依赖无法被正常拉取，需要先设置 `GOPROXY`：

```bash
go env -w GOPROXY=https://goproxy.io,direct
```

## 构建二进制

:::warning
本小节的命令需要在 Xray 根目录内运行。
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

运行以上命令会在目录下生成 xray 可执行文件。

::: tip
如果需要编译可以进行 debug 的程序,即可以用 dlv 附加到运行的程序进行调试, 请去掉 ldflags 中的 '-w -s' 选项.

-w 禁止生成 debug 信息。使用该选项后，将无法使用 gdb 进行调试。
-s 禁用符号表
PS:其实用 vscode 或其他 IDE 调试似乎更方便。
:::

## 交叉编译：

这里以在 Windows(Powershell) 环境中，编译到 Linux 服务器为例：

```powershell
$env:CGO_ENABLED=0
$env:GOOS="linux"
$env:GOARCH="amd64"

go build -o xray -trimpath -ldflags "-s -w -buildid=" ./main
```

上传到服务器后，记得在服务器终端内执行 `chmod +x xray`

::: tip
执行 `go tool dist list` 查看所有支持的系统与架构。
:::

## 可复现构建：

按照上述步骤，能够编译与 Release 中完全相同的二进制文件。

::: warning
请先确认您使用的 Golang 版本与编译 Release 的一致。
:::
