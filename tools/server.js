const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const chalk = require("chalk");

const PORT = 3000;
const PROJECT_ROOT = path.join(__dirname, "..");
const SRC_DIR = path.join(PROJECT_ROOT, "src");

const CERT_PATH = path.join(PROJECT_ROOT, "localhost.pem");
const KEY_PATH = path.join(PROJECT_ROOT, "localhost-key.pem");

if (!fs.existsSync(CERT_PATH) || !fs.existsSync(KEY_PATH)) {
  console.error(
    chalk.red(
      '❌ SSL Certificates not found! Run "mkcert localhost" in project root.'
    )
  );
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(KEY_PATH),
  cert: fs.readFileSync(CERT_PATH),
};

const app = express();
app.use(cors());

const getFileMap = (dir, baseDir, fileList = {}) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFileMap(fullPath, baseDir, fileList);
    } else {
      if (file.endsWith(".js") || file.endsWith(".mjs")) {
        const relativePath = path
          .relative(baseDir, fullPath)
          .replace(/\\/g, "/");
        fileList[file] = relativePath;
      }
    }
  });
  return fileList;
};

app.get("/file-map", (req, res) => {
  try {
    const map = getFileMap(SRC_DIR, SRC_DIR);
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    console.log(
      chalk.gray(
        `[${new Date().toLocaleTimeString()}] 🗺️  Map requested. Serving ${
          Object.keys(map).length
        } files.`
      )
    );
    res.json(map);
  } catch (e) {
    console.error(chalk.red("Error generating file map:"), e);
    res.status(500).send("Server Error");
  }
});

app.use(
  "/src",
  express.static(SRC_DIR, {
    setHeaders: (res) => {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
    },
  })
);

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(
    chalk.cyan(`
===================================================
🌉  PLAYCANVAS LOCAL BRIDGE IS RUNNING
===================================================
📡 Local URL:   https://localhost:${PORT}
📂 Watching:    ${SRC_DIR}
---------------------------------------------------
Add '?local=true' to your PlayCanvas Launch URL
===================================================
    `)
  );
});