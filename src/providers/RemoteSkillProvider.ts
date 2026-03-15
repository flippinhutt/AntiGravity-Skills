import * as vscode from 'vscode';
import { SkillItem } from '../models/SkillItem';

export class RemoteSkillProvider implements vscode.TreeDataProvider<SkillItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SkillItem | undefined | void> = new vscode.EventEmitter<SkillItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<SkillItem | undefined | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SkillItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SkillItem): Thenable<SkillItem[]> {
    if (element) {
        // We will implement fetching the github repo contents in Phase 2.2
        return Promise.resolve([
            new SkillItem('Loading...', undefined, 'loading', 'file', vscode.TreeItemCollapsibleState.None)
        ]);
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
