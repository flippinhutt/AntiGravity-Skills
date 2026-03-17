import * as vscode from 'vscode';
import * as path from 'path';

export class SkillItem extends vscode.TreeItem {
  public githubOwnerRepo?: string;
  public githubPath?: string;
  public downloadUrl?: string;

  constructor(
    public readonly label: string,
    public readonly description: string | undefined,
    public readonly fullPath: string,
    public readonly itemType: 'skill' | 'file',
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = this.fullPath;
    this.description = description;

    if (itemType === 'file') {
      this.iconPath = new vscode.ThemeIcon('file');
      this.command = {
        title: 'Open File',
        command: 'antigravity.openSkillFile',
        arguments: [this.fullPath, this],
      };
    } else {
      this.iconPath = new vscode.ThemeIcon('symbol-namespace');
    }
  }

  /**
   * Returns a plain object for webview consumption, avoiding circular references.
   */
  public toWebViewItem() {
    return {
      label: this.label,
      description: this.description,
      fullPath: this.fullPath,
      itemType: this.itemType,
      githubOwnerRepo: this.githubOwnerRepo,
      githubPath: this.githubPath,
      downloadUrl: this.downloadUrl
    };
  }
}
