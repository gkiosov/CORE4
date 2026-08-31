module.exports = {
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/source/js/__tests__/setup/jest.setup.js'],
	testMatch: ['<rootDir>/source/js/__tests__/**/*.test.js'],
	testPathIgnorePatterns: [
		'/node_modules/',
		'<rootDir>/source/js/__tests__/setup/',
	],
	transform: {
		'^.+\.js$': 'babel-jest',
	},
	moduleNameMapper: {
		'\.(scss|css|sass)$': '<rootDir>/source/js/__tests__/setup/fileMock.js',
		'\.(png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf|eot)$': '<rootDir>/source/js/__tests__/setup/fileMock.js',
	},
	clearMocks: true,
	restoreMocks: true,
};