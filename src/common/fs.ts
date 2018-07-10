import * as Promise from 'bluebird';
import * as fs from 'fs';

declare module 'fs' {
  export function lstatAsync(path: PathLike): Promise<fs.Stats>;
  export function statAsync(path: PathLike): Promise<fs.Stats>;
  export function mkdirAsync(path: PathLike): Promise<void>;
  export function readdirAsync(
    path: PathLike,
    options?: {
      encoding: BufferEncoding | null
    } | BufferEncoding | undefined | null): Promise<string[]>;
  export function readFileAsync(
    path: PathLike | number,
    options?: { encoding?: null; flag?: string; } | undefined | null): Promise<Buffer>;
  export function writeFileAsync(
    path: PathLike | number,
    data: any,
    options?: {
      encoding?: string | null;
      mode?: number | string;
      flag?: string; } | string | undefined | null): Promise<void>;
}

export const asyncFs = Promise.promisifyAll(fs);
