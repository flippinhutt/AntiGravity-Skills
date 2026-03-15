import * as vscode from 'vscode';
import { LocalSkillProvider } from './providers/LocalSkillProvider';
import { RemoteSkillProvider } from './providers/RemoteSkillProvider';
import { GitHubService } from './services/GitHubService';

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
