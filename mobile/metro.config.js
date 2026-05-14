const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Treat .wasm as a binary asset, never a JS module to bundle.
config.resolver.assetExts.push("wasm");

// expo-sqlite's web build imports a .wasm file that isn't shipped with the npm package.
// We don't target web, so stub any .wasm import to an empty module. Keeps the
// require.context route scan + Node SSR bundle from blowing up on native dev.
const baseResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith(".wasm")) {
    return { type: "empty" };
  }
  return baseResolveRequest
    ? baseResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
