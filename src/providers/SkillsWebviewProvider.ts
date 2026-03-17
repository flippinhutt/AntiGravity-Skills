import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { GitHubService } from '../services/GitHubService';
import { SkillItem } from '../models/SkillItem';

export class SkillsWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'antigravity.skills';

    private _view?: vscode.WebviewView;
    private _searchQuery: string = '';
    private _localSkills: SkillItem[] = [];
    private _remoteSkills: SkillItem[] = [];
    private _currentPath: { type: 'local' | 'remote', path: string, repo?: string } | null = null;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _type: 'local' | 'remote',
        private readonly _githubService: GitHubService
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'search':
                    this._searchQuery = data.value.toLowerCase();
                    this._updateView();
                    break;
                case 'refresh':
                    this.refresh();
                    break;
                case 'openItem':
                    if (data.item.itemType === 'skill' || data.item.description?.includes('(Directory)') ) {
                        this._drillDown(data.item);
                    } else {
                        vscode.commands.executeCommand('antigravity.openSkillFile', data.filePath, data.item);
                    }
                    break;
                case 'goBack':
                    this._goBack();
                    break;
                case 'installSkill':
                    vscode.commands.executeCommand('antigravity.installSkill', data.item);
                    break;
                case 'createSkill':
                    vscode.commands.executeCommand('antigravity.createSkill');
                    break;
            }
        });

        // Delay initial refresh to allow Antigravity services to initialize
        setTimeout(() => this.refresh(), 1000);
    }

    public refresh() {
        this._currentPath = null;
        if (this._view) {
            this._view.webview.postMessage({ type: 'loading' });
        }
        if (this._type === 'local') {
            this._loadLocalSkills();
        } else {
            this._loadRemoteSkills();
        }
    }

    private _updateView(loading: boolean = false) {
        if (this._view) {
            if (loading) {
                this._view.webview.postMessage({ type: 'loading' });
                return;
            }
            const items = this._type === 'local' ? this._localSkills : this._remoteSkills;
            const filteredItems = items
                .filter(item => item.label.toLowerCase().includes(this._searchQuery))
                .map(item => item.toWebViewItem());
            this._view.webview.postMessage({ 
                type: 'updateItems', 
                items: filteredItems,
                canGoBack: this._currentPath !== null
            });
        }
    }

    private async _drillDown(item: SkillItem) {
        this._updateView(true);
        if (this._type === 'local') {
            try {
                const entries = fs.readdirSync(item.fullPath, { withFileTypes: true });
                this._localSkills = entries.map(entry => {
                    const fullPath = path.join(item.fullPath, entry.name);
                    return new SkillItem(
                        entry.name,
                        entry.isDirectory() ? '(Directory)' : undefined,
                        fullPath,
                        entry.isDirectory() ? 'skill' : 'file',
                        entry.isDirectory() ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
                    );
                });
                this._currentPath = { type: 'local', path: item.fullPath };
            } catch (e) {
                console.error(e);
            }
        } else {
            const repo = item.githubOwnerRepo!;
            const repoPath = item.githubPath || '';
            try {
                const contents = await this._githubService.getRepoContents(repo, repoPath);
                this._remoteSkills = contents.map(ghItem => {
                    const skillItem = new SkillItem(
                        ghItem.name,
                        ghItem.type === 'dir' ? '(Directory)' : undefined,
                        ghItem.html_url,
                        ghItem.type === 'dir' ? 'skill' : 'file',
                        ghItem.type === 'dir' ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
                    );
                    skillItem.githubOwnerRepo = repo;
                    skillItem.githubPath = ghItem.path;
                    skillItem.downloadUrl = ghItem.download_url || undefined;
                    return skillItem;
                });
                this._currentPath = { type: 'remote', path: repoPath, repo: repo };
            } catch (e) {
                console.error(e);
            }
        }
        this._updateView();
    }

    private _goBack() {
        this.refresh();
    }

    private _loadLocalSkills() {
        const skills: SkillItem[] = [];
        const config = vscode.workspace.getConfiguration('antigravity');
        
        let globalPath = config.get<string>('customGlobalSkillsPath', '').trim();
        if (!globalPath) {
            globalPath = path.join(os.homedir(), '.gemini', 'antigravity', 'skills');
        } else if (globalPath.startsWith('~')) {
            globalPath = path.join(os.homedir(), globalPath.slice(1));
        }

        if (fs.existsSync(globalPath)) {
            skills.push(...this._readLocalDir(globalPath, undefined));
        }

        if (vscode.workspace.workspaceFolders) {
            for (const folder of vscode.workspace.workspaceFolders) {
                const localPath = path.join(folder.uri.fsPath, '.gemini', 'antigravity', 'skills');
                if (fs.existsSync(localPath)) {
                    skills.push(...this._readLocalDir(localPath, undefined));
                }
            }
        }

        this._localSkills = skills;
        this._updateView();
    }

    private _readLocalDir(skillsPath: string, description: string | undefined): SkillItem[] {
        const skills: SkillItem[] = [];
        const config = vscode.workspace.getConfiguration('antigravity');
        const hideInvalid = config.get<boolean>('hideInvalidSkills', false);
        
        try {
            const entries = fs.readdirSync(skillsPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const fullPath = path.join(skillsPath, entry.name);
                    const hasSkillMd = fs.existsSync(path.join(fullPath, 'SKILL.md'));

                    if (!hasSkillMd && hideInvalid) {
                        continue;
                    }

                    const item = new SkillItem(
                        entry.name,
                        hasSkillMd ? description : 'Invalid Skill (Missing SKILL.md)',
                        fullPath,
                        'skill',
                        hasSkillMd ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
                    );
                    skills.push(item);
                }
            }
        } catch (e) {
            console.error(e);
        }
        return skills;
    }

    private async _loadRemoteSkills() {
        const config = vscode.workspace.getConfiguration('antigravity');
        const repos = config.get<string[]>('skillRepositories', []);
        
        const skillPromises = repos.map(async repo => {
            const preferredPaths = ['.gemini/antigravity/skills', 'skills', ''];
            
            for (const subPath of preferredPaths) {
                try {
                    const contents = await this._githubService.getRepoContents(repo, subPath);
                    if (contents && contents.length > 0) {
                        // If we found a skills folder, return its items directly
                        if (subPath !== '') {
                            return contents.map(item => {
                                const skillItem = new SkillItem(
                                    item.name,
                                    undefined,
                                    item.html_url,
                                    item.type === 'dir' ? 'skill' : 'file',
                                    item.type === 'dir' ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
                                );
                                skillItem.githubOwnerRepo = repo;
                                skillItem.githubPath = item.path;
                                skillItem.downloadUrl = item.download_url || undefined;
                                return skillItem;
                            });
                        } else if (preferredPaths.indexOf(subPath) === preferredPaths.length - 1) {
                            // Root fallback: show the repo as a folder if no skills folder found
                            const repoItem = new SkillItem(
                                repo,
                                '(Repo Root)',
                                `github:${repo}`,
                                'skill',
                                vscode.TreeItemCollapsibleState.Collapsed
                            );
                            repoItem.githubOwnerRepo = repo;
                            repoItem.githubPath = '';
                            return [repoItem];
                        }
                    }
                } catch (e) {
                    // Ignore and try next path
                }
            }
            return [];
        });

        const results = await Promise.all(skillPromises);
        this._remoteSkills = results.flat();
        this._updateView();
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Antigravity Skills</title>
                <style>
                    :root {
                        --sidebar-padding: 12px;
                        --item-height: 28px;
                    }
                    body {
                        padding: 0;
                        color: var(--vscode-foreground);
                        font-family: var(--vscode-font-family);
                        overflow-x: hidden;
                    }
                    .header {
                        display: flex;
                        flex-direction: column;
                        position: sticky;
                        top: 0;
                        background: var(--vscode-sideBar-background);
                        z-index: 100;
                        border-bottom: 1px solid var(--vscode-sideBar-border);
                    }
                    .search-container {
                        padding: 8px var(--sidebar-padding);
                    }
                    .search-inner {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }
                    #search {
                        width: 100%;
                        padding: 6px 30px 6px 8px;
                        box-sizing: border-box;
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        outline: none;
                        font-size: 12px;
                        border-radius: 2px;
                    }
                    #search:focus {
                        border-color: var(--vscode-focusBorder);
                    }
                    .search-icon {
                        position: absolute;
                        right: 8px;
                        opacity: 0.5;
                        font-size: 14px;
                        cursor: default;
                    }
                    .toolbar {
                        display: flex;
                        align-items: center;
                        padding: 0 var(--sidebar-padding) 8px var(--sidebar-padding);
                        gap: 8px;
                    }
                    .tool-button {
                        cursor: pointer;
                        opacity: 0.7;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        background: var(--vscode-button-secondaryBackground);
                        color: var(--vscode-button-secondaryForeground);
                        padding: 2px 8px;
                        border-radius: 2px;
                    }
                    .tool-button:hover {
                        opacity: 1;
                        background: var(--vscode-button-secondaryHoverBackground);
                    }
                    .item-list {
                        list-style: none;
                        padding: 4px 0;
                        margin: 0;
                    }
                    .item {
                        padding: 0 var(--sidebar-padding);
                        height: var(--item-height);
                        line-height: var(--item-height);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        border-radius: 0;
                        font-size: 13px;
                        user-select: none;
                    }
                    .item:hover {
                        background: var(--vscode-list-hoverBackground);
                    }
                    .item:active {
                        background: var(--vscode-list-activeSelectionBackground);
                        color: var(--vscode-list-activeSelectionForeground);
                    }
                    .item-icon {
                        margin-right: 6px;
                        width: 16px;
                        text-align: center;
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .item-label {
                        flex: 1;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .item-description {
                        font-size: 11px;
                        opacity: 0.6;
                        margin-left: 8px;
                        font-style: italic;
                    }
                    .loader {
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        opacity: 0.7;
                    }
                    .no-results {
                        padding: 20px;
                        text-align: center;
                        opacity: 0.5;
                        font-size: 12px;
                    }
                </style>
			</head>
			<body>
				<div class="header">
                    <div class="search-container">
                        <div class="search-inner">
                            <input type="text" id="search" placeholder="Filter skills..." autocomplete="off" />
                            <span class="search-icon">🔍</span>
                        </div>
                    </div>
                    <div id="toolbar" class="toolbar" style="display: none;">
                        <span id="back-btn" class="tool-button">← Back</span>
                    </div>
				</div>
				<div id="content">
                    <div class="loader">Loading skills...</div>
                </div>

				<script>
					const vscode = acquireVsCodeApi();
					const searchInput = document.getElementById('search');
					const contentDiv = document.getElementById('content');
                    const toolbar = document.getElementById('toolbar');
                    const backBtn = document.getElementById('back-btn');

					searchInput.addEventListener('input', (e) => {
						vscode.postMessage({ type: 'search', value: e.target.value });
					});

                    backBtn.addEventListener('click', () => {
                        vscode.postMessage({ type: 'goBack' });
                    });

					window.addEventListener('message', event => {
						const message = event.data;
						switch (message.type) {
                            case 'loading':
                                contentDiv.innerHTML = '<div class="loader">Loading...</div>';
                                break;
							case 'updateItems':
								updateItems(message.items, message.canGoBack);
								break;
						}
					});

					function updateItems(items, canGoBack) {
                        toolbar.style.display = canGoBack ? 'flex' : 'none';

						if (items.length === 0) {
                            contentDiv.innerHTML = '<div class="no-results">No skills found</div>';
                            return;
                        }

                        const ul = document.createElement('ul');
                        ul.className = 'item-list';
                        
						items.forEach(item => {
							const li = document.createElement('li');
							li.className = 'item';
                            
                            let icon = '📄';
                            if (item.itemType === 'skill' || item.description?.includes('(Directory)') || item.description?.includes('(Repo Root)')) icon = '📁';
                            if (item.label.toLowerCase().includes('skill.md')) icon = '🛡️';

							li.innerHTML = \`
								<span class="item-icon">\${icon}</span>
								<span class="item-label">\${item.label}</span>
								<span class="item-description">\${item.description || ''}</span>
							\`;
							li.addEventListener('click', () => {
								vscode.postMessage({ 
                                    type: 'openItem',
                                    filePath: item.fullPath,
                                    item: item
                                });
							});
							ul.appendChild(li);
						});
                        contentDiv.innerHTML = '';
                        contentDiv.appendChild(ul);
					}
				</script>
			</body>
			</html>`;
    }
}
