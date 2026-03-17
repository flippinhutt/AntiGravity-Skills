"use strict";var F=Object.create;var T=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var G=Object.getOwnPropertyNames;var H=Object.getPrototypeOf,A=Object.prototype.hasOwnProperty;var O=(c,e)=>{for(var r in e)T(c,r,{get:e[r],enumerable:!0})},R=(c,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of G(e))!A.call(c,a)&&a!==r&&T(c,a,{get:()=>e[a],enumerable:!(o=D(e,a))||o.enumerable});return c};var g=(c,e,r)=>(r=c!=null?F(H(c)):{},R(e||!c||!c.__esModule?T(r,"default",{value:c,enumerable:!0}):r,c)),W=c=>R(T({},"__esModule",{value:!0}),c);var N={};O(N,{activate:()=>U,deactivate:()=>j});module.exports=W(N);var s=g(require("vscode")),C=g(require("fs")),b=g(require("path")),L=g(require("os"));var p=g(require("vscode")),f=g(require("path")),w=g(require("fs")),M=g(require("os"));var k=g(require("vscode")),h=class extends k.TreeItem{constructor(r,o,a,t,i){super(r,i);this.label=r;this.description=o;this.fullPath=a;this.itemType=t;this.collapsibleState=i;this.tooltip=this.fullPath,this.description=o,t==="file"?(this.iconPath=new k.ThemeIcon("file"),this.command={title:"Open File",command:"antigravity.openSkillFile",arguments:[this.fullPath,this]}):this.iconPath=new k.ThemeIcon("symbol-namespace")}githubOwnerRepo;githubPath;downloadUrl};var S=class{constructor(e,r,o){this._extensionUri=e;this._type=r;this._githubService=o}static viewType="antigravity.skills";_view;_searchQuery="";_localSkills=[];_remoteSkills=[];_currentPath=null;resolveWebviewView(e,r,o){this._view=e,e.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},e.webview.html=this._getHtmlForWebview(e.webview),e.webview.onDidReceiveMessage(async a=>{switch(a.type){case"search":this._searchQuery=a.value.toLowerCase(),this._updateView();break;case"refresh":this.refresh();break;case"openItem":a.item.itemType==="skill"||a.item.description?.includes("(Directory)")?this._drillDown(a.item):p.commands.executeCommand("antigravity.openSkillFile",a.filePath,a.item);break;case"goBack":this._goBack();break;case"installSkill":p.commands.executeCommand("antigravity.installSkill",a.item);break;case"createSkill":p.commands.executeCommand("antigravity.createSkill");break}}),setTimeout(()=>this.refresh(),1e3)}refresh(){this._currentPath=null,this._view&&this._view.webview.postMessage({type:"loading"}),this._type==="local"?this._loadLocalSkills():this._loadRemoteSkills()}_updateView(e=!1){if(this._view){if(e){this._view.webview.postMessage({type:"loading"});return}let o=(this._type==="local"?this._localSkills:this._remoteSkills).filter(a=>a.label.toLowerCase().includes(this._searchQuery));this._view.webview.postMessage({type:"updateItems",items:o,canGoBack:this._currentPath!==null})}}async _drillDown(e){if(this._updateView(!0),this._type==="local")try{let r=w.readdirSync(e.fullPath,{withFileTypes:!0});this._localSkills=r.map(o=>{let a=f.join(e.fullPath,o.name);return new h(o.name,o.isDirectory()?"(Directory)":void 0,a,o.isDirectory()?"skill":"file",o.isDirectory()?p.TreeItemCollapsibleState.Collapsed:p.TreeItemCollapsibleState.None)}),this._currentPath={type:"local",path:e.fullPath}}catch(r){console.error(r)}else{let r=e.githubOwnerRepo,o=e.githubPath||"";try{let a=await this._githubService.getRepoContents(r,o);this._remoteSkills=a.map(t=>{let i=new h(t.name,t.type==="dir"?"(Directory)":void 0,t.html_url,t.type==="dir"?"skill":"file",t.type==="dir"?p.TreeItemCollapsibleState.Collapsed:p.TreeItemCollapsibleState.None);return i.githubOwnerRepo=r,i.githubPath=t.path,i.downloadUrl=t.download_url||void 0,i}),this._currentPath={type:"remote",path:o,repo:r}}catch(a){console.error(a)}}this._updateView()}_goBack(){this.refresh()}_loadLocalSkills(){let e=[],o=p.workspace.getConfiguration("antigravity").get("customGlobalSkillsPath","").trim();if(o?o.startsWith("~")&&(o=f.join(M.homedir(),o.slice(1))):o=f.join(M.homedir(),".gemini","antigravity","skills"),w.existsSync(o)&&e.push(...this._readLocalDir(o,"(Global)")),p.workspace.workspaceFolders)for(let a of p.workspace.workspaceFolders){let t=f.join(a.uri.fsPath,".gemini","antigravity","skills");w.existsSync(t)&&e.push(...this._readLocalDir(t,"(Workspace)"))}this._localSkills=e,this._updateView()}_readLocalDir(e,r){let o=[],t=p.workspace.getConfiguration("antigravity").get("hideInvalidSkills",!1);try{let i=w.readdirSync(e,{withFileTypes:!0});for(let n of i)if(n.isDirectory()){let d=f.join(e,n.name),l=w.existsSync(f.join(d,"SKILL.md"));if(!l&&t)continue;let u=new h(n.name,l?r:"Invalid Skill (Missing SKILL.md)",d,"skill",l?p.TreeItemCollapsibleState.Collapsed:p.TreeItemCollapsibleState.None);o.push(u)}}catch(i){console.error(i)}return o}async _loadRemoteSkills(){let o=p.workspace.getConfiguration("antigravity").get("skillRepositories",[]).map(async t=>{let i=[".gemini/antigravity/skills","skills",""];for(let n of i)try{let d=await this._githubService.getRepoContents(t,n);if(d&&d.length>0){if(n!=="")return d.map(l=>{let u=new h(l.name,l.type==="dir"?`(Skill in ${t})`:void 0,l.html_url,l.type==="dir"?"skill":"file",l.type==="dir"?p.TreeItemCollapsibleState.Collapsed:p.TreeItemCollapsibleState.None);return u.githubOwnerRepo=t,u.githubPath=l.path,u.downloadUrl=l.download_url||void 0,u});if(i.indexOf(n)===i.length-1){let l=new h(t,"(Repo Root)",`github:${t}`,"skill",p.TreeItemCollapsibleState.Collapsed);return l.githubOwnerRepo=t,l.githubPath="",[l]}}}catch{}return[]}),a=await Promise.all(o);this._remoteSkills=a.flat(),this._updateView()}_getHtmlForWebview(e){return`<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Antigravity Skills</title>
                <style>
                    :root {
                        --sidebar-padding: 12px;
                        --item-height: 28px;
                    }
                    body {
                        padding: 0;
                        color: var(--vscode-foreground);
                        font-family: var(--vscode-font-family);
                        overflow-x: hidden;
                    }
                    .header {
                        display: flex;
                        flex-direction: column;
                        position: sticky;
                        top: 0;
                        background: var(--vscode-sideBar-background);
                        z-index: 100;
                        border-bottom: 1px solid var(--vscode-sideBar-border);
                    }
                    .search-container {
                        padding: 8px var(--sidebar-padding);
                    }
                    .search-inner {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }
                    #search {
                        width: 100%;
                        padding: 6px 30px 6px 8px;
                        box-sizing: border-box;
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        outline: none;
                        font-size: 12px;
                        border-radius: 2px;
                    }
                    #search:focus {
                        border-color: var(--vscode-focusBorder);
                    }
                    .search-icon {
                        position: absolute;
                        right: 8px;
                        opacity: 0.5;
                        font-size: 14px;
                        cursor: default;
                    }
                    .toolbar {
                        display: flex;
                        align-items: center;
                        padding: 0 var(--sidebar-padding) 8px var(--sidebar-padding);
                        gap: 8px;
                    }
                    .tool-button {
                        cursor: pointer;
                        opacity: 0.7;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        background: var(--vscode-button-secondaryBackground);
                        color: var(--vscode-button-secondaryForeground);
                        padding: 2px 8px;
                        border-radius: 2px;
                    }
                    .tool-button:hover {
                        opacity: 1;
                        background: var(--vscode-button-secondaryHoverBackground);
                    }
                    .item-list {
                        list-style: none;
                        padding: 4px 0;
                        margin: 0;
                    }
                    .item {
                        padding: 0 var(--sidebar-padding);
                        height: var(--item-height);
                        line-height: var(--item-height);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        border-radius: 0;
                        font-size: 13px;
                        user-select: none;
                    }
                    .item:hover {
                        background: var(--vscode-list-hoverBackground);
                    }
                    .item:active {
                        background: var(--vscode-list-activeSelectionBackground);
                        color: var(--vscode-list-activeSelectionForeground);
                    }
                    .item-icon {
                        margin-right: 6px;
                        width: 16px;
                        text-align: center;
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .item-label {
                        flex: 1;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .item-description {
                        font-size: 11px;
                        opacity: 0.6;
                        margin-left: 8px;
                        font-style: italic;
                    }
                    .loader {
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        opacity: 0.7;
                    }
                    .no-results {
                        padding: 20px;
                        text-align: center;
                        opacity: 0.5;
                        font-size: 12px;
                    }
                </style>
			</head>
			<body>
				<div class="header">
                    <div class="search-container">
                        <div class="search-inner">
                            <input type="text" id="search" placeholder="Filter skills..." autocomplete="off" />
                            <span class="search-icon">\u{1F50D}</span>
                        </div>
                    </div>
                    <div id="toolbar" class="toolbar" style="display: none;">
                        <span id="back-btn" class="tool-button">\u2190 Back</span>
                    </div>
				</div>
				<div id="content">
                    <div class="loader">Loading skills...</div>
                </div>

				<script>
					const vscode = acquireVsCodeApi();
					const searchInput = document.getElementById('search');
					const contentDiv = document.getElementById('content');
                    const toolbar = document.getElementById('toolbar');
                    const backBtn = document.getElementById('back-btn');

					searchInput.addEventListener('input', (e) => {
						vscode.postMessage({ type: 'search', value: e.target.value });
					});

                    backBtn.addEventListener('click', () => {
                        vscode.postMessage({ type: 'goBack' });
                    });

					window.addEventListener('message', event => {
						const message = event.data;
						switch (message.type) {
                            case 'loading':
                                contentDiv.innerHTML = '<div class="loader">Loading...</div>';
                                break;
							case 'updateItems':
								updateItems(message.items, message.canGoBack);
								break;
						}
					});

					function updateItems(items, canGoBack) {
                        toolbar.style.display = canGoBack ? 'flex' : 'none';

						if (items.length === 0) {
                            contentDiv.innerHTML = '<div class="no-results">No skills found</div>';
                            return;
                        }

                        const ul = document.createElement('ul');
                        ul.className = 'item-list';
                        
						items.forEach(item => {
							const li = document.createElement('li');
							li.className = 'item';
                            
                            let icon = '\u{1F4C4}';
                            if (item.itemType === 'skill' || item.description?.includes('(Directory)') || item.description?.includes('(Repo Root)')) icon = '\u{1F4C1}';
                            if (item.label.toLowerCase().includes('skill.md')) icon = '\u{1F6E1}\uFE0F';

							li.innerHTML = \`
								<span class="item-icon">\${icon}</span>
								<span class="item-label">\${item.label}</span>
								<span class="item-description">\${item.description || ''}</span>
							\`;
							li.addEventListener('click', () => {
								vscode.postMessage({ 
                                    type: 'openItem',
                                    filePath: item.fullPath,
                                    item: item
                                });
							});
							ul.appendChild(li);
						});
                        contentDiv.innerHTML = '';
                        contentDiv.appendChild(ul);
					}
				</script>
			</body>
			</html>`}};var x=g(require("vscode")),y=g(require("fs")),E=g(require("path")),_=class c{constructor(e){this._storage=e}static GITHUB_API_URL="https://api.github.com";static SESSION_OPTIONS={createIfNone:!1};async getToken(e=!1){try{return(await x.authentication.getSession("github",["repo"],{createIfNone:e}))?.accessToken}catch(r){r?.message?.includes("initialized first")?console.warn("Antigravity services not yet ready:",r.message):console.error("Failed to get GitHub session:",r);return}}async getRepoContents(e,r=""){let o=await this.getToken(),a=`${c.GITHUB_API_URL}/repos/${e}/contents/${r}`,t=`github-cache:${e}:${r}`,i=this._storage?.get(t),n={Accept:"application/vnd.github.v3+json","User-Agent":"Antigravity-Skill-Manager-VSCode"};o&&(n.Authorization=`Bearer ${o}`),i?.etag&&(n["If-None-Match"]=i.etag);try{let d=await fetch(a,{headers:n});if(d.status===304&&i)return console.log(`Cache hit for ${a}`),i.data;if(!d.ok){let $=await d.text();throw new Error(`GitHub API Error (${d.status}): ${$}`)}let l=await d.json(),u=Array.isArray(l)?l:[l],m=d.headers.get("ETag");return m&&this._storage&&await this._storage.update(t,{etag:m,data:u}),u}catch(d){return console.error(`Error fetching contents for ${e}:`,d),i?i.data:(x.window.showErrorMessage(`Failed to fetch remote skills from ${e}. See extension logs.`),[])}}async downloadFolder(e,r,o){let a=await this.getRepoContents(e,r);y.existsSync(o)||y.mkdirSync(o,{recursive:!0});let t=await this.getToken(),i={};t&&(i.Authorization=`Bearer ${t}`);for(let n of a){let d=E.join(o,n.name);if(n.type==="dir")await this.downloadFolder(e,n.path,d);else if(n.type==="file"&&n.download_url)try{let l=await fetch(n.download_url,{headers:i});if(!l.ok)throw new Error(`Failed to download ${n.download_url}: ${l.statusText}`);let u=await l.arrayBuffer(),m=Buffer.from(u);y.writeFileSync(d,m)}catch(l){console.error(`Error downloading file ${n.name}:`,l),x.window.showErrorMessage(`Failed to download file ${n.name}: ${l.message}`)}}}};var v=g(require("fs")),P=g(require("path")),I=class{getMinimalTemplate(e){return{name:"Minimal",description:"A basic SKILL.md with frontmatter.",files:{"SKILL.md":`---
name: ${e}
description: Write a description here
---

# Instructions

Write your agent instructions here.
`}}}getScriptBasedTemplate(e){return{name:"Script-based",description:"Includes a SKILL.md and a scripts/ folder.",files:{"SKILL.md":`---
name: ${e}
description: Write a description here
---

# Instructions

When using this skill, you can execute the helper script located in \`scripts/run.sh\`.
`,"scripts/run.sh":`#!/bin/bash
echo "Hello from ${e}!"
`}}}getMultiAgentTemplate(e){return{name:"Multi-agent",description:"Scaffolds roles for complex agent interactions.",files:{"SKILL.md":`---
name: ${e}
description: Multi-agent coordination skill
---

# Instructions

This skill involves multiple agents. See the \`agents/\` folder for specific roles.
`,"agents/planner.md":`# Planner Agent
Analyze the user request and break it down into steps.
`,"agents/executor.md":`# Executor Agent
Run the steps defined by the Planner.
`}}}getTemplates(e){return[this.getMinimalTemplate(e),this.getScriptBasedTemplate(e),this.getMultiAgentTemplate(e)]}async generateTemplate(e,r,o){let t=this.getTemplates(e).find(i=>i.name===r);if(!t)throw new Error(`Template "${r}" not found.`);v.existsSync(o)||v.mkdirSync(o,{recursive:!0});for(let[i,n]of Object.entries(t.files)){let d=P.join(o,i),l=P.dirname(d);v.existsSync(l)||v.mkdirSync(l,{recursive:!0}),v.writeFileSync(d,n)}}};function U(c){console.log("Antigravity Skill Manager is now active!");let e=new _(c.globalState),r=new S(c.extensionUri,"local",e);c.subscriptions.push(s.window.registerWebviewViewProvider("antigravity.localSkills",r));let o=new S(c.extensionUri,"remote",e);c.subscriptions.push(s.window.registerWebviewViewProvider("antigravity.remoteSkills",o));let a=new class{async provideTextDocumentContent(t){try{let i=await fetch(t.query);if(!i.ok)throw new Error(`HTTP ${i.status}: ${i.statusText}`);return await i.text()}catch(i){return`Failed to fetch remote file content:

${i.message}`}}};c.subscriptions.push(s.workspace.registerTextDocumentContentProvider("antigravity-remote",a)),c.subscriptions.push(s.commands.registerCommand("antigravity.refreshLocalSkills",()=>{r.refresh()}),s.commands.registerCommand("antigravity.refreshRemoteSkills",()=>{o.refresh()}),s.commands.registerCommand("antigravity.githubLogin",async()=>{await e.getToken(!0)&&(s.window.showInformationMessage("Successfully authenticated with GitHub."),o.refresh())}),s.commands.registerCommand("antigravity.installSkill",async t=>{if(!t.githubOwnerRepo||!t.githubPath){s.window.showErrorMessage("Cannot install skill: Missing GitHub metadata on tree item.");return}let i=await B(t.label);i&&(C.existsSync(i)&&await s.window.showWarningMessage(`A skill named "${t.label}" already exists there. Overwrite?`,{modal:!0},"Overwrite")!=="Overwrite"||s.window.withProgress({location:s.ProgressLocation.Notification,title:`Installing ${t.label}...`,cancellable:!1},async n=>{try{await e.downloadFolder(t.githubOwnerRepo,t.githubPath,i),s.commands.executeCommand("antigravity.refreshLocalSkills"),s.window.showInformationMessage(`Successfully installed ${t.label}!`)}catch(d){s.window.showErrorMessage(`Failed to install ${t.label}: ${d.message}`)}}))}),s.commands.registerCommand("antigravity.createSkill",async()=>{let t=await s.window.showInputBox({prompt:"Enter the new skill name (no spaces, e.g., my-awesome-skill)",validateInput:m=>!m||m.includes(" ")?"Name cannot be empty or contain spaces":null});if(!t)return;let i=await B(t);if(!i)return;if(C.existsSync(i)){s.window.showErrorMessage(`Skill directory already exists: ${t}`);return}let n=new I,l=n.getTemplates(t).map(m=>({label:m.name,description:m.description})),u=await s.window.showQuickPick(l,{placeHolder:"Select a structural template for the new skill"});if(u)try{await n.generateTemplate(t,u.label,i),s.window.showInformationMessage(`Successfully created skill: ${t}`),s.commands.executeCommand("antigravity.refreshLocalSkills");let m=b.join(i,"SKILL.md");if(C.existsSync(m)){let $=await s.workspace.openTextDocument(m);s.window.showTextDocument($)}}catch(m){s.window.showErrorMessage(`Failed to create skill: ${m.message}`)}})),c.subscriptions.push(s.commands.registerCommand("antigravity.openSkillFile",async(t,i)=>{if(i&&i.downloadUrl){let n=s.Uri.parse(`antigravity-remote:${i.label}?${i.downloadUrl}`),d=await s.workspace.openTextDocument(n);s.window.showTextDocument(d,{preview:!0})}else if(t.startsWith("http://")||t.startsWith("https://"))s.env.openExternal(s.Uri.parse(t));else{let n=await s.workspace.openTextDocument(t);s.window.showTextDocument(n)}}),s.commands.registerCommand("antigravity.showInvalidSkillError",t=>{s.window.showErrorMessage(`The folder "${t}" does not contain a SKILL.md file. Create one or use the "Create New Skill" command to scaffold a valid skill.`)}),s.commands.registerCommand("antigravity.addRemoteRepo",async()=>{let t=await s.window.showInputBox({prompt:"Enter the GitHub repository (format: owner/repo)",placeHolder:"e.g., rominirani/antigravity-skills",validateInput:d=>/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(d||"")?null:"Invalid format. Must be owner/repo."});if(!t)return;let i=s.workspace.getConfiguration("antigravity"),n=i.get("skillRepositories",[]);if(n.includes(t)){s.window.showInformationMessage(`Repository ${t} is already in your list.`);return}n.push(t),await i.update("skillRepositories",n,s.ConfigurationTarget.Global),o.refresh(),s.window.showInformationMessage(`Added remote repository: ${t}`)}),s.commands.registerCommand("antigravity.removeRemoteRepo",async t=>{if(!t.githubOwnerRepo)return;let i=t.githubOwnerRepo,n=s.workspace.getConfiguration("antigravity"),d=n.get("skillRepositories",[]),l=d.indexOf(i);l>-1&&(d.splice(l,1),await n.update("skillRepositories",d,s.ConfigurationTarget.Global),o.refresh(),s.window.showInformationMessage(`Removed repository: ${i}`))}))}function j(){}function z(){let e=s.workspace.getConfiguration("antigravity").get("customGlobalSkillsPath","").trim();return e?e.startsWith("~")&&(e=b.join(L.homedir(),e.slice(1))):e=b.join(L.homedir(),".gemini","antigravity","skills"),e}async function B(c){let e=z(),r=b.join(e,c),o=s.workspace.workspaceFolders;if(!o||o.length===0)return r;let a=[{label:"$(globe) Global",description:r,target:r},...o.map(i=>{let n=b.join(i.uri.fsPath,".gemini","antigravity","skills",c);return{label:`$(folder) Workspace (${i.name})`,description:n,target:n}})],t=await s.window.showQuickPick(a,{placeHolder:`Where should "${c}" be placed?`});return t?t.target:void 0}0&&(module.exports={activate,deactivate});
