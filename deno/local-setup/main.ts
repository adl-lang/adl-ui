import * as packages from "./packages.ts";
import {
  checkManifest,
  forPlatform,
  getHostPlatform,
  Installable,
  writeEnvScript,
  writeManifest,
} from "./setuputils.ts";

const DENO = packages.deno("1.18.2");
const ADL = packages.adl("1.1.6");
const NODE = packages.nodejs("16.13.0");
const YARN = packages.yarn("1.22.15");

export async function main() {
  if (Deno.args.length != 1) {
    console.error("Usage: local-setup LOCALDIR");
    Deno.exit(1);
  }

  const platform = getHostPlatform();
  const localdir = Deno.args[0];

  let installs = [
    forPlatform(DENO, platform),
    forPlatform(ADL, platform),
    forPlatform(NODE, platform),
    YARN,
  ];

  installs = installs.filter(excludePackages());

  if (await checkManifest(installs, localdir)) {
    return;
  }

  for (const i of installs) {
    await i.install(localdir);
  }
  await writeEnvScript(installs, localdir);
  await writeManifest(installs, localdir);
}

function excludePackages() {
  const excludeRegex = Deno.env.get("LOCAL_ENV_EXCLUDE");
  if (!excludeRegex) {
    return (pkg: Installable) => {
      return true;
    };
  }
  return (pkg: Installable) => {
    return !pkg.manifestName.match(excludeRegex);
  };
}

main()
  .catch((err) => {
    console.error("error in main", err);
  });
