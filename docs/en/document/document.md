# Contributing to Project X Documentation

Welcome to contribute to the Project X documentation. We appreciate every contributor! It is you who make Xray more powerful!

## Improve the Documentation

Project X documentation is hosted on [GitHub](https://github.com/XTLS/Xray-docs-next).

You can submit your changes to the documentation by following these steps:

1. Open the [Project X Documentation Repository](https://github.com/XTLS/Xray-docs-next) and click **Fork** in the top right corner to fork a copy of the repository to your own GitHub account.

2. For simple edits, you can complete them directly on the GitHub website.<br>
   However, for complex edits, please use VSCode. Clone the documentation from your forked repository, for example:

   ```bash
   git clone https://github.com/your-github-username/Xray-docs-next.git
   ```

3. Create a new branch based on the `main` branch, for example:

   ```bash
   git checkout -b your-branch
   ```

4. Make your changes on the new branch.

   Note: We recommend using automatic formatting with [prettier](https://prettier.io/docs/install) and following the [Google Developer Documentation Style Guide](https://developers.google.com/style).

5. After editing, VSCode extensions will automatically format your changes. This repository is pre-configured with all necessary VSCode extensions; simply follow the VSCode prompts to install them with one click.

   Note: PRs with formatting issues may be rejected.

6. Commit your changes and push them to your repository:

   ```bash
   git push -u origin your-branch
   ```

7. Open GitHub and click **'Pull request'** to submit a PR to the [Project X Documentation Repository](https://github.com/XTLS/Xray-docs-next).

8. Please summarize the additions/changes of this PR in the title and body.

9. Wait for a response. If your PR is merged, your changes will appear directly on the [Project X Documentation Website](https://xtls.github.io).

10. Want to preview the full effect locally?
    1. Install [Node.JS](https://nodejs.org/en/download)
    2. Install [pnpm](https://pnpm.io/installation)
    3. Restart VSCode and open this project
    4. Press `Ctrl` + `` ` `` to open the VSCode integrated terminal
    5. Run the following commands in the terminal:

       ```bash
       pnpm install
       pnpm run docs:dev
       ```

## Found an Issue?

If you find errors in the documentation, you can improve the documentation or submit an Issue.
