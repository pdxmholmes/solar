import * as path from 'path';
import { remote } from 'electron';
import * as glob from 'glob-promise';
import { asyncFs } from '../../common/fs';

export interface IStorageWritable {
  asWritable(): any;
}

class StorageService {
  public async getUserStoragePath(): Promise<string> {
    try {
      const storagePath = remote.getGlobal('userStoragePath');
      const stats = await asyncFs.statAsync(storagePath);
      if (!stats.isDirectory()) {
        await asyncFs.mkdirAsync(storagePath);
      }

      return storagePath;
    } catch (e) {
      console.error(e);
    }
  }

  public async load<T>(file: string): Promise<T> {
    try {
      const storagePath = await this.getUserStoragePath();
      const dataFilePath = path.join(storagePath, `${file}.json`);

      const stats = await asyncFs.statAsync(dataFilePath);
      if (!stats.isFile()) {
        return null;
      }

      const data = await asyncFs.readFileAsync(dataFilePath);
      const json = data.toString('utf-8');
      return JSON.parse(json) as T;
    } catch (e) {
      console.error(e);
    }
  }

  public async loadAll<T>(pattern: string): Promise<T[]> {
    try {
      const storagePath = await this.getUserStoragePath();
      const files = await glob(pattern, {
        cwd: storagePath,
        nodir: true
      });

      const names = files.map(file => path.basename(file, '.json'));
      return Promise.all(names.map(name => this.load<T>(name)));
    } catch (e) {
      console.error(e);
    }
  }

  public async save<T extends IStorageWritable>(name: string, data: T): Promise<void> {
    try {
      const storagePath = await this.getUserStoragePath();
      const dataFilePath = path.join(storagePath, `${name}.json`);

      const json = JSON.stringify(data.asWritable(), null, 2);
      await asyncFs.writeFileAsync(dataFilePath, json);
    } catch (e) {
      console.error(e);
    }
  }
}

export const storageService = new StorageService();
