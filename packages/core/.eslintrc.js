module.exports = {
    extends: './../../.eslintrc',
    parserOptions: {
        ecmaVersion: 2019,
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module'
    }
};
