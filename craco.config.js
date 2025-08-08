module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find and modify the source-map-loader rule
      webpackConfig.module.rules.forEach(rule => {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach(use => {
            if (use.loader && use.loader.includes('source-map-loader')) {
              use.options = use.options || {};
              use.options.filterSourceMappingUrl = (relativeSourcePath, resourcePath) => {
                // Ignore source maps for skinview3d and skinview-utils packages
                if (resourcePath.includes('skinview3d') || resourcePath.includes('skinview-utils')) {
                  return false;
                }
                return true;
              };
            }
          });
        }
      });

      return webpackConfig;
    }
  }
};
