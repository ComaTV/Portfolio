const path = require('path');
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Helper: recursively traverse rules to find source-map-loader usages
      const traverseRules = (rules) => {
        if (!Array.isArray(rules)) return;
        rules.forEach((rule) => {
          // CRA nests rules under oneOf and may have arrays
          if (rule.oneOf) traverseRules(rule.oneOf);
          if (Array.isArray(rule.rules)) traverseRules(rule.rules);

          const excludePkgs = [
            /node_modules[\\\/]skinview3d[\\\/]/,
            /node_modules[\\\/]skinview-utils[\\\/]/,
          ];

          // If the rule itself is source-map-loader
          if (
            (typeof rule.loader === 'string' && rule.loader.includes('source-map-loader')) ||
            (Array.isArray(rule.use) && rule.use.some((u) => typeof u === 'string' ? u.includes('source-map-loader') : (u && u.loader && u.loader.includes('source-map-loader'))))
          ) {
            // Exclude problematic packages entirely from source-map-loader
            rule.exclude = Array.isArray(rule.exclude)
              ? [...rule.exclude, ...excludePkgs]
              : rule.exclude
              ? [rule.exclude, ...excludePkgs]
              : excludePkgs;
          }
        });
      };

      if (webpackConfig && webpackConfig.module && Array.isArray(webpackConfig.module.rules)) {
        traverseRules(webpackConfig.module.rules);
      }

      // As a safety net, silence residual source map warnings coming from these modules
      const ignoreFn = (warning) => {
        // Webpack 5 warning objects often have 'message' and 'module'
        const msg = String(warning && (warning.message || warning)).toLowerCase();
        const mod = String(warning && warning.module && warning.module.resource || '').toLowerCase();
        return (
          (msg.includes('failed to parse source map') || msg.includes('source map')) &&
          (mod.includes('skinview3d') || mod.includes('skinview-utils') || msg.includes('skinview3d') || msg.includes('skinview-utils'))
        );
      };

      webpackConfig.ignoreWarnings = Array.isArray(webpackConfig.ignoreWarnings)
        ? [...webpackConfig.ignoreWarnings, ignoreFn]
        : [ignoreFn];

      // Ensure a single instance of three is used across all packages
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {}),
        // Force Three.js to ESM build (exact match) to ensure named exports are available
        'three$': path.resolve(__dirname, 'node_modules/three/build/three.module.js'),
        // Ensure deep imports to examples resolve (required by skinview3d)
        'three/examples/jsm': path.resolve(__dirname, 'node_modules/three/examples/jsm'),
        // Explicit aliases for specific example modules referenced by skinview3d
        'three/examples/jsm/controls/OrbitControls.js': path.resolve(__dirname, 'node_modules/three/examples/jsm/controls/OrbitControls.js'),
        'three/examples/jsm/postprocessing/EffectComposer.js': path.resolve(__dirname, 'node_modules/three/examples/jsm/postprocessing/EffectComposer.js'),
        'three/examples/jsm/postprocessing/Pass.js': path.resolve(__dirname, 'node_modules/three/examples/jsm/postprocessing/Pass.js'),
        'three/examples/jsm/postprocessing/RenderPass.js': path.resolve(__dirname, 'node_modules/three/examples/jsm/postprocessing/RenderPass.js'),
        'three/examples/jsm/postprocessing/ShaderPass.js': path.resolve(__dirname, 'node_modules/three/examples/jsm/postprocessing/ShaderPass.js'),
        'three/examples/jsm/shaders/FXAAShader.js': path.resolve(__dirname, 'node_modules/three/examples/jsm/shaders/FXAAShader.js'),
        // Workarounds for ESM fully specified resolution issues with zustand
        // Use exact-match aliases to ensure subpath requests are redirected precisely
        'zustand/vanilla$': path.resolve(__dirname, 'node_modules/zustand/esm/vanilla.mjs'),
        'zustand/vanilla': path.resolve(__dirname, 'node_modules/zustand/esm/vanilla.mjs'),
        'zustand/traditional$': path.resolve(__dirname, 'node_modules/zustand/esm/traditional.mjs'),
        'zustand$': path.resolve(__dirname, 'node_modules/zustand/esm/index.mjs'),
      };

      // Ensure .mjs is resolvable by default
      webpackConfig.resolve.extensions = Array.from(new Set([
        '.mjs',
        ...((webpackConfig.resolve.extensions) || ['.js', '.json', '.jsx', '.ts', '.tsx'])
      ]));

      // Prefer ESM/module fields when resolving packages
      webpackConfig.resolve.mainFields = [
        'browser',
        'module',
        'esm',
        'main',
      ];
      webpackConfig.resolve.conditionNames = Array.from(new Set([
        ...((webpackConfig.resolve.conditionNames) || []),
        'import',
        'module',
        'browser',
      ]));

      // Remove CRA's ModuleScopePlugin to allow absolute-path aliases to node_modules
      if (webpackConfig.resolve && Array.isArray(webpackConfig.resolve.plugins)) {
        webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
          (p) => !(p && p.constructor && p.constructor.name === 'ModuleScopePlugin')
        );
      }

      // Allow extensionless ESM imports (e.g., 'zustand/vanilla') by disabling fullySpecified for JS modules
      // This is safe and commonly used with packages publishing ESM paths without explicit extensions
      webpackConfig.module = webpackConfig.module || {};
      webpackConfig.module.rules = webpackConfig.module.rules || [];
      webpackConfig.module.rules.unshift({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });

      return webpackConfig;
    }
  }
};
