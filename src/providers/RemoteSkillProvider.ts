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
        // Assume `element` is a repository item, passing its `label` format: owner/repo
        const repoStr = element.label;
        const contents = await this.githubService.getRepoContents(repoStr);
        
        return contents.map(item => {
           return new SkillItem(
              item.name,
              item.type === 'dir' ? '(Directory)' : undefined,
              item.html_url, // For remote, the payload might be the URL rather than local path
              item.type === 'dir' ? 'skill' : 'file',
              item.type === 'dir' ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
           );
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
        return new SkillItem(
            repo,
            '(GitHub)',
            `github:${repo}`,
            'skill',
            vscode.TreeItemCollapsibleState.Collapsed
        );
    });
  }
}
