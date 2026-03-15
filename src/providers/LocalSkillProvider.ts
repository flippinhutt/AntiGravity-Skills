import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { SkillItem } from '../models/SkillItem';

export class LocalSkillProvider implements vscode.TreeDataProvider<SkillItem> {
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
      if (element.itemType === 'skill') {
         return Promise.resolve(this.getFilesInSkill(element.fullPath));
      } else {
          return Promise.resolve([]);
      }
    } else {
      return Promise.resolve(this.getTopLevelSkills());
    }
  }

  private getTopLevelSkills(): SkillItem[] {
    const skills: SkillItem[] = [];
    
    // 1. Check Global
    const globalPath = path.join(os.homedir(), '.gemini', 'antigravity', 'skills');
    if (this.pathExists(globalPath)) {
        skills.push(...this.readSkillDirectories(globalPath, '(Global)'));
    }

    // 2. Check Workspaces
    if (vscode.workspace.workspaceFolders) {
        for (const folder of vscode.workspace.workspaceFolders) {
            const localPath = path.join(folder.uri.fsPath, '.gemini', 'antigravity', 'skills');
            if (this.pathExists(localPath)) {
                 skills.push(...this.readSkillDirectories(localPath, '(Workspace)'));
            }
        }
    }

    return skills.sort((a, b) => a.label.localeCompare(b.label));
  }

  private readSkillDirectories(skillsPath: string, description: string): SkillItem[] {
      const skills: SkillItem[] = [];
      const entries = fs.readdirSync(skillsPath, { withFileTypes: true });
      for (const entry of entries) {
          if (entry.isDirectory()) {
              const fullPath = path.join(skillsPath, entry.name);
              const hasSkillMd = fs.existsSync(path.join(fullPath, 'SKILL.md'));

              const item = new SkillItem(
                  entry.name,
                  hasSkillMd ? description : 'Invalid Skill (Missing SKILL.md)',
                  fullPath,
                  'skill',
                  hasSkillMd ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
              );

              if (!hasSkillMd) {
                  item.iconPath = new vscode.ThemeIcon('error');
                  item.contextValue = 'invalid-skill';
                  item.command = {
                      title: 'Show Error',
                      command: 'antigravity.showInvalidSkillError',
                      arguments: [entry.name],
                  };
              } else {
                  item.contextValue = 'skill';
              }

              skills.push(item);
          }
      }
      return skills;
  }

  private getFilesInSkill(skillPath: string): SkillItem[] {
      const children: SkillItem[] = [];
      const entries = fs.readdirSync(skillPath, { withFileTypes: true });
      for (const entry of entries) {
           const fullPath = path.join(skillPath, entry.name);
           if (entry.isFile()) {
               children.push(new SkillItem(
                   entry.name,
                   undefined,
                   fullPath,
                   'file',
                   vscode.TreeItemCollapsibleState.None
               ));
           } else if (entry.isDirectory()) {
                // To keep it simple for now, we only go one level deep or show the directory as a file-like item
               children.push(new SkillItem(
                 entry.name,
                 '(Directory)',
                 fullPath,
                 'skill',
                 vscode.TreeItemCollapsibleState.Collapsed
               ));
           }
      }
      return children.sort((a,b) => {
         // Folders first
         if (a.itemType === 'skill' && b.itemType === 'file') return -1;
         if (a.itemType === 'file' && b.itemType === 'skill') return 1;
         return a.label.localeCompare(b.label);
      });
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}
