# PlayCanvas Local Bridge 🌉

A professional local development environment for PlayCanvas. This tool allows you to write code locally in your favorite IDE (VS Code, etc.), version it with Git, and mirror it instantly to the PlayCanvas Editor using a secure local server.

## 🚀 Workflow Overview

![Workflow Diagram](docs/diagram_flow.png)

1. **Code Locally:** Your game code lives in the `src/` folder (which is a clone of your game repository).
2. **Mirror Server:** A Node.js server serves these files over HTTPS.
3. **Dev Hook:** A special script in PlayCanvas intercepts loading requests.
   * **Dev Mode (`?local=true`):** Redirects requests to your `localhost`.
   * **Prod Mode:** Loads files normally from the cloud.

---

## 🛠 Prerequisites

* **Node.js** (v18+ recommended)
* **pnpm** (or npm)
* **mkcert** (Required for SSL/HTTPS)
    * *macOS:* `brew install mkcert`
    * *Windows:* `choco install mkcert`

---

## 📥 Installation & Setup

### 1. Clone the Bridge & Install Dependencies

Clone this repository (the tool) and install the necessary packages.

```bash
git clone <URL_TO_THIS_REPO>
cd playcanvas-local-bridge
pnpm install
```

### 2. Setup Your Game Code (src/)

This tool expects your game logic to be inside a folder named `src`. Clone your actual game repository into the src folder:

```bash
# Example:
git clone https://github.com/username/my-game-scripts.git src
```

Now, `src/` contains your scripts like `src/Scripts/Player/player.js`, etc.

**📘 Need help setting up your PlayCanvas project repository with GitHub sync?**
See the detailed guide: [PlayCanvas Project Setup - GitHub Sync](docs/PLAYCANVAS_PROJECT_SETUP.md)

### 3. Generate SSL Certificates

PlayCanvas runs on HTTPS, so your local server must also be secure. We use `mkcert` to generate locally trusted certificates.

Run these commands in the root of the project:

```bash
# 1. Install local CA (do this once per machine)
mkcert -install

# 2. Generate certificates for localhost
mkcert localhost
```

You should now see `localhost.pem` and `localhost-key.pem` in your project root.

---

## 🎨 PlayCanvas Editor Setup

You need to add a "Loading Hook" script to your PlayCanvas project. This script intercepts asset loading and redirects script requests to your local server when in development mode.

### 1. Create the Loading Hook Asset

In the PlayCanvas Editor assets, create a new **Script** asset named `loading-hook.js`.

Copy the content from the [loading-hook.js](tools/pc-scripts/loading-hook.js) file included in this repository and paste it into your PlayCanvas script.

### 2. Add to Loading Screen (Critical!)

1. Go to **Settings ⚙️ -> Loading Screen**.
2. In the **Scripts** section, click **"Add Script"**.
3. Select `loading-hook.js` from the asset picker.

This ensures the hook executes **before** any game scripts are loaded, allowing it to intercept the asset loading system.

**That's it!** Unlike older approaches, you don't need to disable preload on your game scripts. The loading hook works by intercepting the `pc.Asset.prototype.getFileUrl()` method, allowing scripts to load normally while redirecting them to localhost in development mode.

### How the Loading Hook Works

The `loading-hook.js` uses a sophisticated approach to seamlessly redirect script loading:

1. **Detection:** Checks for `?local=true` parameter in the URL
2. **File Map:** Fetches a map of available scripts from `localhost:3000/file-map`
3. **Asset Patching:** Overrides `pc.Asset.prototype.getFileUrl()` to intercept script loading
4. **Smart Redirection:** When a script asset is requested:
   - If it's in the file map → redirects to `localhost:3000/src/...`
   - Otherwise → uses the original PlayCanvas cloud URL
5. **Cache Busting:** Adds timestamp to local URLs for instant updates

**Key Advantages:**
- ✅ No need to disable preload on game scripts
- ✅ Works with existing PlayCanvas loading pipeline
- ✅ Seamless fallback to production mode
- ✅ Selective override (only mapped files are redirected)

---

## 🏃‍♂️ How to Run

### 1. Start the Server

Run the local server. It will watch your `src` folder.

```bash
pnpm dev
```

### 2. Launch with Local Mode

1. Open the PlayCanvas Launch tab.
2. Add `?local=true` to the URL.

**Example:** `https://launch.playcanvas.com/123456?debug=true&local=true`

### 3. Verify it works

Open the browser console (F12). You should see:

**Success:**
```
🔧 MODE: LOCAL DEV (Hooking Asset System)
✅ Asset loader patched
```

**Troubleshooting:**

* If you see `🎮 MODE: PRODUCTION`:
  * Check if you added `?local=true` to the URL.

* If you see `❌ Failed to connect`:
  * Check if the server is running.
  * Check if SSL certificates are generated correctly.

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
