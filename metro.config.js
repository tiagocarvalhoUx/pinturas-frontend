const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force CJS builds to avoid import.meta issues on web
config.resolver.unstable_enablePackageExports = false;
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'socket.io-client': path.resolve(
    __dirname,
    'node_modules/socket.io-client/dist/socket.io.js'
  ),
};

module.exports = config;
