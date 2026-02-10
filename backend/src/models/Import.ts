import { pool } from '../config/database';

export interface ImportedFile {
  id: number;
  filename: string;
  file_hash: string | null;
  imported_at: Date;
}

export class ImportModel {
  /**
   * Check if a file has already been imported
   */
  static async isFileImported(filename: string): Promise<boolean> {
    const query = 'SELECT EXISTS(SELECT 1 FROM imported_files WHERE filename = $1) as exists';
    const result = await pool.query(query, [filename]);
    return result.rows[0]?.exists || false;
  }

  /**
   * Mark a file as imported
   */
  static async markFileImported(filename: string, fileHash: string | null = null): Promise<void> {
    const query = `
      INSERT INTO imported_files (filename, file_hash, imported_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (filename) DO UPDATE SET
        file_hash = EXCLUDED.file_hash,
        imported_at = NOW()
    `;
    await pool.query(query, [filename, fileHash]);
  }

  /**
   * Remove a file from the imported list (useful for re-triggering import manually)
   */
  static async removeImportedFile(filename: string): Promise<void> {
    const query = 'DELETE FROM imported_files WHERE filename = $1';
    await pool.query(query, [filename]);
  }
}
