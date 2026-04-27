/**
 * Version Management Script
 * Usage: node scripts/version.js [major|minor|patch|version]
 * Examples:
 *   node scripts/version.js patch
 *   node scripts/version.js minor
 *   node scripts/version.js 2.0.0
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PACKAGE_JSON = path.join(__dirname, '..', 'package.json')
const CHANGELOG = path.join(__dirname, '..', 'CHANGELOG.md')

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'))
  return pkg.version
}

function bumpVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(Number)
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
    default:
      if (/^\d+\.\d+\.\d+$/.test(type)) {
        return type
      }
      throw new Error(`Invalid version type: ${type}. Use major, minor, patch, or a semver string (x.y.z)`)
  }
}

function updatePackageJson(version) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'))
  pkg.version = version
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n')
  console.log(` Updated package.json to v${version}`)
}

function updateChangelog(newVersion, oldVersion) {
  const date = new Date().toISOString().split('T')[0]
  const entry = `## [v${newVersion}] - ${date}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n### Removed\n- \n\n`
  
  let content = ''
  if (fs.existsSync(CHANGELOG)) {
    content = fs.readFileSync(CHANGELOG, 'utf8')
  }
  
  content = `# Changelog\n\n## [Unreleased]\n\n${entry}${content.replace(/^# Changelog\n\n/, '')}`
  fs.writeFileSync(CHANGELOG, content)
  console.log(` Updated CHANGELOG.md`)
}

function getCommitHistory(fromTag) {
  try {
    const cmd = fromTag
      ? `git log --pretty=format:"- %s" ${fromTag}..HEAD`
      : 'git log --pretty=format:"- %s" --all'
    return execSync(cmd, { encoding: 'utf8' })
  } catch {
    return ''
  }
}

function main() {
  const args = process.argv.slice(2)
  const type = args[0] || 'patch'
  
  const currentVersion = getCurrentVersion()
  console.log(`Current version: v${currentVersion}`)
  
  const newVersion = bumpVersion(currentVersion, type)
  console.log(`New version: v${newVersion}`)
  
  // Update package.json
  updatePackageJson(newVersion)
  
  // Update CHANGELOG
  updateChangelog(newVersion, currentVersion)
  
  // Get commit history since last tag
  const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', { encoding: 'utf8' }).trim()
  const commits = getCommitHistory(lastTag)
  
  console.log(`\nCommits since ${lastTag || 'initial commit'}:`)
  console.log(commits || '(no commits)')
  
  console.log(`\nNext steps:`)
  console.log(`1. Review and update CHANGELOG.md with actual changes`)
  console.log(`2. git add package.json package-lock.json CHANGELOG.md`)
  console.log(`3. git commit -m "chore(release): bump version to v${newVersion}"`)
  console.log(`4. git tag v${newVersion}`)
  console.log(`5. git push origin master --tags`)
}

try {
  main()
} catch (error) {
  console.error(`Error: ${error.message}`)
  process.exit(1)
}
