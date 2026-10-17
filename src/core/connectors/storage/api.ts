// Raw key/value storage shared by every app opened in ProtoShell. Do not use it directly in
// modules: use useModuleStorage() / useStoredState(), which prefix keys with appId.moduleId.
export interface StorageApi {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  /** All keys starting with `prefix`. */
  keys(prefix?: string): Promise<string[]>;
}
