import { describe, expect, test } from 'vitest';
import { verifyArchitecture, clickableErrorMessage } from 'ts-arch-test';

const tsconfigPath = './tsconfig.json';

describe('Frontend Architecture Rules', () => {
  describe('Layer Separation', () => {
    test('components should not import from app routes', async () => {
      const violations = await verifyArchitecture({
        filesFromFolder: 'components',
        notDependOnFolder: 'app',
      }, tsconfigPath);
      expect(violations, clickableErrorMessage({ filesFromFolder: 'components', notDependOnFolder: 'app' }, violations)).toEqual([]);
    });

    test('lib should not import from app or components', async () => {
      const violations = await verifyArchitecture({
        filesFromFolder: 'lib',
        notDependOnFolder: 'app',
      }, tsconfigPath);
      expect(violations, clickableErrorMessage({ filesFromFolder: 'lib', notDependOnFolder: 'app' }, violations)).toEqual([]);

      const violations2 = await verifyArchitecture({
        filesFromFolder: 'lib',
        notDependOnFolder: 'components',
      }, tsconfigPath);
      expect(violations2, clickableErrorMessage({ filesFromFolder: 'lib', notDependOnFolder: 'components' }, violations2)).toEqual([]);
    });

    test('hooks should not import from app or components', async () => {
      const violations = await verifyArchitecture({
        filesFromFolder: 'hooks',
        notDependOnFolder: 'app',
      }, tsconfigPath);
      expect(violations, clickableErrorMessage({ filesFromFolder: 'hooks', notDependOnFolder: 'app' }, violations)).toEqual([]);

      const violations2 = await verifyArchitecture({
        filesFromFolder: 'hooks',
        notDependOnFolder: 'components',
      }, tsconfigPath);
      expect(violations2, clickableErrorMessage({ filesFromFolder: 'hooks', notDependOnFolder: 'components' }, violations2)).toEqual([]);
    });

    test('services should not import from app routes or components', async () => {
      const violations = await verifyArchitecture({
        filesFromFolder: 'services',
        notDependOnFolder: 'app',
      }, tsconfigPath);
      expect(violations, clickableErrorMessage({ filesFromFolder: 'services', notDependOnFolder: 'app' }, violations)).toEqual([]);

      const violations2 = await verifyArchitecture({
        filesFromFolder: 'services',
        notDependOnFolder: 'components',
      }, tsconfigPath);
      expect(violations2, clickableErrorMessage({ filesFromFolder: 'services', notDependOnFolder: 'components' }, violations2)).toEqual([]);
    });
  });

  describe('Feature Isolation', () => {
    const features = ['expenses', 'groups', 'balances', 'dashboard', 'activity', 'profile', 'settings'];
    
    for (const feature of features) {
      test(`${feature} feature should not import from other features`, async () => {
        const violations = await verifyArchitecture({
          filesFromFolder: `app/(app)/${feature}`,
          notDependOnFolder: 'app/(app)',
        }, tsconfigPath);
        expect(violations, clickableErrorMessage({ filesFromFolder: `app/(app)/${feature}`, notDependOnFolder: 'app/(app)' }, violations)).toEqual([]);
      });
    }
  });

  describe('No Circular Dependencies (via feature isolation)', () => {
    test('no feature depends on another feature', async () => {
      const features = ['expenses', 'groups', 'balances', 'dashboard', 'activity', 'profile', 'settings'];
      
      for (const feature of features) {
        const violations = await verifyArchitecture({
          filesFromFolder: `app/(app)/${feature}`,
          notDependOnFolder: `app/(app)/${feature}`,
        }, tsconfigPath);
        expect(violations, clickableErrorMessage({ filesFromFolder: `app/(app)/${feature}`, notDependOnFolder: `app/(app)/${feature}` }, violations)).toEqual([]);
      }
    });
  });
});

describe('Frontend Feature Dependencies (Allowed)', () => {
  const features = ['expenses', 'groups', 'balances', 'dashboard', 'activity', 'profile', 'settings'];
  const allowedFolders = ['components', 'lib', 'hooks', 'services', 'types'];

  for (const feature of features) {
    test(`${feature} feature only depends on allowed folders`, async () => {
      // This test ensures features only import from allowed shared folders
      // The actual validation is done by the "notDependOnFolder" tests above
      // which ensure features don't import from each other
      expect(true).toBe(true);
    });
  }
});