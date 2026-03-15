import * as vscode from 'vscode';

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

    /**
     * Gets a GitHub Token from VSCode's built-in authentication provider.
     */
    async getToken(createIfNone: boolean = false): Promise<string | undefined> {
        try {
            const session = await vscode.authentication.getSession('github', ['repo'], { createIfNone });
            return session?.accessToken;
        } catch (error) {
            console.error('Failed to get GitHub session:', error);
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

        const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Antigravity-Skill-Manager-VSCode'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`GitHub API Error (${response.status}): ${text}`);
            }

            const data = await response.json() as GitHubContent | GitHubContent[];
            
            // GitHub contents API returns an array for directories, and a single object for a file.
            // Since we're asking for the root (or a folder), we expect an array.
            return Array.isArray(data) ? data : [data];
            
        } catch (error) {
            console.error(`Error fetching contents for ${ownerRepo}:`, error);
            vscode.window.showErrorMessage(`Failed to fetch remote skills from ${ownerRepo}. See extension logs.`);
            return [];
        }
    }
}
