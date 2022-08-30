import {
  getAdlStdLibDir,
  globFiles,
} from "./adl-tools/utils/fs.ts";;
import { genTypescript } from "./adl-tools/gen-typescript.ts";

async function main() {
  const adlStdLibDir = await getAdlStdLibDir();
  const verbose = false;
  const sysAdlFiles = await globFiles(adlStdLibDir, "**/sys/*.adl");
  const exampleAdlFiles = await globFiles('./adl', '*.adl');

  const tsadldir = "./adl-ui/adl-gen";

  await genTypescript({
    adlFiles: [
      ...sysAdlFiles,
    ],
    tsStyle: "tsc",
    outputDir: tsadldir,
    runtimeDir: "runtime",
    includeRuntime: true,
    searchPath: [],
    includeResolver: true,
    manifest: tsadldir + "/.adl-manifest",
    verbose,
  });

  await genTypescript({
    adlFiles: [
      ...sysAdlFiles,
      ...exampleAdlFiles,
    ],
    tsStyle: "tsc",
    outputDir: "./adl-ui-storybook/src/adl-gen",
    runtimeDir: "runtime",
    includeRuntime: true,
    searchPath: [],
    includeResolver: true,
    manifest: "./adl-ui-storybook/src/adl-gen" + "/.adl-manifest",
    verbose,
  });

}

main()
  .catch((err) => {
    console.error("error in main", err);
  });
