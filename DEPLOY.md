#  自动化部署指南

## 概述

本项目使用 GitHub Actions 实现完整的 CI/CD 流程，包含：
- 自动构建验证
- 自动部署到 GitHub Pages
- 自动版本管理和 GitHub Releases
- 变更日志自动生成
- 错误处理和状态通知

## 项目结构

```
pandaslab/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml          # 持续集成（构建验证）
│   │   ├── deploy.yml      # 自动部署到 GitHub Pages
│   │   └── release.yml     # 发布管理（Releases）
│   └── WORKFLOW.md         # 工作流说明
├── scripts/
│   └── version.js          # 版本管理脚本
├── CHANGELOG.md            # 变更日志
├── DEPLOY.md               # 部署指南（本文件）
└── ...
```

## 快速开始

### 1. 初始设置

确保你的 GitHub 仓库已启用 GitHub Pages：
1. 进入仓库 → **Settings** → **Pages**
2. Source 选择 **GitHub Actions**
3. 保存

### 2. 推送代码

```bash
git add .
git commit -m "feat: your changes"
git push origin master
```

推送后，GitHub Actions 将自动执行：
1. CI 工作流：构建验证
2. Deploy 工作流：部署到 GitHub Pages

## 工作流程详解

### CI 工作流 (ci.yml)

**触发条件**:
- `master` 分支推送
- Pull Request 到 `master`

**执行步骤**:
| 步骤 | 说明 |
|------|------|
| Checkout | 获取代码 |
| Setup Node | 配置 Node.js 20 + npm 缓存 |
| Install | 安装依赖 (npm ci) |
| Build | 构建项目 (npm run build) |
| Artifacts | 上传构建产物 |
| Report | 生成构建报告 |

**状态检查**:
- 构建成功后才会触发部署
- 失败会生成错误报告

### Deploy 工作流 (deploy.yml)

**触发条件**:
- `master` 分支推送（CI 通过后）
- 手动触发（workflow_dispatch）

**执行步骤**:
| 步骤 | 说明 |
|------|------|
| Build | 构建项目 |
| 404 Fallback | 创建 SPA 路由回退页 |
| Metadata | 生成构建元数据 |
| Upload | 上传到 GitHub Pages |
| Verify | 部署后验证 |

**部署地址**: `https://wryzxc.github.io/pandans`

### Release 工作流 (release.yml)

**触发条件**:
- 手动触发（带版本类型选择）
- 推送标签（v*）

**执行步骤**:
| 步骤 | 说明 |
|------|------|
| Bump Version | 更新版本号 |
| Generate Changelog | 生成变更日志 |
| Commit & Tag | 提交版本 + 创建标签 |
| Build | 构建项目 |
| Archive | 创建 zip/tar.gz 压缩包 |
| Create Release | 创建 GitHub Release |

## 版本管理

### 方法一：GitHub Actions UI

1. 进入仓库 → **Actions** → **Release Workflow**
2. 点击 **Run workflow**
3. 选择版本类型：
   - `major` - 主版本（不兼容的 API 变更）
   - `minor` - 次版本（向后兼容的功能）
   - `patch` - 补丁（向后兼容的修复）
4. 可选填写自定义发布说明
5. 点击运行

### 方法二：命令行

```bash
# 本地更新版本
npm run version patch    # 或 minor, major
npm run version 2.0.0    # 或指定具体版本号

# 查看版本变更
cat package.json | grep version
cat CHANGELOG.md

# 提交并推送
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): bump version to v1.1.0"
git tag v1.1.0
git push origin master --tags
```

### 方法三：推送标签

```bash
# 创建并推送标签触发 Release
git tag v1.1.0
git push origin --tags
```

## 变更日志

变更日志文件：[CHANGELOG.md](./CHANGELOG.md)

**格式**:
```markdown
## [v1.1.0] - 2026-04-28

### Added
- 新功能描述

### Changed
- 变更描述

### Fixed
- 修复描述

### Removed
- 移除描述
```

**自动生成**:
- Release 工作流自动从 git 历史生成变更日志
- 本地脚本会自动创建新版本的日志框架

## 错误处理

### 构建失败

当构建失败时：
1. GitHub Actions 会发送通知（邮箱/GitHub 通知）
2. 进入 **Actions** 查看失败的工作流
3. 查看错误日志定位问题
4. 修复后重新推送即可触发新的构建

### 部署失败

- 部署失败不会回滚当前线上版本
- 检查 GitHub Pages 设置是否正确
- 确认 `dist/` 目录存在且包含 `index.html`

### 回滚机制

如果新版本出现问题：
```bash
# 回滚到上一个版本
git revert HEAD
git push origin master
# 或强制推送特定版本
git reset --hard <previous_commit>
git push --force origin master
```

## 监控

### GitHub Actions 状态徽章

在 README.md 中添加：
```markdown
[![CI](https://github.com/wryzxc/pandans/actions/workflows/ci.yml/badge.svg)](https://github.com/wryzxc/pandans/actions/workflows/ci.yml)
[![Deploy](https://github.com/wryzxc/pandans/actions/workflows/deploy.yml/badge.svg)](https://github.com/wryzxc/pandans/actions/workflows/deploy.yml)
```

### 查看工作流运行记录

- **Actions**: `https://github.com/wryzxc/pandans/actions`
- **GitHub Pages**: `https://wryzxc.github.io/pandans`
- **Releases**: `https://github.com/wryzxc/pandans/releases`

### 构建元数据

部署后可访问：
```
https://wryzxc.github.io/pandans/_build.json
```

返回：
```json
{
  "version": "1.0.0",
  "build_hash": "abc1234",
  "build_date": "2026-04-28T00:00:00Z",
  "repository": "wryzxc/pandans"
}
```

## 最佳实践

1. **提交前检查**: 本地运行 `npm run build` 确保构建通过
2. **语义化提交**: 使用约定式提交 (Conventional Commits)
   ```
   feat: add new feature
   fix: fix bug
   docs: update documentation
   chore: maintenance tasks
   ```
3. **功能分支**: 在功能分支开发，完成后 PR 合并到 master
4. **定期更新**: 定期更新依赖（`npm outdated` + `npm update`）
5. **版本规范**: 遵循语义化版本控制 (SemVer)

## 通知设置

GitHub 默认在以下情况发送通知：
- 工作流失败
- 你被 @提及
- 你的 PR 有更新

**自定义通知**:
1. 进入仓库 → **Settings** → **Notifications**
2. 配置邮件通知偏好

## 常见问题

### Q: 为什么 GitHub Pages 没有更新？
A: 部署可能需要 1-2 分钟传播。清除浏览器缓存后重试。

### Q: 如何强制重新部署？
A: 进入 Actions → Deploy → Run workflow 手动触发。

### Q: 如何禁用自动部署？
A: 删除或重命名 `.github/workflows/deploy.yml`。

### Q: 本地预览部署效果？
A: `npm run preview` 启动本地预览服务器。
