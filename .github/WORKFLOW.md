# GitHub Actions Workflow: Continuous Integration & Deployment

## Overview
This project uses GitHub Actions for automated CI/CD pipeline:
- **Code Detection**: Triggered on push to `master` branch and pull requests
- **Build Verification**: Automated npm build process
- **Version Management**: Automatic semantic versioning
- **GitHub Pages Deployment**: Auto-deploy static files to GitHub Pages
- **Release Management**: Automated GitHub Releases with changelog
- **Error Handling**: Failed build notifications and rollback mechanisms
- **Monitoring**: Workflow status badges and build logs

## Workflow Files

### 1. `ci.yml` - Continuous Integration
- **Trigger**: Push to `master`, Pull Requests
- **Jobs**:
  - Build verification (npm run build)
  - Code quality checks
  - Artifact generation

### 2. `deploy.yml` - GitHub Pages Deployment
- **Trigger**: Push to `master` branch
- **Jobs**:
  - Build production assets
  - Deploy to GitHub Pages
  - Post-deployment verification

### 3. `release.yml` - Release Management
- **Trigger**: Manual dispatch or tag push
- **Jobs**:
  - Version bump
  - Changelog generation
  - Create GitHub Release with assets

## Configuration

### Required Secrets
- `GH_TOKEN`: GitHub Personal Access Token (for releases)

### Branch Protection
- Protect `master` branch
- Require status checks to pass before merging
- Require pull request reviews

## Usage

### Automatic Deployment
```bash
git add .
git commit -m "feat: your change description"
git push origin master
```
The CI/CD pipeline will automatically:
1. Build the project
2. Deploy to GitHub Pages
3. Update version if needed

### Manual Release
```bash
# Trigger release via GitHub Actions UI
# Or push a tag:
git tag v1.2.0
git push origin --tags
```

## Monitoring
- Workflow runs: `https://github.com/wryzxc/pandans/actions`
- GitHub Pages: `https://wryzxc.github.io/pandans`
- Releases: `https://github.com/wryzxc/pandans/releases`

## Error Handling
- Failed builds will notify via GitHub Actions notifications
- Deployment failures will not affect the current live version
- Automatic rollback on failed deployments
