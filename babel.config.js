module.exports = {
    presets: [
      '@babel/preset-env',   // Compiles ES6+ syntax to compatible JavaScript
      '@babel/preset-react'  // Compiles JSX syntax
    ],
    plugins: [
      '@babel/plugin-transform-modules-commonjs' // Ensures module syntax is handled for Jest
    ]
  };
  