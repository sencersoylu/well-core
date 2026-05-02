const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so changes in packages/shared trigger reload.
config.watchFolders = [workspaceRoot];

// Resolve dependencies from monorepo root + this app's node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.disableHierarchicalLookup = true;

// Hono ships its client under "hono/client" with a custom export map that
// Metro 0.82+ resolves correctly out of the box. Forcing unstable_enablePackageExports
// guarantees subpath imports work.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
