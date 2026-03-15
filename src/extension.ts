import * as vscode from 'vscode';
import { LocalSkillProvider } from './providers/LocalSkillProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Antigravity Skill Manager is now active!');

    const localSkillProvider = new LocalSkillProvider();
    
    // Register the tree data provider
    vscode.window.registerTreeDataProvider(
        'antigravity.localSkills',
        localSkillProvider
    );

    // Register a command to refresh the tree view
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.refreshLocalSkills', () => {
            localSkillProvider.refresh();
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
