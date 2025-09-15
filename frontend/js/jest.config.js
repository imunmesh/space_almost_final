module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};