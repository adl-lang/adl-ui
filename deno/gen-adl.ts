import {
  genTypescript
} from "https://deno.land/x/adllang_tsdeno@v0.2/mod.ts";

async function main() {
  const adlDir = './adl';

  const tsadldir = "./src/adl-gen";

  await genTypescript({
    adlModules: [
      'common.strings',
      'common.ui',
      'common.time',
      'sys.types',
      'sys.adlast',
      'examples',
    ],
    searchPath: [
      adlDir
    ],

    tsStyle: "tsc",
    outputDir: tsadldir,
    runtimeDir: "runtime",
    includeRuntime: true,
    includeResolver: true,
    manifest: tsadldir + "/.adl-manifest",
    verbose: false,
  });
}

main()
  .catch((err) => {
    console.error("error in main", err);
  });
