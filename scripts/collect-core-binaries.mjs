import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = new URL("../dist", import.meta.url);
const packageJson = JSON.parse(
  readFileSync(
    new URL("../node_modules/@statsig/statsig-node-core/package.json", import.meta.url),
    "utf8"
  )
);

const binaryPackages = Object.entries(packageJson.optionalDependencies ?? {});
const tempDir = mkdtempSync(join(tmpdir(), "statsig-core-binaries-"));
const npmCacheDir = join(tempDir, "npm-cache");
const repoRoot = fileURLToPath(new URL("../", import.meta.url));

try {
  rmSync(new URL("../dist/ip_supalite.js", import.meta.url), { force: true });

  for (const file of readdirSync(distDir)) {
    if (file.startsWith("statsig-node-core.") && file.endsWith(".node")) {
      rmSync(new URL(`../dist/${file}`, import.meta.url));
    }
  }

  for (const [packageName, version] of binaryPackages) {
    const packDir = join(tempDir, packageName.replaceAll("/", "__"));
    const extractDir = join(packDir, "extract");
    mkdirSync(extractDir, { recursive: true });

    const tarballName = execFileSync(
      "npm",
      [
        "pack",
        "--silent",
        "--pack-destination",
        packDir,
        `${packageName}@${version}`,
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          npm_config_cache: npmCacheDir,
        },
      }
    ).trim();
    const tarballPath = join(packDir, tarballName);

    execFileSync("tar", ["-xzf", tarballPath, "-C", extractDir]);

    const binaryName = readdirSync(join(extractDir, "package")).find((file) =>
      file.endsWith(".node")
    );
    if (!binaryName) {
      throw new Error(`No native binary found in ${packageName}@${version}`);
    }

    copyFileSync(
      join(extractDir, "package", binaryName),
      new URL(`../dist/${basename(binaryName)}`, import.meta.url)
    );
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
