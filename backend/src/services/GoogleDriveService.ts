import { google, drive_v3 } from 'googleapis';
import path from 'path';
import * as fs from 'fs';
import { Readable } from 'stream';

export class GoogleDriveService {
    private drive: drive_v3.Drive;

    constructor(keyFilePath: string) {
        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        this.drive = google.drive({ version: 'v3', auth });
    }

    async listCSVFiles(folderId: string): Promise<drive_v3.Schema$File[]> {
        try {
            const allFiles: drive_v3.Schema$File[] = [];
            let pageToken: string | undefined = undefined;

            do {
                const res: any = await this.drive.files.list({
                    q: `'${folderId}' in parents and mimeType = 'text/csv' and trashed = false`,
                    fields: 'nextPageToken, files(id, name, mimeType, size)',
                    pageToken,
                });

                allFiles.push(...(res.data.files || []));
                pageToken = res.data.nextPageToken;
            } while (pageToken);

            return allFiles;
        } catch (error: any) {
            console.error(`Error listing files from folder ${folderId}:`, error.message);
            throw error;
        }
    }

    /**
     * Download a file's content as a string
     */
    async downloadFileContent(fileId: string): Promise<string> {
        try {
            const res = await this.drive.files.get(
                { fileId, alt: 'media' },
                { responseType: 'stream' }
            );

            const stream = res.data as Readable;
            return new Promise((resolve, reject) => {
                let content = '';
                stream.on('data', (chunk) => {
                    content += chunk;
                });
                stream.on('end', () => {
                    resolve(content);
                });
                stream.on('error', (err) => {
                    reject(err);
                });
            });
        } catch (error: any) {
            console.error(`Error downloading file ${fileId}:`, error.message);
            throw error;
        }
    }

    async listCSVFilesRecursive(folderId: string): Promise<drive_v3.Schema$File[]> {
        const allFiles: drive_v3.Schema$File[] = [];
        await this.walkCSVFiles(folderId, async (file) => {
            allFiles.push(file);
        });
        return allFiles;
    }

    /**
     * Walk through folders and call a callback for each CSV file found
     */
    async walkCSVFiles(
        folderId: string,
        onFile: (file: drive_v3.Schema$File, path: string[]) => Promise<void>,
        currentPath: string[] = []
    ): Promise<void> {
        let pageToken: string | undefined = undefined;

        try {
            do {
                const res: any = await this.drive.files.list({
                    q: `'${folderId}' in parents and trashed = false`,
                    fields: 'nextPageToken, files(id, name, mimeType, size)',
                    pageToken,
                });

                const files = res.data.files || [];
                for (const file of files) {
                    if (file.mimeType === 'application/vnd.google-apps.folder') {
                        const folderName = file.name || 'unknown';
                        const newPath = [...currentPath, folderName];
                        console.log(`📁 Entering folder: ${newPath.join(' / ')}`);
                        await this.walkCSVFiles(file.id!, onFile, newPath);
                    } else if (file.mimeType === 'text/csv' || file.name?.endsWith('.csv')) {
                        await onFile(file, currentPath);
                    }
                }
                pageToken = res.data.nextPageToken;
            } while (pageToken);
        } catch (error: any) {
            console.error(`Error walking folder ${folderId}:`, error.message);
            throw error;
        }
    }

    /**
     * Get folder ID by name (optional helper)
     */
    async getFolderIdByName(name: string): Promise<string | null> {
        try {
            const res = await this.drive.files.list({
                q: `mimeType = 'application/vnd.google-apps.folder' and name = '${name}' and trashed = false`,
                fields: 'files(id, name)',
            });

            const files = res.data.files;
            return files && files.length > 0 ? files[0].id! : null;
        } catch (error: any) {
            console.error(`Error finding folder ${name}:`, error.message);
            throw error;
        }
    }
}
