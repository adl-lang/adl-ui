import {
  getAdlStdLibDir,
  globFiles,
  genTypescript
} from "https://deno.land/x/adllang_tsdeno@v0.1/mod.ts";

async function main() {
  const adlStdLibDir = await getAdlStdLibDir();
  const verbose = false;
  const sysAdlFiles = await globFiles(adlStdLibDir, "**/sys/*.adl");
  const adlDir = './adl';
  const adlFiles = await globFiles(adlDir, '**/*.adl');

  const tsadldir = "./src/adl-gen";

  await genTypescript({
    adlFiles: [
      ...sysAdlFiles,
      ...adlFiles,
    ],
    tsStyle: "tsc",
    outputDir: tsadldir,
    runtimeDir: "runtime",
    includeRuntime: true,
    searchPath: [adlDir],
    includeResolver: true,
    manifest: tsadldir + "/.adl-manifest",
    verbose,
  });
}

main()
  .catch((err) => {
    console.error("error in main", err);
  });
