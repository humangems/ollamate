import fs from 'node:fs';
import path from "node:path";
import { ImportedNote } from '../src/lib/types';

type ImportCallback = (note: ImportedNote) => void;

export function readMdFiles(directory: string, withTitle=false, callback: ImportCallback) {
  // Read the contents of the directory
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(`Unable to read directory: ${err}`);
      return;
    }

    // Filter .md files and read each one
    files
      .filter((file) => path.extname(file) === '.md')
      .forEach((file) => {
        const filePath = path.join(directory, file);

        // Get file stats to check size
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error(`Unable to get stats of file ${file}: ${err}`);
            return;
          }

          // Check if file size is >= 100 bytes
          if (stats.size >= 20) {
            // Read and print the file contents
            fs.readFile(filePath, 'utf8', (err, data) => {
              if (err) {
                console.error(`Unable to read file ${file}: ${err}`);
                return;
              }

              // get file name from filePath
              const fileName = path.basename(file, path.extname(file));
              const unescapedFileName = decodeURIComponent(fileName);

              const importedNote: ImportedNote = {
                content: data,
                title: withTitle ? unescapedFileName : undefined,
                created_at: stats.birthtime.getTime(),
                updated_at: stats.mtime.getTime(),
              };
              callback(importedNote);
            });
          } else {
            console.log(`File ${file} is smaller than 100 bytes, skipping.`);
          }
        });
      });
  });
}
