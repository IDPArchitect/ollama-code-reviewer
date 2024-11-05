# VSCode Extension Development - Quick Start Guide

## Ollama Code Reviewer

This guide will help you get started with developing the Backstage Party Social Network extension for VSCode.

## What's in the folder

* `package.json` - the manifest file that defines the extension's basic info and contribution points
  * The `main` attribute specifies that the extension starts from `./out/extension.js`
* `src/extension.ts` - the main source file
* `ollama_feedback/` - directory where AI feedback files are stored (created automatically)

## Get up and running straight away

* Press `F5` to open a new window with your extension loaded
* Right click any file in the Explorer and select "Code Review with Ollama"
* Select "Analyze Git Changes with Ollama" for git diff analysis
* See the results in the automatically created markdown files

## Make changes

* You can relaunch the extension from the debug toolbar after making changes to the files listed above
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes

## Explore the API

* You can open the full set of our API when you open the file `node_modules/@types/vscode/index.d.ts`

## Add new features

* To add new capabilities:
  1. Find the appropriate VSCode API in the [VSCode Extension API](https://code.visualstudio.com/api)
  2. Update `package.json` to declare new functionality (commands, menus, etc.)
  3. Implement the feature in `src/extension.ts`

## Working with Ollama

* Ensure Ollama is installed and running locally
* Default port is 11434
* Test Ollama connection by running a simple code review

## Install your extension

* To start using your extension with Visual Studio Code:
  * Copy the extension files to your `.vscode/extensions` folder
  * Restart Visual Studio Code

## Publish your extension

To share your extension with others:

1. Create an account on https://marketplace.visualstudio.com/
2. Install `vsce`: `npm install -g vsce`
3. Package your extension: `vsce package`
4. Publish: `vsce publish`

## Bundle your extension

* To bundle your extension:
  ```bash
  npm run compile
  vsce package
  ```
* This will create a `.vsix` file that can be installed directly in VSCode

## Test your extension

* Run tests: `npm run test`
* Debug tests: Use the "Extension Tests" launch configuration
* Add new tests in the `src/test` folder

## Debugging

* Set breakpoints in your code inside `src/extension.ts` to debug your extension
* Find output from your extension in the debug console
* Check the Output panel for detailed logs (select "Backstage Party Social Network" from the dropdown)

## Common Tasks

### Adding a new command

1. Add command definition to `package.json`:
```json
"commands": [{
    "command": "your.command.id",
    "title": "Your Command Title"
}]
```

2. Register command in `extension.ts`:
```typescript
let disposable = vscode.commands.registerCommand('your.command.id', () => {
    // Command implementation
});

context.subscriptions.push(disposable);
```

### Adding a menu item

Add to `package.json`:
```json
"menus": {
    "explorer/context": [{
        "command": "your.command.id",
        "when": "resourceScheme == 'file'"
    }]
}
```

### Modifying Git Diff Analysis

Update the `getGitDiffForFile` function in `extension.ts` to change how git diffs are processed.

### Customizing Ollama Integration

Modify the `getFeedbackFromOllama` function to adjust:
* Model selection
* Prompt engineering
* Response handling

## Dependencies

Key dependencies include:
* `@langchain/ollama`: For AI integration
* `@types/vscode`: For VSCode API types
* TypeScript compiler

## Additional Resources

* [VSCode Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
* [VSCode API Documentation](https://code.visualstudio.com/api)
* [Ollama Documentation](https://ollama.ai/docs)
* [Langchain Documentation](https://js.langchain.com/docs/)