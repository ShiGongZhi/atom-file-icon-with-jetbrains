const vscode = require('vscode')
const fs = require('fs')
const path = require('path')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Atom Material Icons With Jetbrains extension is now active!')

  // 监听配置变化
  const configWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('atom-file-icon-with-jetbrains')) {
      console.log('配置发生变化，重新生成主题...')
      updateIconTheme(true) // 配置变化时显示通知
    }
  })

  // 初始加载时静默更新图标主题（不显示通知）
  updateIconTheme(false)

  context.subscriptions.push(configWatcher)
}

function updateIconTheme(showNotification = false) {
  try {
    // 获取扩展路径
    const extensionPath = vscode.extensions.getExtension(
      'SoulFriends.atom-file-icon-with-jetbrains'
    )?.extensionPath
    if (!extensionPath) {
      console.error('无法获取扩展路径')
      return
    }

    // 文件路径
    const baseThemePath = path.join(extensionPath, 'themes', 'base-theme.json')
    const outputThemePath = path.join(
      extensionPath,
      'themes',
      'a-wl-file-icon-vscode-icon-theme.json'
    )

    // 确保基础主题文件存在
    if (!fs.existsSync(baseThemePath)) {
      console.error('基础主题文件不存在')
      vscode.window.showErrorMessage('基础主题文件缺失，扩展可能无法正常工作')
      return
    }

    // 读取当前主题文件（如果存在）用于比较
    let currentThemeContent = null
    if (fs.existsSync(outputThemePath)) {
      try {
        currentThemeContent = fs.readFileSync(outputThemePath, 'utf8')
      } catch (error) {
        console.log('读取当前主题文件失败，将重新生成')
      }
    }

    // 读取基础主题
    const baseTheme = JSON.parse(fs.readFileSync(baseThemePath, 'utf8'))
    let mergedTheme = JSON.parse(JSON.stringify(baseTheme))

    const config = vscode.workspace.getConfiguration(
      'atom-file-icon-with-jetbrains'
    )

    // 新增图标包起始
    const angularIconPackOld = config.get('angularIconPackOld', false)
    const angularIconPackNew = config.get('angularIconPackNew', false)
    const nestIconPack = config.get('nestIconPack', false)

    const angularThemePathOld = path.join(
      extensionPath,
      'themes',
      'angular.json'
    )
    const angularThemePathNew = path.join(
      extensionPath,
      'themes',
      'angular2.json'
    )
    const nestThemePath = path.join(extensionPath, 'themes', 'nest.json')

    const iconPackArray = [
      [angularIconPackOld, angularThemePathOld],
      [angularIconPackNew, angularThemePathNew],
      [nestIconPack, nestThemePath]
    ]
    // 新增图标包结束

    // 合并图标包
    iconPackArray.forEach(([isEnabled, themePath]) => {
      const fileName = path.parse(themePath).name
      if (isEnabled && fs.existsSync(themePath)) {
        const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'))
        mergedTheme = mergeThemes(mergedTheme, theme)
      } else if (isEnabled) {
        console.log(`❌ ${fileName}图标包已启用但文件不存在:`, themePath)
      } else {
        console.log(`⏭️ 跳过${fileName}图标包 (未启用)`)
      }
    })

    // 生成新的主题内容
    const newThemeContent = JSON.stringify(mergedTheme, null, 2)

    // 检查内容是否发生变化
    const contentChanged = currentThemeContent !== newThemeContent

    if (contentChanged) {
      // 写入合并后的主题
      fs.writeFileSync(outputThemePath, newThemeContent)
      console.log('📝 图标主题文件已更新:', outputThemePath)

      // 只有在显式要求且内容确实发生变化时才显示通知
      if (showNotification) {
        vscode.window
          .showInformationMessage(
            '图标主题配置已更新，建议重新加载窗口以应用更改。',
            '重新加载'
          )
          .then((selection) => {
            if (selection === '重新加载') {
              vscode.commands.executeCommand('workbench.action.reloadWindow')
            }
          })
      }
    } else {
      console.log('📋 主题内容未发生变化，跳过写入')
    }
  } catch (error) {
    console.error('更新图标主题时出错:', error)
    vscode.window.showErrorMessage(`更新图标主题失败: ${error.message}`)
  }
}

function mergeThemes(baseTheme, additionalTheme) {
  const merged = JSON.parse(JSON.stringify(baseTheme))

  // 合并图标定义
  if (additionalTheme.iconDefinitions) {
    merged.iconDefinitions = {
      ...merged.iconDefinitions,
      ...additionalTheme.iconDefinitions
    }
  }

  // 合并文件扩展名
  if (additionalTheme.fileExtensions) {
    merged.fileExtensions = {
      ...merged.fileExtensions,
      ...additionalTheme.fileExtensions
    }
  }

  // 合并文件名
  if (additionalTheme.fileNames) {
    merged.fileNames = {
      ...merged.fileNames,
      ...additionalTheme.fileNames
    }
  }

  // 合并文件夹名
  if (additionalTheme.folderNames) {
    merged.folderNames = {
      ...merged.folderNames,
      ...additionalTheme.folderNames
    }
  }

  // 合并展开的文件夹名
  if (additionalTheme.folderNamesExpanded) {
    merged.folderNamesExpanded = {
      ...merged.folderNamesExpanded,
      ...additionalTheme.folderNamesExpanded
    }
  }

  // 合并语言ID
  if (additionalTheme.languageIds) {
    merged.languageIds = {
      ...merged.languageIds,
      ...additionalTheme.languageIds
    }
  }

  // 合并浅色主题
  if (additionalTheme.light) {
    merged.light = mergeThemeVariant(merged.light || {}, additionalTheme.light)
  }

  // 合并高对比度主题
  if (additionalTheme.highContrast) {
    merged.highContrast = mergeThemeVariant(
      merged.highContrast || {},
      additionalTheme.highContrast
    )
  }

  return merged
}

function mergeThemeVariant(baseVariant, additionalVariant) {
  const merged = JSON.parse(JSON.stringify(baseVariant))

  if (additionalVariant.fileExtensions) {
    merged.fileExtensions = {
      ...merged.fileExtensions,
      ...additionalVariant.fileExtensions
    }
  }

  if (additionalVariant.fileNames) {
    merged.fileNames = {
      ...merged.fileNames,
      ...additionalVariant.fileNames
    }
  }

  return merged
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
