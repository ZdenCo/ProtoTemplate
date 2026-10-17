import appConfig from '@app/app.config';
import appComposition from '@app/app.composition';

import type { AppConfig } from '../define';
import type { Composition } from '../modules/composition-types';

export const config: AppConfig = appConfig;
export const composition: Composition = appComposition;

/** Storage prefix for a module ('<appId>.<moduleId>.') or for core ('<appId>.__core.'). */
export function storagePrefix(moduleId = '__core'): string {
  return `${config.id}.${moduleId}.`;
}
