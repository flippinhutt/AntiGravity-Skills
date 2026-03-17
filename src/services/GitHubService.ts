import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface GitHubContent {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string | null;
    type: 'file' | 'dir' | 'symlink' | 'submodule';
    _links: {
        self: string;
        git: string;
        html: string;
    };
}

export class GitHubService {
    static readonly GITHUB_API_URL = 'https://api.github.com';
    static readonly SESSION_OPTIONS: vscode.AuthenticationGetSessionOptions = { createIfNone: false };

    constructor(private readonly _storage?: vscode.Memento) {}

    /**
     * Gets a GitHub Token from VSCode's built-in authentication provider.
     */
    async getToken(createIfNone: boolean = false, retries: number = 3): Promise<string | undefined> {
        try {
            const session = await vscode.authentication.getSession('github', ['repo'], { createIfNone });
            return session?.accessToken;
        } catch (error: any) {
            if (error?.message?.includes('initialized first')) {
                if (retries > 0) {
                    console.warn(`Antigravity services not yet ready (retrying in 500ms... ${retries} left):`, error.message);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return this.getToken(createIfNone, retries - 1);
                }
                console.warn('Antigravity services failed to initialize after retries:', error.message);
            } else {
                console.error('Failed to get GitHub session:', error);
            }
            return undefined;
        }
    }

    /**
     * Fetches the root contents of a given GitHub repository.
     * @param ownerRepo String in the format "owner/repo"
     */
    async getRepoContents(ownerRepo: string, path: string = ''): Promise<GitHubContent[]> {
        const token = await this.getToken();
        const url = `${GitHubService.GITHUB_API_URL}/repos/${ownerRepo}/contents/${path}`;

        const cacheKey = `github-cache:${ownerRepo}:${path}`;
        const cachedData = this._storage?.get<{ etag: string, data: GitHubContent[] }>(cacheKey);

        const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Antigravity-Skill-Manager-VSCode'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (cachedData?.etag) {
            headers['If-None-Match'] = cachedData.etag;
        }

        try {
            const response = await fetch(url, { headers });
            
            if (response.status === 304 && cachedData) {
                console.log(`Cache hit for ${url}`);
                return cachedData.data;
            }

            if (!response.ok) {
                const text = await response.text();
                // Don't log 404s as errors, as they are often expected during fallback probing
                if (response.status !== 404) {
                    console.error(`GitHub API Error (${response.status}) fetching ${url}: ${text}`);
                }
                throw new Error(`GitHub API Error (${response.status}): ${text}`);
            }

            const data = await response.json() as GitHubContent | GitHubContent[];
            const result = Array.isArray(data) ? data : [data];

            const etag = response.headers.get('ETag');
            if (etag && this._storage) {
                await this._storage.update(cacheKey, { etag, data: result });
            }
            
            return result;
            
        } catch (error) {
            // Only log if it's not a standard 404 (which we throw above)
            if (!(error instanceof Error && error.message.includes('Error (404)'))) {
                console.error(`Error fetching contents for ${ownerRepo}:`, error);
            }
            
            // If API fails but we have cached data, return it as fallback
            if (cachedData) {
                return cachedData.data;
            }
            return [];
        }
    }

    /**
     * Recursively downloads a folder from GitHub.
     */
    async downloadFolder(ownerRepo: string, folderPath: string, targetLocalDir: string): Promise<void> {
        const contents = await this.getRepoContents(ownerRepo, folderPath);
        
        if (!fs.existsSync(targetLocalDir)) {
             fs.mkdirSync(targetLocalDir, { recursive: true });
        }

        const token = await this.getToken();
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        for (const item of contents) {
            const itemLocalPath = path.join(targetLocalDir, item.name);
            
            if (item.type === 'dir') {
                 await this.downloadFolder(ownerRepo, item.path, itemLocalPath);
            } else if (item.type === 'file' && item.download_url) {
                 try {
                     const response = await fetch(item.download_url, { headers });
                     if (!response.ok) {
                         throw new Error(`Failed to download ${item.download_url}: ${response.statusText}`);
                     }
                     const arrayBuffer = await response.arrayBuffer();
                     const buffer = Buffer.from(arrayBuffer);
                     fs.writeFileSync(itemLocalPath, buffer);
                 } catch (e: any) {
                     console.error(`Error downloading file ${item.name}:`, e);
                     vscode.window.showErrorMessage(`Failed to download file ${item.name}: ${e.message}`);
                 }
            }
        }
    }
}
