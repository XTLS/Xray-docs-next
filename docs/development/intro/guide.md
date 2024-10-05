# 开发规范

## 基本

### 版本控制

Project X 的代码被托管在 github 上:

- Xray 核心 [Xray-core](https://github.com/XTLS/Xray-core)
- 安装脚本 [Xray-install](https://github.com/XTLS/Xray-install)
- 配置模板 [Xray-examples](https://github.com/XTLS/Xray-examples)
- Xray 文档 [Xray-docs-next](https://github.com/XTLS/Xray-docs-next)

您可以使用 [Git](https://git-scm.com/) 来获取代码。

### 分支（Branch）

- 本项目的主干分支为 main，
- 本项目的发布主分支同为 main，
- 需要确保 main 在任一时刻都是可编译，且可正常使用的。
- 如果需要开发新的功能，请新建分支进行开发，在开发完成并且经过充分测试后，合并回主干分支。
- 已经合并入主干且没有必要存在的分支，请删除。

### 发布（Release）

<Badge text="WIP" type="warning"/>

- 建立尝鲜版本和稳定版本两个发布通道
  - 尝鲜版本，可以为 daily build，主要用于特定情况的测试，尝鲜和获得即时反馈和再改进。
  - 稳定版本，为定时更新(比如月更)，合并稳定的修改并发布。

### 引用其它项目

- Golang
  - 产品代码建议使用 Golang 标准库和 [golang.org/x/](https://pkg.go.dev/search?limit=25&m=package&q=golang.org%2Fx) 下的库；
  - 如需引用其它项目，请事先创建 issue 讨论；
- 其它
  - 不违反双方的协议，且对项目有帮助的工具，都可以使用。

## 开发流程

### 写代码之前

发现任何问题，或对项目有任何想法，请创建 [issue](https://github.com/XTLS/Xray-core/issues) 讨论以减少重复劳动和消耗在代码上的时间。

### 修改代码

- Golang
  - 请参考 [Effective Go](https://golang.org/doc/effective_go.html)；
  - 每一次 push 之前，请运行：`go generate core/format.go`；
  - 如果需要修改 protobuf，例如增加新配置项，请运行：`go generate core/proto.go`；
  - 提交 pull request 之前，建议测试通过：`go test ./...`；
  - 提交 pull request 之前，建议新增代码有超过 70% 的代码覆盖率（code coverage）；
- 其它
  - 请注意代码的可读性。

### Pull Request

- 提交 PR 之前，请先运行 `git pull https://github.com/XTLS/Xray-core.git` 以确保 merge 可顺利进行；
- 一个 PR 只做一件事，如有对多个 bug 的修复，请对每一个 bug 提交一个 PR；
- 由于 Golang 的特殊需求（Package path），Go 项目的 PR 流程和其它项目有所不同，建议流程如下：
  1. 先 Fork 本项目，创建你自己的 `github.com/<your_name>/Xray-core.git` 仓库；
  2. 克隆你自己的 Xray 仓库到本地：`git clone https://github.com/<your_name>/Xray-core.git`；
  3. 基于 `main` 分支创建新的分支，例如 `git branch issue24 main`；
  4. 在新创建的分支上作修改并提交修改(commit)；
  5. 在推送(push)修改完成的分支到自己的仓库前，先切换到 `main` 分支，运行 `git pull https://github.com/XTLS/Xray-core.git` 拉取最新的远端代码；
  6. 如果上一步拉取得到了新的远端代码，则切换到之前自己创建的分支，运行 `git rebase main` 执行分支合并操作。如遇到文件冲突，则需要解决冲突；
  7. 上一步处理完毕后，就可以把自己创建的分支推送到自己的仓库：`git push -u origin your-branch`
  8. 最后，把自己仓库的新推送的分支往 `XTLS/Xray-core` 的 `main` 分支发 PR 即可；
  9. 请在 PR 的标题和正文中，完整表述此次 PR 解决的问题 / 新增的功能 / 代码所做的修改的用意等；
  10. 耐心等待开发者的回应。

### 对代码的修改

#### 功能性问题

请提交至少一个测试用例（Test Case）来验证对现有功能的改动。

#### 性能相关

请提交必要的测试数据来证明现有代码的性能缺陷，或是新增代码的性能提升。

#### 新功能

- 如果新增功能对已有功能不影响，请提供可以开启/关闭的开关（如 flag），并使新功能保持默认关闭的状态；
- 大型新功能（比如增加一个新的协议）开发之前，请先提交一个 issue，讨论完毕之后再进行开发。

#### 其它

视具体情况而定。

## Xray 编码规范

以下内容适用于 Xray 中的 Golang 代码。

### 代码结构

```
Xray-core
├── app        // 应用模块
│   ├── router // 路由
├── common     // 公用代码
├── proxy      // 通讯协议
│   ├── blackhole
│   ├── dokodemo-door
│   ├── freedom
│   ├── socks
│   ├── vmess
├── transport  // 传输模块
```

### 编码规范

基本与 Golang 官方所推荐做法一致，有一些例外。写在这里以方便大家熟悉 Golang。

#### 命名

- 文件和目录名尽量使用单个英文单词，比如 hello.go；
  - 如果实在没办法，则目录使用连接线／文件名使用下划线连接两个（或多个单词），比如 hello-world/hello_again.go；
  - 测试代码使用 \_test.go 结尾；
- 类型使用 Pascal 命名法，比如 ConnectionHandler；
  - 对缩写不强制小写，即 HTML 不必写成 Html；
- 公开成员变量也使用 Pascal 命名法；
- 私有成员变量使用 [小驼峰式命名法](https://zh.wikipedia.org/wiki/%E9%A7%9D%E5%B3%B0%E5%BC%8F%E5%A4%A7%E5%B0%8F%E5%AF%AB) ，如 `privateAttribute` ；
- 为了方便重构，方法建议全部使用 Pascal 命名法；
  - 完全私有的类型放入 `internal` 。

#### 内容组织

- 一个文件包含一个主要类型，及其相关的私有函数等；
- 测试相关的文件，如 Mock 等工具类，放入 testing 子目录。

#### Int32Range

For end user

一个表示可选范围的值，可以是以下几种写法

-包含在引号里的单独数字或范围
  - `""` (视为0) 注意部分字段完全不设置和设置为空可能是两种概念
  - `"114"`
  - `"114-514"`

-独立的int，这种情况下只能是单数字
  - `114`

For dev

如果需要在配置文件中包含范围，请使用 `Int32Range` 类型

使用 .From 和 .To 获取值，在 From > To 比如 1919-810 时会自动交换数值确保 From 会小于 To, 如果要获取原始值可以用 .Left 和 .Right
