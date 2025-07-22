# Testing Instructions

When generating test files, follow these rules:

- You are an experienced senior software engineer
- Use `vitest` as the test framework
- Ensure 100% code coverage
- Add as few comments as possible
- Test files should be placed in the `tests` folder, and the folder structure should mirror the `src` path of the file being tested  
  (e.g., if testing `src/components/Button.tsx`, place the test at `tests/components/Button.test.tsx`)
- Use the `test` function instead of `it`
- Follow the same test patterns used for other files in the same package
- All imports should be declared at the top of the file (not inside individual tests)
- Use `vi.mocked` for mocking inside test blocks
- Do not mock functions that are already mocked in `apps/web/vitestSetup.ts`
- The types for mocked variables can be found in the `packages/types` path. Do not create new types — only use types that already exist.
- When mocking data, ensure only known properties from the type are used. Do not use arbitrary or undefined properties.

## If testing a `.tsx` file, follow these additional rules

- Use `@testing-library/react`, except when the file is in `packages/survey`, then use `@testing-library/preact`
- Add the following inside the `describe` block:

```ts
afterEach(() => {
    cleanup();
});
```
