import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { LocalSkillProvider } from './providers/LocalSkillProvider';
import { RemoteSkillProvider } from './providers/RemoteSkillProvider';
import { GitHubService } from './services/GitHubService';
import { SkillItem } from './models/SkillItem';
import { TemplateService, TemplateType } from './services/TemplateService';

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
        }),
        vscode.commands.registerCommand('antigravity.createSkill', async () => {
             const workspaceFolders = vscode.workspace.workspaceFolders;
             if (!workspaceFolders || workspaceFolders.length === 0) {
                 vscode.window.showErrorMessage('Please open a workspace to create a new skill.');
                 return;
             }

             const skillName = await vscode.window.showInputBox({
                 prompt: 'Enter the new skill name (no spaces, e.g., my-awesome-skill)',
                 validateInput: text => {
                     return !text || text.includes(' ') ? 'Name cannot be empty or contain spaces' : null;
                 }
             });

             if (!skillName) { return; }

             const targetDir = path.join(workspaceFolders[0].uri.fsPath, '.gemini', 'antigravity', 'skills', skillName);

             if (fs.existsSync(targetDir)) {
                 vscode.window.showErrorMessage(`Skill directory already exists: ${skillName}`);
                 return;
             }

             const templateService = new TemplateService();
             const templates = templateService.getTemplates(skillName);
             const templateOptions = templates.map(t => ({
                 label: t.name,
                 description: t.description
             }));

             const selected = await vscode.window.showQuickPick(templateOptions, {
                 placeHolder: 'Select a structural template for the new skill'
             });

             if (!selected) { return; }

             try {
                 await templateService.generateTemplate(skillName, selected.label as TemplateType, targetDir);
                 vscode.window.showInformationMessage(`Successfully created skill: ${skillName}`);
                 
                 // Refresh view
                 vscode.commands.executeCommand('antigravity.refreshLocalSkills');

                 // Open the new SKILL.md
                 const skillMdPath = path.join(targetDir, 'SKILL.md');
                 if (fs.existsSync(skillMdPath)) {
                     const doc = await vscode.workspace.openTextDocument(skillMdPath);
                     vscode.window.showTextDocument(doc);
                 }
             } catch (err: any) {
                 vscode.window.showErrorMessage(`Failed to create skill: ${err.message}`);
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
