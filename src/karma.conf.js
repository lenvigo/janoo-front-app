module.exports = function (config) {
  config.set({
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-jasmine-html-reporter"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    browsers: ["ChromeHeadlessCI"],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--remote-debugging-port=9222",
        ],
      },
    },
    client: { clearContext: false },
    reporters: ["progress", "kjhtml"],
    browsers: ["ChromeHeadless"],
    singleRun: false,
  });
};
