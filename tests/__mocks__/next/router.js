module.exports = {
  useRouter: jest.fn(() => ({
    route: '/',
    pathname: '',
    query: {},
    isReady: true,
    asPath: '',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
  })),
};
