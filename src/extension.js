const vscode = require('vscode')
const fs = require('fs')
const path = require('path')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Atom Material Icons With Jetbrains extension is now active!')

  // 打印当前主题信息
  console.log('当前主题类型:', getCurrentThemeType())

  // 监听配置变化
  const configWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('atom-file-icon-with-jetbrains')) {
      console.log('配置发生变化，重新生成主题...')
      updateIconTheme(false) // 配置变化时不显示通知
    }
  })

  // 监听主题变化
  const themeWatcher = vscode.window.onDidChangeActiveColorTheme((theme) => {
    const themeType = getCurrentThemeType()
    console.log('主题发生变化:', themeType)

    // 可以在这里根据主题变化执行特定逻辑
    // 例如：根据不同主题类型使用不同的图标变体
    updateIconTheme(false)
  })

  // 初始加载时静默更新图标主题（不显示通知）
  updateIconTheme(false)

  context.subscriptions.push(configWatcher, themeWatcher)
}

/**
 * 判断当前VS Code主题是深色还是浅色
 * @returns {'dark' | 'light' | 'highContrast'} 主题类型
 */
function getCurrentThemeType() {
  // 获取当前的颜色主题
  const currentTheme = vscode.window.activeColorTheme

  if (currentTheme) {
    // VS Code提供了kind属性来判断主题类型
    switch (currentTheme.kind) {
      case vscode.ColorThemeKind.Light:
      case vscode.ColorThemeKind.HighContrastLight:
        return 'light'
      case vscode.ColorThemeKind.Dark:
        return 'dark'
      case vscode.ColorThemeKind.HighContrast:
        return 'highContrast'
      default:
        // 如果无法确定，默认返回深色
        return 'dark'
    }
  }

  // 兜底方案：如果无法获取主题信息，默认返回深色
  return 'dark'
}

function updateIconTheme(showNotification = false) {
  try {
    // 获取扩展路径
    const extensionPath = vscode.extensions.getExtension(
      'SoulFriends.atom-file-icon-with-jetbrains',
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
      'a-wl-file-icon-vscode-icon-theme.json',
    )

    // 确保基础主题文件存在
    if (!fs.existsSync(baseThemePath)) {
      console.error('基础主题文件不存在')
      vscode.window.showErrorMessage(
        'Some files are missing and the extension may not work properly',
      )
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
    // 获取当前主题类型
    const isLightTheme = getCurrentThemeType() === 'light'
    if (isLightTheme) {
      baseTheme.folder = 'default_folder_light'
      baseTheme.folderExpanded = 'default_folder_open_light'
    }
    let mergedTheme = JSON.parse(JSON.stringify(baseTheme))
    mergedTheme.light = mergeThemeVariant(mergedTheme.light || {}, mergedTheme)

    const config = vscode.workspace.getConfiguration(
      'atom-file-icon-with-jetbrains',
    )

    // 新增图标包起始
    // const angularIconPackOld = config.get('iconpack-angular-old', false)
    // const angularIconPackNew = config.get('iconpack-angular-new', false)

    // const angularThemePathOld = path.join(
    //   extensionPath,
    //   'themes',
    //   'iconpack-angular-old.json'
    // )
    // const angularThemePathNew = path.join(
    //   extensionPath,
    //   'themes',
    //   'iconpack-angular-new.json'
    // )

    // const iconPackArray = [
    //   [angularIconPackOld, angularThemePathOld],
    //   [angularIconPackNew, angularThemePathNew],
    // ]
    const iconPackArray = [
      'iconpack-angular-old',
      'iconpack-angular-new',
      'iconpack-eslint',
      'iconpack-jotai',
      'iconpack-nest',
      'iconpack-next',
      'iconpack-ngrx',
      'iconpack-phalcon',
      'iconpack-rails',
      'iconpack-recoil',
      'iconpack-redux',
      'iconpack-router',
      'iconpack-test',
      'iconpack-volt',
      'iconpack-index',
    ].map((item) => [
      config.get(item, false),
      path.join(extensionPath, 'themes', item + '.json'),
    ])
    // 新增图标包结束

    // 合并图标包
    iconPackArray.forEach(([isEnabled, themePath]) => {
      const fileName = path.parse(themePath).name
      if (isEnabled && fs.existsSync(themePath)) {
        const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'))
        theme.light = mergeThemeVariant(theme.light || {}, theme)
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
      console.log('📝 图标主题文件已更新')

      if (showNotification) {
        vscode.window.showInformationMessage('Icon updated')
      }
    } else {
      console.log('📋 主题内容未发生变化，跳过写入')
    }
  } catch (error) {
    console.error('更新图标主题时出错:', error)
    vscode.window.showErrorMessage(`Failed to update icon: ${error.message}`)
  }
}

function mergeThemes(baseTheme, additionalTheme) {
  const merged = JSON.parse(JSON.stringify(baseTheme))

  // 合并图标定义
  if (additionalTheme.iconDefinitions) {
    merged.iconDefinitions = {
      ...merged.iconDefinitions,
      ...additionalTheme.iconDefinitions,
    }
  }

  // 合并文件扩展名
  if (additionalTheme.fileExtensions) {
    merged.fileExtensions = {
      ...merged.fileExtensions,
      ...additionalTheme.fileExtensions,
    }
  }

  // 合并文件名
  if (additionalTheme.fileNames) {
    merged.fileNames = {
      ...merged.fileNames,
      ...additionalTheme.fileNames,
    }
  }

  // 合并文件夹名
  if (additionalTheme.folderNames) {
    merged.folderNames = {
      ...merged.folderNames,
      ...additionalTheme.folderNames,
    }
  }

  // 合并展开的文件夹名
  if (additionalTheme.folderNamesExpanded) {
    merged.folderNamesExpanded = {
      ...merged.folderNamesExpanded,
      ...additionalTheme.folderNamesExpanded,
    }
  }

  // 合并语言ID
  if (additionalTheme.languageIds) {
    merged.languageIds = {
      ...merged.languageIds,
      ...additionalTheme.languageIds,
    }
  }

  // 合并浅色主题
  if (additionalTheme.light) {
    merged.light = mergeThemes(merged.light || {}, additionalTheme.light)
  }

  // 合并高对比度主题
  if (additionalTheme.highContrast) {
    merged.highContrast = mergeThemes(
      merged.highContrast || {},
      additionalTheme.highContrast,
    )
  }

  return merged
}

function mergeThemeVariant(baseVariant, additionalVariant) {
  const merged = JSON.parse(JSON.stringify(baseVariant))

  if (additionalVariant.fileExtensions) {
    merged.fileExtensions = {
      ...additionalVariant.fileExtensions,
      ...merged.fileExtensions,
    }
  }

  if (additionalVariant.fileNames) {
    merged.fileNames = {
      ...additionalVariant.fileNames,
      ...merged.fileNames,
    }
  }

  if (additionalVariant.languageIds) {
    merged.languageIds = {
      ...additionalVariant.languageIds,
      ...merged.languageIds,
    }
  }

  return merged
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
  getCurrentThemeType,
}
