const path = require('path');

module.exports = {
  packagerConfig: {
    icon: path.join(__dirname, "assets", "icons", "win", "icon")//'assets/icons/win/icon' // no file extension required
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        "setupIcon": path.join(__dirname, "assets", "icons", "win", "icon.ico"),
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
