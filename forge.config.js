const path = require('path');

module.exports = {
  packagerConfig: {
    packageManager: "npm",
    icon: path.join(__dirname, "assets", "icons", "win", "logo-OFGUI"), // no file extension required
    asar:  true,
    overwrite: true,
    ignore: [
        ".gitignore",
        "db.sqlite",
        "Compiler.iss"
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        "setupIcon": path.join(__dirname, "assets", "icons", "win", "icon.ico"),
      },
      asar:  true,
      overwrite: true,
      ignore: [
          ".gitignore"
      ]
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
