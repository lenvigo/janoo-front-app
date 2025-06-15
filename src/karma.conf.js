module.exports = function (config) {
  config.set({
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-jasmine-html-reporter"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    client: { clearContext: false },
    reporters: ["progress", "kjhtml"],
    browsers: ["ChromeHeadless"],
    singleRun: false,
  });
};
