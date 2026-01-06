# PlayCanvas Local Bridge 🌉

A professional local development environment for PlayCanvas. This tool allows you to write code locally in your favorite IDE (VS Code, etc.), version it with Git, and mirror it instantly to the PlayCanvas Editor using a secure local server.

## 🚀 Workflow Overview

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

Now, `src/` contains your scripts like `src/game/player.js`, etc.

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

You need to add a "Hook" script to your PlayCanvas project. This script manages the loading process.

### 1. Create the Script

In the PlayCanvas Editor assets, create a new script named `dev-hook.js`.

Copy the content from the [dev-hook.js](dev-hook.js) file included in this repository and paste it into your PlayCanvas script.

### 2. Configure Loading Order (Critical!)

1. Go to **Settings ⚙️ -> Scripts**.
2. Drag `dev-hook.js` to **position #1** (The very top).
3. Ensure `dev-hook.js` has **"Preload" ✅ CHECKED**.

### 3. Disable Preload for Game Scripts

To allow dev-hook to intercept loading, the engine must not load scripts automatically.

1. Select all your game scripts in the Assets panel (everything inside your src equivalent).
2. **Uncheck "Preload" ⬜**.

**Don't worry:** The dev-hook script has a "Bootstrap" logic that will automatically load them for you, whether you are in Local Mode or Production Mode.

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
🔧 MODE: LOCAL DEV
🗺️ Map loaded from localhost
✅ Override: your-script-name.js (for each of your files)
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
