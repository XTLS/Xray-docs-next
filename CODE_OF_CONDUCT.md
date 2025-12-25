# 为 Project X 的文档贡献

欢迎您为 Project X 的文档做出贡献，我们感谢每一位 Contributor 的贡献！是你们让 Xray 更加强大！

## 改进文档

Project X 的文档托管在 [GitHub](https://github.com/XTLS/Xray-docs-next) 上。

您可以通过以下步骤, 提交您对文档的改动：

1. 从 [Project X 文档仓库](https://github.com/XTLS/Xray-docs-next) 打开仓库，点击右上角的 fork, fork 一份文档仓库的镜像到您自己的 GitHub 仓库。

2. 对于简单的编辑您可直接在 GitHub 网页上完成；<br>
   但复杂的编辑请一定使用 VSCode, 从您克隆的仓库获得文档的克隆，如：

   ```bash
   git clone https://github.com/你的GitHub用户名/Xray-docs-next.git
   ```

3. 基于 main 分支创建新的分支，如：

   ```bash
   git checkout -b your-branch
   ```

4. 在新分支上做修改。

   注：推荐使用自动格式 [prettier](https://prettier.io/docs/install)
   以及 [中文文案排版指北](https://github.com/sparanoid/chinese-copywriting-guidelines)

5. 修改完成后，VSCode 插件会自动格式化您的更改，本仓库已经预先配置好了所有 VSCode 所需插件您只要根据 VSCode 提示一键安装即可。

   注：存在格式问题的 PR，将有可能被拒绝。

6. 提交修改，并推送到您的仓库中：

   ```bash
   git push -u origin your-branch
   ```

7. 打开 GitHub, 点击 'Pull request' 向 [project X 文档仓库](https://github.com/XTLS/Xray-docs-next) 提交 PR。

8. 请在 PR 的标题和正文中，概述此次 PR 新增/修改的内容等；

9. 等待回应, 如果 PR 被 merge, 您做的修改将直接呈现在 [Project X 文档网站](https://xtls.github.io)。

10. 想在本地预览完整效果？
    1. 安装 [Node.JS](https://nodejs.org/zh-cn/download)
    2. 安装 [pnpm](https://pnpm.io/zh/installation)
    3. 重启 VSCode 并打开本项目
    4. 按下 `Ctrl` + `` ` `` 打开 VSCode 集成终端
    5. 在终端运行命令
       ```bash
       pnpm install
       pnpm run docs:dev
       ```

## 发现问题？

如果您发现文档出错，可以改进文档或提交一个 Issue。
