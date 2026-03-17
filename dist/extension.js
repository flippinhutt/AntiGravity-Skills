"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode5 = __toESM(require("vscode"));
var fs4 = __toESM(require("fs"));
var path4 = __toESM(require("path"));
var os2 = __toESM(require("os"));

// src/providers/LocalSkillProvider.ts
var vscode2 = __toESM(require("vscode"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));
var os = __toESM(require("os"));

// src/models/SkillItem.ts
var vscode = __toESM(require("vscode"));
var SkillItem = class extends vscode.TreeItem {
  constructor(label, description, fullPath, itemType, collapsibleState) {
    super(label, collapsibleState);
    this.label = label;
    this.description = description;
    this.fullPath = fullPath;
    this.itemType = itemType;
    this.collapsibleState = collapsibleState;
    this.tooltip = this.fullPath;
    this.description = description;
    if (itemType === "file") {
      this.iconPath = new vscode.ThemeIcon("file");
      this.command = {
        title: "Open File",
        command: "antigravity.openSkillFile",
        arguments: [this.fullPath, this]
      };
    } else {
      this.iconPath = new vscode.ThemeIcon("symbol-namespace");
    }
  }
  githubOwnerRepo;
  githubPath;
  downloadUrl;
};

// src/providers/LocalSkillProvider.ts
var LocalSkillProvider = class {
  _onDidChangeTreeData = new vscode2.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  searchQuery = "";
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  setFilter(query) {
    this.searchQuery = query.toLowerCase();
    this.refresh();
  }
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (element) {
      if (element.itemType === "skill") {
        return Promise.resolve(this.getFilesInSkill(element.fullPath));
      } else {
        return Promise.resolve([]);
      }
    } else {
      return Promise.resolve(this.getTopLevelSkills());
    }
  }
  getTopLevelSkills() {
    const skills = [];
    const config = vscode2.workspace.getConfiguration("antigravity");
    let globalPath = config.get("customGlobalSkillsPath", "").trim();
    if (!globalPath) {
      globalPath = path.join(os.homedir(), ".gemini", "antigravity", "skills");
    } else if (globalPath.startsWith("~")) {
      globalPath = path.join(os.homedir(), globalPath.slice(1));
    }
    if (this.pathExists(globalPath)) {
      skills.push(...this.readSkillDirectories(globalPath, "(Global)"));
    }
    if (vscode2.workspace.workspaceFolders) {
      for (const folder of vscode2.workspace.workspaceFolders) {
        const localPath = path.join(folder.uri.fsPath, ".gemini", "antigravity", "skills");
        if (this.pathExists(localPath)) {
          skills.push(...this.readSkillDirectories(localPath, "(Workspace)"));
        }
      }
    }
    if (this.searchQuery) {
      return skills.filter((s) => s.label.toLowerCase().includes(this.searchQuery)).sort((a, b) => a.label.localeCompare(b.label));
    }
    return skills.sort((a, b) => a.label.localeCompare(b.label));
  }
  readSkillDirectories(skillsPath, description) {
    const skills = [];
    const config = vscode2.workspace.getConfiguration("antigravity");
    const hideInvalid = config.get("hideInvalidSkills", false);
    const entries = fs.readdirSync(skillsPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(skillsPath, entry.name);
        const hasSkillMd = fs.existsSync(path.join(fullPath, "SKILL.md"));
        if (!hasSkillMd && hideInvalid) {
          continue;
        }
        const item = new SkillItem(
          entry.name,
          hasSkillMd ? description : "Invalid Skill (Missing SKILL.md)",
          fullPath,
          "skill",
          hasSkillMd ? vscode2.TreeItemCollapsibleState.Collapsed : vscode2.TreeItemCollapsibleState.None
        );
        if (!hasSkillMd) {
          item.iconPath = new vscode2.ThemeIcon("error");
          item.contextValue = "invalid-skill";
          item.command = {
            title: "Show Error",
            command: "antigravity.showInvalidSkillError",
            arguments: [entry.name]
          };
        } else {
          item.contextValue = "skill";
        }
        skills.push(item);
      }
    }
    return skills;
  }
  getFilesInSkill(skillPath) {
    const children = [];
    const entries = fs.readdirSync(skillPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(skillPath, entry.name);
      if (entry.isFile()) {
        children.push(new SkillItem(
          entry.name,
          void 0,
          fullPath,
          "file",
          vscode2.TreeItemCollapsibleState.None
        ));
      } else if (entry.isDirectory()) {
        children.push(new SkillItem(
          entry.name,
          "(Directory)",
          fullPath,
          "skill",
          vscode2.TreeItemCollapsibleState.Collapsed
        ));
      }
    }
    return children.sort((a, b) => {
      if (a.itemType === "skill" && b.itemType === "file")
        return -1;
      if (a.itemType === "file" && b.itemType === "skill")
        return 1;
      return a.label.localeCompare(b.label);
    });
  }
  pathExists(p) {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
};

// src/providers/RemoteSkillProvider.ts
var vscode4 = __toESM(require("vscode"));

// src/services/GitHubService.ts
var vscode3 = __toESM(require("vscode"));
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var GitHubService = class _GitHubService {
  static GITHUB_API_URL = "https://api.github.com";
  static SESSION_OPTIONS = { createIfNone: false };
  /**
   * Gets a GitHub Token from VSCode's built-in authentication provider.
   */
  async getToken(createIfNone = false) {
    try {
      const session = await vscode3.authentication.getSession("github", ["repo"], { createIfNone });
      return session?.accessToken;
    } catch (error) {
      console.error("Failed to get GitHub session:", error);
      return void 0;
    }
  }
  /**
   * Fetches the root contents of a given GitHub repository.
   * @param ownerRepo String in the format "owner/repo"
   */
  async getRepoContents(ownerRepo, path5 = "") {
    const token = await this.getToken();
    const url = `${_GitHubService.GITHUB_API_URL}/repos/${ownerRepo}/contents/${path5}`;
    const headers = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Antigravity-Skill-Manager-VSCode"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`GitHub API Error (${response.status}): ${text}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error(`Error fetching contents for ${ownerRepo}:`, error);
      vscode3.window.showErrorMessage(`Failed to fetch remote skills from ${ownerRepo}. See extension logs.`);
      return [];
    }
  }
  /**
   * Recursively downloads a folder from GitHub.
   */
  async downloadFolder(ownerRepo, folderPath, targetLocalDir) {
    const contents = await this.getRepoContents(ownerRepo, folderPath);
    if (!fs2.existsSync(targetLocalDir)) {
      fs2.mkdirSync(targetLocalDir, { recursive: true });
    }
    const token = await this.getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    for (const item of contents) {
      const itemLocalPath = path2.join(targetLocalDir, item.name);
      if (item.type === "dir") {
        await this.downloadFolder(ownerRepo, item.path, itemLocalPath);
      } else if (item.type === "file" && item.download_url) {
        try {
          const response = await fetch(item.download_url, { headers });
          if (!response.ok) {
            throw new Error(`Failed to download ${item.download_url}: ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          fs2.writeFileSync(itemLocalPath, buffer);
        } catch (e) {
          console.error(`Error downloading file ${item.name}:`, e);
          vscode3.window.showErrorMessage(`Failed to download file ${item.name}: ${e.message}`);
        }
      }
    }
  }
};

// src/providers/RemoteSkillProvider.ts
var RemoteSkillProvider = class {
  _onDidChangeTreeData = new vscode4.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  searchQuery = "";
  githubService;
  constructor() {
    this.githubService = new GitHubService();
  }
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  setFilter(query) {
    this.searchQuery = query.toLowerCase();
    this.refresh();
  }
  getTreeItem(element) {
    return element;
  }
  async getChildren(element) {
    if (element) {
      const repoStr = element.githubOwnerRepo || element.fullPath.replace("github:", "");
      const subPath = element.githubPath || "";
      const contents = await this.githubService.getRepoContents(repoStr, subPath);
      return contents.map((item) => {
        const skillItem = new SkillItem(
          item.name,
          item.type === "dir" ? "(Directory)" : void 0,
          item.html_url,
          item.type === "dir" ? "skill" : "file",
          item.type === "dir" ? vscode4.TreeItemCollapsibleState.Collapsed : vscode4.TreeItemCollapsibleState.None
        );
        skillItem.contextValue = item.type === "dir" ? "skill" : "file";
        skillItem.githubOwnerRepo = repoStr;
        skillItem.githubPath = item.path;
        skillItem.downloadUrl = item.download_url || void 0;
        return skillItem;
      }).sort((a, b) => {
        if (a.itemType === "skill" && b.itemType === "file")
          return -1;
        if (a.itemType === "file" && b.itemType === "skill")
          return 1;
        return a.label.localeCompare(b.label);
      });
    } else {
      return Promise.resolve(this.getTopLevelRepositories());
    }
  }
  getTopLevelRepositories() {
    const config = vscode4.workspace.getConfiguration("antigravity");
    const repos = config.get("skillRepositories", []);
    let items = repos.map((repo) => {
      const item = new SkillItem(
        repo,
        "(GitHub)",
        `github:${repo}`,
        "skill",
        vscode4.TreeItemCollapsibleState.Collapsed
      );
      item.contextValue = "repo";
      item.githubOwnerRepo = repo;
      return item;
    });
    if (this.searchQuery) {
      items = items.filter((i) => i.label.toLowerCase().includes(this.searchQuery));
    }
    return items;
  }
};

// src/services/TemplateService.ts
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var TemplateService = class {
  getMinimalTemplate(skillName) {
    return {
      name: "Minimal",
      description: "A basic SKILL.md with frontmatter.",
      files: {
        "SKILL.md": `---
name: ${skillName}
description: Write a description here
---

# Instructions

Write your agent instructions here.
`
      }
    };
  }
  getScriptBasedTemplate(skillName) {
    return {
      name: "Script-based",
      description: "Includes a SKILL.md and a scripts/ folder.",
      files: {
        "SKILL.md": `---
name: ${skillName}
description: Write a description here
---

# Instructions

When using this skill, you can execute the helper script located in \`scripts/run.sh\`.
`,
        "scripts/run.sh": `#!/bin/bash
echo "Hello from ${skillName}!"
`
      }
    };
  }
  getMultiAgentTemplate(skillName) {
    return {
      name: "Multi-agent",
      description: "Scaffolds roles for complex agent interactions.",
      files: {
        "SKILL.md": `---
name: ${skillName}
description: Multi-agent coordination skill
---

# Instructions

This skill involves multiple agents. See the \`agents/\` folder for specific roles.
`,
        "agents/planner.md": `# Planner Agent
Analyze the user request and break it down into steps.
`,
        "agents/executor.md": `# Executor Agent
Run the steps defined by the Planner.
`
      }
    };
  }
  getTemplates(skillName) {
    return [
      this.getMinimalTemplate(skillName),
      this.getScriptBasedTemplate(skillName),
      this.getMultiAgentTemplate(skillName)
    ];
  }
  async generateTemplate(skillName, templateName, targetDir) {
    const templates = this.getTemplates(skillName);
    const template = templates.find((t) => t.name === templateName);
    if (!template) {
      throw new Error(`Template "${templateName}" not found.`);
    }
    if (!fs3.existsSync(targetDir)) {
      fs3.mkdirSync(targetDir, { recursive: true });
    }
    for (const [relativePath, content] of Object.entries(template.files)) {
      const absolutePath = path3.join(targetDir, relativePath);
      const dirName = path3.dirname(absolutePath);
      if (!fs3.existsSync(dirName)) {
        fs3.mkdirSync(dirName, { recursive: true });
      }
      fs3.writeFileSync(absolutePath, content);
    }
  }
};

// src/extension.ts
function activate(context) {
  console.log("Antigravity Skill Manager is now active!");
  const localSkillProvider = new LocalSkillProvider();
  vscode5.window.registerTreeDataProvider(
    "antigravity.localSkills",
    localSkillProvider
  );
  const remoteSkillProvider = new RemoteSkillProvider();
  vscode5.window.registerTreeDataProvider(
    "antigravity.remoteSkills",
    remoteSkillProvider
  );
  const remoteContentProvider = new class {
    async provideTextDocumentContent(uri) {
      try {
        const response = await fetch(uri.query);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.text();
      } catch (err) {
        return `Failed to fetch remote file content:

${err.message}`;
      }
    }
  }();
  context.subscriptions.push(
    vscode5.workspace.registerTextDocumentContentProvider("antigravity-remote", remoteContentProvider)
  );
  context.subscriptions.push(
    vscode5.commands.registerCommand("antigravity.refreshLocalSkills", () => {
      localSkillProvider.refresh();
    }),
    vscode5.commands.registerCommand("antigravity.refreshRemoteSkills", () => {
      remoteSkillProvider.refresh();
    }),
    vscode5.commands.registerCommand("antigravity.githubLogin", async () => {
      const githubService = new GitHubService();
      const token = await githubService.getToken(true);
      if (token) {
        vscode5.window.showInformationMessage("Successfully authenticated with GitHub.");
        remoteSkillProvider.refresh();
      }
    }),
    vscode5.commands.registerCommand("antigravity.installSkill", async (item) => {
      if (!item.githubOwnerRepo || !item.githubPath) {
        vscode5.window.showErrorMessage("Cannot install skill: Missing GitHub metadata on tree item.");
        return;
      }
      const targetDir = await promptForSkillTarget(item.label);
      if (!targetDir) {
        return;
      }
      if (fs4.existsSync(targetDir)) {
        const answer = await vscode5.window.showWarningMessage(
          `A skill named "${item.label}" already exists there. Overwrite?`,
          { modal: true },
          "Overwrite"
        );
        if (answer !== "Overwrite") {
          return;
        }
      }
      vscode5.window.withProgress({
        location: vscode5.ProgressLocation.Notification,
        title: `Installing ${item.label}...`,
        cancellable: false
      }, async (progress) => {
        try {
          const githubService = new GitHubService();
          await githubService.downloadFolder(item.githubOwnerRepo, item.githubPath, targetDir);
          vscode5.commands.executeCommand("antigravity.refreshLocalSkills");
          vscode5.window.showInformationMessage(`Successfully installed ${item.label}!`);
        } catch (err) {
          vscode5.window.showErrorMessage(`Failed to install ${item.label}: ${err.message}`);
        }
      });
    }),
    vscode5.commands.registerCommand("antigravity.createSkill", async () => {
      const skillName = await vscode5.window.showInputBox({
        prompt: "Enter the new skill name (no spaces, e.g., my-awesome-skill)",
        validateInput: (text) => {
          return !text || text.includes(" ") ? "Name cannot be empty or contain spaces" : null;
        }
      });
      if (!skillName) {
        return;
      }
      const targetDir = await promptForSkillTarget(skillName);
      if (!targetDir) {
        return;
      }
      if (fs4.existsSync(targetDir)) {
        vscode5.window.showErrorMessage(`Skill directory already exists: ${skillName}`);
        return;
      }
      const templateService = new TemplateService();
      const templates = templateService.getTemplates(skillName);
      const templateOptions = templates.map((t) => ({
        label: t.name,
        description: t.description
      }));
      const selected = await vscode5.window.showQuickPick(templateOptions, {
        placeHolder: "Select a structural template for the new skill"
      });
      if (!selected) {
        return;
      }
      try {
        await templateService.generateTemplate(skillName, selected.label, targetDir);
        vscode5.window.showInformationMessage(`Successfully created skill: ${skillName}`);
        vscode5.commands.executeCommand("antigravity.refreshLocalSkills");
        const skillMdPath = path4.join(targetDir, "SKILL.md");
        if (fs4.existsSync(skillMdPath)) {
          const doc = await vscode5.workspace.openTextDocument(skillMdPath);
          vscode5.window.showTextDocument(doc);
        }
      } catch (err) {
        vscode5.window.showErrorMessage(`Failed to create skill: ${err.message}`);
      }
    })
  );
  context.subscriptions.push(
    vscode5.commands.registerCommand("antigravity.openSkillFile", async (filePath, item) => {
      if (item && item.downloadUrl) {
        const uri = vscode5.Uri.parse(`antigravity-remote:${item.label}?${item.downloadUrl}`);
        const document = await vscode5.workspace.openTextDocument(uri);
        vscode5.window.showTextDocument(document, { preview: true });
      } else if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
        vscode5.env.openExternal(vscode5.Uri.parse(filePath));
      } else {
        const document = await vscode5.workspace.openTextDocument(filePath);
        vscode5.window.showTextDocument(document);
      }
    }),
    vscode5.commands.registerCommand("antigravity.showInvalidSkillError", (skillName) => {
      vscode5.window.showErrorMessage(
        `The folder "${skillName}" does not contain a SKILL.md file. Create one or use the "Create New Skill" command to scaffold a valid skill.`
      );
    }),
    vscode5.commands.registerCommand("antigravity.addRemoteRepo", async () => {
      const repoFullName = await vscode5.window.showInputBox({
        prompt: "Enter the GitHub repository (format: owner/repo)",
        placeHolder: "e.g., rominirani/antigravity-skills",
        validateInput: (text) => {
          const regex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
          return regex.test(text || "") ? null : "Invalid format. Must be owner/repo.";
        }
      });
      if (!repoFullName) {
        return;
      }
      const config = vscode5.workspace.getConfiguration("antigravity");
      const repos = config.get("skillRepositories", []);
      if (repos.includes(repoFullName)) {
        vscode5.window.showInformationMessage(`Repository ${repoFullName} is already in your list.`);
        return;
      }
      repos.push(repoFullName);
      await config.update("skillRepositories", repos, vscode5.ConfigurationTarget.Global);
      remoteSkillProvider.refresh();
      vscode5.window.showInformationMessage(`Added remote repository: ${repoFullName}`);
    }),
    vscode5.commands.registerCommand("antigravity.removeRemoteRepo", async (item) => {
      if (!item.githubOwnerRepo) {
        return;
      }
      const repoToRemove = item.githubOwnerRepo;
      const config = vscode5.workspace.getConfiguration("antigravity");
      const repos = config.get("skillRepositories", []);
      const index = repos.indexOf(repoToRemove);
      if (index > -1) {
        repos.splice(index, 1);
        await config.update("skillRepositories", repos, vscode5.ConfigurationTarget.Global);
        remoteSkillProvider.refresh();
        vscode5.window.showInformationMessage(`Removed repository: ${repoToRemove}`);
      }
    }),
    vscode5.commands.registerCommand("antigravity.filterLocalSkills", async () => {
      const query = await vscode5.window.showInputBox({
        prompt: "Filter local skills by name",
        placeHolder: "Enter search text (leave empty to clear)"
      });
      if (query !== void 0) {
        localSkillProvider.setFilter(query);
      }
    }),
    vscode5.commands.registerCommand("antigravity.filterRemoteSkills", async () => {
      const query = await vscode5.window.showInputBox({
        prompt: "Filter remote repositories by name",
        placeHolder: "Enter search text (leave empty to clear)"
      });
      if (query !== void 0) {
        remoteSkillProvider.setFilter(query);
      }
    })
  );
}
function deactivate() {
}
function getGlobalSkillsPath() {
  const config = vscode5.workspace.getConfiguration("antigravity");
  let globalPath = config.get("customGlobalSkillsPath", "").trim();
  if (!globalPath) {
    globalPath = path4.join(os2.homedir(), ".gemini", "antigravity", "skills");
  } else if (globalPath.startsWith("~")) {
    globalPath = path4.join(os2.homedir(), globalPath.slice(1));
  }
  return globalPath;
}
async function promptForSkillTarget(skillName) {
  const globalPath = getGlobalSkillsPath();
  const globalTarget = path4.join(globalPath, skillName);
  const workspaceFolders = vscode5.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return globalTarget;
  }
  const options = [
    { label: "$(globe) Global", description: globalTarget, target: globalTarget },
    ...workspaceFolders.map((f) => {
      const workspaceTarget = path4.join(f.uri.fsPath, ".gemini", "antigravity", "skills", skillName);
      return {
        label: `$(folder) Workspace (${f.name})`,
        description: workspaceTarget,
        target: workspaceTarget
      };
    })
  ];
  const choice = await vscode5.window.showQuickPick(options, {
    placeHolder: `Where should "${skillName}" be placed?`
  });
  return choice ? choice.target : void 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
