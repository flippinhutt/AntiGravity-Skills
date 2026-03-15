import * as vscode from 'vscode';
import { SkillItem } from '../models/SkillItem';
import { GitHubService } from '../services/GitHubService';

export class RemoteSkillProvider implements vscode.TreeDataProvider<SkillItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SkillItem | undefined | void> = new vscode.EventEmitter<SkillItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<SkillItem | undefined | void> = this._onDidChangeTreeData.event;
  
  private githubService: GitHubService;

  constructor() {
      this.githubService = new GitHubService();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SkillItem): vscode.TreeItem {
    return element;
  }

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
           if(a.itemType === 'skill' && b.itemType === 'file') return -1;
           if(a.itemType === 'file' && b.itemType === 'skill') return 1;
           return a.label.localeCompare(b.label);
        });
    } else {
        return Promise.resolve(this.getTopLevelRepositories());
    }
  }

  private getTopLevelRepositories(): SkillItem[] {
    const config = vscode.workspace.getConfiguration('antigravity');
    const repos = config.get<string[]>('skillRepositories', []);
    
    return repos.map(repo => {
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
  }
}
