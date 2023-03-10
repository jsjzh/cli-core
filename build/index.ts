import esbuild from "esbuild";
import path from "node:path";

esbuild.build({
  entryPoints: ["src/index.ts"],
  outfile: "lib/index.js",
  platform: "node",
  target: "node10",
  format: "cjs",
  color: true,
  bundle: true,
  minify: true,
  alias: {
    "@": path.resolve(process.cwd(), "src"),
  },
});
