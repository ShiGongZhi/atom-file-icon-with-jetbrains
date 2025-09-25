# Atom Material Icons + Jetbrains Icons

Fix the original plug-in bug, automatically load the corresponding icon according to the light and dark theme, making the icon look clearer

<h1 align="center">
  <br>
    <img src="https://raw.githubusercontent.com/ToneAr/a-file-icon-vscode/master/logo.png?sanitize=true" alt="logo" width="200">
  <br><br>
  Atom Material Icons + Jetbrains Icons for VSCode
  <br>
  <br>
</h1>

This plugin is a port of the [Atom File Icons](https://github.com/file-icons/atom) for VSCode.

It replaces the icons and folder icons with better suited icons, related to the file type, framework or language.

This plugin also use some file icon from [jetbrains](https://intellij-icons.jetbrains.design/)

## Features

- Replaces **file icons** with their relevant logo icons
  - According to their extension (`.java`, `.php`, `.ruby`...)
  - According to the framework (Android, NPM, RSpec...)
  - According to the program used in conjonction (Babel, Docker, CircleCI...)
  - According to the parent directory (`.github/*`, `.vscode/*`...)
  - And others...
- Replaces **folder icons**:
  - From common patterns: `src`, `main`, `app`, `img`, `docs`...
  - From specific use cases: `node_modules`, `.vscode`, `.git.`..
- **Dynamic Icon Packs**: Choose which icon packs to enable
  - Angular Icon Pack: Special icons for Angular files (component.ts, service.ts, etc.)
  - NestJS Icon Pack: Special icons for NestJS files (controller.ts, module.ts, etc.)

## Configuration

This extension provides configurable icon packs that can be enabled or disabled based on your project needs:

### Settings

- **`atom-file-icon-with-jetbrains.angularIconPackNew`** (boolean, default: false)

  - Enable Angular-specific file icons for `.component.ts`, `.service.ts`, `.module.ts`, etc.

- **`atom-file-icon-with-jetbrains.nestIconPack`** (boolean, default: false)
  - Enable NestJS-specific file icons for `.controller.ts`, `.dto.ts`, `.entity.ts`, etc.

### How to Configure

1. Open VS Code Settings (Ctrl/Cmd + ,)
2. Search for "atom-file-icon-with-jetbrains"
3. Toggle the desired icon packs
4. The extension will automatically regenerate the icon theme
5. Reload the window when prompted to apply changes

### Manual Regeneration

You can manually regenerate the icon theme by:

1. Opening the Command Palette (Ctrl/Cmd + Shift + P)
2. Running the "Regenerate Icon Theme" command

## File Icons

![File Icons](https://raw.githubusercontent.com/ToneAr/iconGenerator/master/assets/files.png)

## Folder Icons

![Folder Icons](https://raw.githubusercontent.com/ToneAr/iconGenerator/master/assets/folders.png)
