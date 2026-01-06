# PlayCanvas Project Setup - GitHub Sync

This guide explains how to set up your PlayCanvas project repository that will be cloned into the `src/` folder for local development.

## Overview

Your game scripts repository will automatically sync to PlayCanvas using GitHub Actions, allowing you to:
- Version control your code with Git
- Collaborate with your team
- Automatically deploy changes to PlayCanvas on every push

---

## 📁 Repository Structure

**IMPORTANT:** The folder structure in your repository must match the structure in your PlayCanvas project.

For example, if you want to sync scripts:
```
/Scripts
  /Player
    player.js
  /UI
    menu.js
```

This structure should be identical in both GitHub and PlayCanvas.

---

## 🔑 Getting PlayCanvas Credentials

To enable automatic synchronization, you need to obtain three values from PlayCanvas:

### **API Key** (`PC_API_KEY`)
1. Go to [PlayCanvas Account Settings](https://playcanvas.com/account)
2. Navigate to the **API Tokens** section
3. Click **"New Token"** or **"Generate Token"**
4. Copy the generated API key (you won't be able to see it again!)

### **Project ID** (`PC_PROJECT_ID`) and **Branch ID** (`PC_BRANCH_ID`)

**Quick way** (recommended):
1. Open your project in PlayCanvas Editor
2. Open browser console (F12)
3. Run this command:
```javascript
copy({
  PC_PROJECT_ID: config.project.id,
  PC_BRANCH_ID: config.self.branch.id
})
```
4. The IDs are now copied to clipboard as JSON

**Manual way:**
- **Project ID**: Look at the URL `https://playcanvas.com/editor/scene/{PROJECT_ID}` - the number after `/scene/`
- **Branch ID**: Open **Version Control** panel, click on your branch, and find the Branch ID in the details

---

## 🔐 Adding Secrets to GitHub

Once you have the credentials:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the following three secrets:

| Secret Name | Description |
|-------------|-------------|
| `PC_API_KEY` | Your PlayCanvas API Token |
| `PC_PROJECT_ID` | Your PlayCanvas Project ID |
| `PC_BRANCH_ID` | Your PlayCanvas Branch ID |

---

## ⚙️ GitHub Action Setup

Create a file `.github/workflows/syncPlaycanvas.yml` in your repository with the following content:

```yaml
name: Sync to PlayCanvas

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install Tool
        run: npm install -g playcanvas-sync

      - name: Push to PlayCanvas
        env:
          PLAYCANVAS_API_KEY: ${{ secrets.PC_API_KEY }}
          PLAYCANVAS_PROJECT_ID: ${{ secrets.PC_PROJECT_ID }}
          PLAYCANVAS_BRANCH_ID: ${{ secrets.PC_BRANCH_ID }}
          PLAYCANVAS_TARGET_DIR: "."
          # Sync only Scripts folder to protect other files from deletion
          PLAYCANVAS_INCLUDE_REG: "Scripts/.*"
          PLAYCANVAS_FORCE_REG: "^Scripts\\/.*"
          # Ignore system and config files
          PLAYCANVAS_BAD_FILE_REG: "^\\.|~$|jsconfig|pcconfig|\\.yml$"
          PLAYCANVAS_BAD_FOLDER_REG: "^\\.|node_modules"
          PLAYCANVAS_VERBOSE: 1
        run: |
          echo "🔍 Checking diff..."
          pcsync diffAll

          echo "🚀 Pushing..."
          # Auto-confirm overwrites with --yes flag
          pcsync pushAll --yes
```

---

## 🚀 How It Works

The GitHub Action automatically:

- Triggers on every push to the `main` branch
- Installs [playcanvas-sync](https://www.npmjs.com/package/playcanvas-sync) tool
- Syncs **only the `Scripts/` folder** to PlayCanvas
- Ignores system files (dotfiles, node_modules, etc.)
- Automatically confirms overwrites with the `--yes` flag

---

## 🎛️ Configuration

You can modify sync behavior in the GitHub Action workflow file:

- **`PLAYCANVAS_INCLUDE_REG`**: Pattern for files to sync (default: only `Scripts/` folder)
- **`PLAYCANVAS_BAD_FILE_REG`**: Files to ignore (dotfiles, temp files, etc.)
- **`PLAYCANVAS_BAD_FOLDER_REG`**: Folders to ignore (dotfiles, node_modules)

---

## ✅ Testing the Sync

After setting up:

1. Make a change to a file in the `Scripts/` folder
2. Commit and push to the `main` branch
3. Go to **Actions** tab in GitHub to see the workflow running
4. Check your PlayCanvas project to verify the changes

---

## 📝 Important Notes

- ⚠️ **Structure Must Match**: Your repository structure must exactly match the PlayCanvas project structure
- 🔒 **Scripts Only**: By default, only the `Scripts/` folder is synced to prevent accidental deletion of scenes or assets
- 🚀 **Auto-confirm**: The action uses `--yes` flag to automatically confirm overwrites
- 📝 **Check Logs**: Review the action logs to see what files were changed

---

## 🔧 Troubleshooting

- If sync fails, check the Actions logs for error messages
- Verify all three secrets are correctly set in GitHub
- Ensure your API key has write permissions
- Confirm the Branch ID matches the branch you want to sync to

---

## 🔗 Integration with Local Bridge

Once your repository is set up with GitHub sync:

1. Clone it into the `src/` folder of the PlayCanvas Local Bridge:
   ```bash
   git clone https://github.com/username/your-game-scripts.git src
   ```

2. Now you can:
   - Edit code locally in your IDE
   - Test changes instantly with the local bridge
   - Commit and push to deploy to PlayCanvas cloud
   - Your team members get automatic updates
