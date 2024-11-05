
# Backstage Party Social Network - Code Review Extension

A VSCode extension that leverages Ollama to provide AI-powered code reviews and git diff analysis directly in your editor.

## Features

- **AI Code Review**: Get instant code reviews for any file in your workspace
- **Git Diff Analysis**: Analyze changes in your git repository with AI assistance
- **Support for All Files**: Works with any file type VSCode can open, including:
  - Source code files
  - Configuration files
  - Dockerfiles and Makefiles
  - Files without extensions

## Requirements

- VSCode 1.95.0 or higher
- Ollama installed and running locally with model llama3.2
- Git installed (for git diff analysis)

## Installation

1. Install Ollama following the instructions at [Ollama's website](https://ollama.ai/)
2. Install this extension from the VSCode Marketplace
3. Ensure Ollama is running locally on port 11434

## Usage

### Code Review

1. Right-click any file in the explorer or editor
2. Select "Code Review with Ollama"
3. View the AI-generated feedback in the automatically created markdown file

### Git Diff Analysis

1. Make changes to a file in your git repository
2. Right-click the file
3. Select "Analyze Git Changes with Ollama"
4. View the AI analysis of your changes

### Feedback Location

All feedback is saved in an `ollama_feedback` directory in your workspace, with timestamps and original filenames for easy reference.

## Extension Settings

This extension has no additional settings at this time.

## Known Issues

- Requires Ollama to be running locally
- Large files may take longer to process

## Release Notes

### 0.0.1

Initial release:
- Basic code review functionality
- Git diff analysis
- Support for all VSCode-compatible files

## Contributing

Feel free to submit issues and enhancement requests on our GitHub repository.

## License

This extension is licensed under the [MIT License](LICENSE.md).