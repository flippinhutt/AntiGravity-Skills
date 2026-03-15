import * as vscode from 'vscode';
import * as path from 'path';

export class SkillItem extends vscode.TreeItem {
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
        arguments: [this.fullPath],
      };
    } else {
      this.iconPath = new vscode.ThemeIcon('symbol-namespace');
    }
  }
}
