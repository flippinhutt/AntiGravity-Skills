import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { LocalSkillProvider } from './providers/LocalSkillProvider';
import { RemoteSkillProvider } from './providers/RemoteSkillProvider';
import { GitHubService } from './services/GitHubService';
import { SkillItem } from './models/SkillItem';

export function activate(context: vscode.ExtensionContext) {
    console.log('Antigravity Skill Manager is now active!');

    const localSkillProvider = new LocalSkillProvider();
    
    // Register the tree data provider
    vscode.window.registerTreeDataProvider(
        'antigravity.localSkills',
        localSkillProvider
    );

    const remoteSkillProvider = new RemoteSkillProvider();
    vscode.window.registerTreeDataProvider(
        'antigravity.remoteSkills',
        remoteSkillProvider
    );

    // Register a command to refresh the tree views
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.refreshLocalSkills', () => {
            localSkillProvider.refresh();
        }),
        vscode.commands.registerCommand('antigravity.refreshRemoteSkills', () => {
            remoteSkillProvider.refresh();
        }),
        vscode.commands.registerCommand('antigravity.githubLogin', async () => {
            const githubService = new GitHubService();
            const token = await githubService.getToken(true);
            if (token) {
                 vscode.window.showInformationMessage('Successfully authenticated with GitHub.');
                 remoteSkillProvider.refresh();
            }
        }),
        vscode.commands.registerCommand('antigravity.installSkill', async (item: SkillItem) => {
             const anyItem = item as any;
             if (!anyItem.githubOwnerRepo || !anyItem.githubPath) {
                 vscode.window.showErrorMessage('Cannot install skill: Missing GitHub metadata on tree item.');
                 return;
             }

             const globalDir = path.join(os.homedir(), '.gemini', 'antigravity', 'skills');
             const targetDir = path.join(globalDir, item.label);

             if (fs.existsSync(targetDir)) {
                 const answer = await vscode.window.showWarningMessage(
                     `A skill named "${item.label}" already exists locally. Overwrite?`,
                     { modal: true },
                     'Overwrite'
                 );
                 if (answer !== 'Overwrite') {
                     return;
                 }
             }

             vscode.window.withProgress({
                 location: vscode.ProgressLocation.Notification,
                 title: `Installing ${item.label}...`,
                 cancellable: false
             }, async (progress) => {
                 try {
                     const githubService = new GitHubService();
                     await githubService.downloadFolder(anyItem.githubOwnerRepo, anyItem.githubPath, targetDir);
                     vscode.commands.executeCommand('antigravity.refreshLocalSkills');
                     vscode.window.showInformationMessage(`Successfully installed ${item.label}!`);
                 } catch (err: any) {
                     vscode.window.showErrorMessage(`Failed to install ${item.label}: ${err.message}`);
                 }
             });
        })
    );

    // Register a command to open a file from the tree view
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.openSkillFile', async (filePath: string) => {
            const document = await vscode.workspace.openTextDocument(filePath);
            vscode.window.showTextDocument(document);
        })
    );
}

export function deactivate() {}
