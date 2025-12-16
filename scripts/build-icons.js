#!/usr/bin/env node

/**
 * 图标构建脚本
 * 从模板文件夹读取 SVG 模板，替换颜色变量，生成最终 SVG 文件
 *
 * 使用方式: node scripts/build-icons.js
 */

const fs = require('fs')
const path = require('path')

// 路径配置
const PROJECT_ROOT = path.join(__dirname, '..')
const THEMES_DIR = path.join(PROJECT_ROOT, 'themes')
const TEMPLATES_DIR = path.join(PROJECT_ROOT, 'templates')
const COLORS_FILE = path.join(__dirname, 'colors.json')

// 递归获取目录下所有 SVG 文件
function getAllSvgFiles(dir, baseDir = dir) {
  let results = []
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      results = results.concat(getAllSvgFiles(filePath, baseDir))
    } else if (file.endsWith('.svg')) {
      // 获取相对于基础目录的路径
      const relativePath = path.relative(baseDir, filePath)
      results.push(relativePath)
    }
  }

  return results
}

// 读取颜色配置
function loadColors() {
  const content = fs.readFileSync(COLORS_FILE, 'utf-8')
  return JSON.parse(content)
}

// 替换模板中的变量
function replaceVariables(template, colors) {
  let result = template
  for (const [key, value] of Object.entries(colors)) {
    const regex = new RegExp(`{{ ${key} }}`, 'g')
    result = result.replace(regex, value)
  }
  return result
}

// 处理单个模板文件
function processTemplate(relativePath, colors) {
  const templatePath = path.join(TEMPLATES_DIR, relativePath)
  const outputPath = path.join(THEMES_DIR, relativePath)

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const template = fs.readFileSync(templatePath, 'utf-8')
  const result = replaceVariables(template, colors)
  fs.writeFileSync(outputPath, result, 'utf-8')
  console.log(`✓ Generated: ${relativePath}`)
}

// 主函数
function main() {
  console.log('🎨 Building icons from templates...\n')

  // 检查模板目录是否存在
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error('❌ Templates directory not found:', TEMPLATES_DIR)
    process.exit(1)
  }

  // 检查颜色配置文件是否存在
  if (!fs.existsSync(COLORS_FILE)) {
    console.error('❌ Colors file not found:', COLORS_FILE)
    process.exit(1)
  }

  // 加载颜色配置
  const colors = loadColors()
  console.log('📦 Loaded colors:', colors)
  console.log('')

  // 获取所有模板文件（递归）
  const templates = getAllSvgFiles(TEMPLATES_DIR)

  if (templates.length === 0) {
    console.log('⚠️  No templates found in:', TEMPLATES_DIR)
    return
  }

  // 处理每个模板
  for (const template of templates) {
    processTemplate(template, colors)
  }

  console.log(`\n✅ Done! Generated ${templates.length} icon(s).`)
}

main()
