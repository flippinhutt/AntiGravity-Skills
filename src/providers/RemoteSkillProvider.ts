import * as vscode from 'vscode';
import { SkillItem } from '../models/SkillItem';
import { GitHubService } from '../services/GitHubService';

/**
 * TreeDataProvider for browsing remote Antigravity skills from GitHub.
 */
export class RemoteSkillProvider implements vscode.TreeDataProvider<SkillItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SkillItem | undefined | void> = new vscode.EventEmitter<SkillItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<SkillItem | undefined | void> = this._onDidChangeTreeData.event;
  private searchQuery: string = '';
  
  private githubService: GitHubService;

  constructor() {
      this.githubService = new GitHubService();
  }

  /**
   * Refreshes the tree view data.
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Sets a filter query and refreshes the tree.
   * 
   * @param query The search query to filter by.
   */
  setFilter(query: string): void {
      this.searchQuery = query.toLowerCase();
      this.refresh();
  }

  /**
   * Returns the TreeItem for the given element.
   * 
   * @param element The skill item.
   */
  getTreeItem(element: SkillItem): vscode.TreeItem {
    return element;
  }

  /**
   * Gets the children for the given element, or the top-level repositories if no element is provided.
   * 
   * @param element The optional parent skill item.
   */
  async getChildren(element?: SkillItem): Promise<SkillItem[]> {
    if (element) {
        const repoStr = element.githubOwnerRepo || element.fullPath.replace('github:', '');
        const subPath = element.githubPath || '';
        const contents = await this.githubService.getRepoContents(repoStr, subPath);
        
        return contents.map(item => {
           const skillItem = new SkillItem(
              item.name,
              item.type === 'dir' ? '(Directory)' : undefined,
              item.html_url,
              item.type === 'dir' ? 'skill' : 'file',
              item.type === 'dir' ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
           );
           skillItem.contextValue = item.type === 'dir' ? 'skill' : 'file';
           skillItem.githubOwnerRepo = repoStr;
           skillItem.githubPath = item.path;
           skillItem.downloadUrl = item.download_url || undefined;
           return skillItem;
        }).sort((a,b) => {
           const aLabel = a.label.toLowerCase();
           const bLabel = b.label.toLowerCase();

           // 1. SKILL.md always first
           if (aLabel === 'skill.md') return -1;
           if (bLabel === 'skill.md') return 1;

           // 2. Folders before files
           if (a.itemType === 'skill' && b.itemType === 'file') return -1;
           if (a.itemType === 'file' && b.itemType === 'skill') return 1;
           
           return a.label.localeCompare(b.label);
        });
    } else {
        return Promise.resolve(this.getTopLevelRepositories());
    }
  }

  private getTopLevelRepositories(): SkillItem[] {
    const config = vscode.workspace.getConfiguration('antigravity');
    const repos = config.get<string[]>('skillRepositories', []);
    
    let items = repos.map(repo => {
        const item = new SkillItem(
            repo,
            '(GitHub)',
            `github:${repo}`,
            'skill',
            vscode.TreeItemCollapsibleState.Collapsed
        );
        item.contextValue = 'repo';
        item.githubOwnerRepo = repo;
        return item;
    });

    if (this.searchQuery) {
        items = items.filter(i => i.label.toLowerCase().includes(this.searchQuery));
    }

    return items;
  }
}
