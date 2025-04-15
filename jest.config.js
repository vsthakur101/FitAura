module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.js',           // adjust to your source directory
        '!src/**/index.js',      // exclude boilerplate
        '!src/**/*.test.js'      // exclude test files themselves
    ],
    coverageReporters: ['text', 'lcov', 'html'], // CLI, lcov, browser-friendly
};
