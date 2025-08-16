# Automatic Release Process

This repository is configured with automatic releases that trigger when changes are pushed to the `main` branch.

## How it works

1. **Trigger**: When code is pushed to the `main` branch
2. **Version Detection**: The workflow reads the version from `package.json`
3. **Tag Creation**: If a tag for that version doesn't exist, it creates a new git tag `v<version>`
4. **Release Creation**: A GitHub release is created with the new tag
5. **Asset Upload**: The built VSIX extension file is attached to the release

## Workflow Steps

The `.github/workflows/publish.yml` file contains the following steps:

1. Checkout the repository
2. Setup Node.js environment
3. Install dependencies
4. Compile TypeScript code
5. Run linting
6. Package the VSIX file
7. Extract version from package.json
8. Check if tag already exists
9. Create new tag (if needed)
10. Create GitHub release with VSIX file

## Creating a New Release

To create a new release:

1. Update the version in `package.json`:
   ```json
   {
     "version": "2.1.0"
   }
   ```

2. Commit and push to the `main` branch:
   ```bash
   git add package.json
   git commit -m "Bump version to 2.1.0"
   git push origin main
   ```

3. The GitHub Action will automatically:
   - Create a tag `v2.1.0`
   - Build the extension
   - Create a GitHub release
   - Upload the VSIX file

## Release Notes

Release notes are automatically generated from commits since the last release. For better release notes, use conventional commit messages:

- `feat: add new feature` - for new features
- `fix: resolve bug` - for bug fixes
- `docs: update documentation` - for documentation changes
- `refactor: improve code structure` - for code refactoring

## Manual Releases

If you need to create a release manually or the automatic process fails:

1. Install vsce: `npm install -g @vscode/vsce`
2. Package the extension: `npx vsce package`
3. Create a GitHub release manually
4. Upload the generated VSIX file

## Troubleshooting

- **Tag already exists**: If you push without updating the version in package.json, the workflow will skip creating a release
- **Build failures**: Check the Actions tab for detailed error logs
- **Permission issues**: Ensure the repository has proper GitHub token permissions for creating releases