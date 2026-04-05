"use strict";var F=Object.create;var T=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var A=Object.getOwnPropertyNames;var H=Object.getPrototypeOf,G=Object.prototype.hasOwnProperty;var O=(d,e)=>{for(var n in e)T(d,n,{get:e[n],enumerable:!0})},R=(d,e,n,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of A(e))!G.call(d,r)&&r!==n&&T(d,r,{get:()=>e[r],enumerable:!(s=D(e,r))||s.enumerable});return d};var g=(d,e,n)=>(n=d!=null?F(H(d)):{},R(e||!d||!d.__esModule?T(n,"default",{value:d,enumerable:!0}):n,d)),W=d=>R(T({},"__esModule",{value:!0}),d);var V={};O(V,{activate:()=>U,deactivate:()=>z});module.exports=W(V);var o=g(require("vscode")),$=g(require("fs")),b=g(require("path")),M=g(require("os"));var p=g(require("vscode")),f=g(require("path")),w=g(require("fs")),L=g(require("os"));var k=g(require("vscode")),h=class extends k.TreeItem{constructor(n,s,r,t,i){super(n,i);this.label=n;this.description=s;this.fullPath=r;this.itemType=t;this.collapsibleState=i;this.tooltip=this.fullPath,this.description=s,t==="file"?(this.iconPath=new k.ThemeIcon("file"),this.command={title:"Open File",command:"antigravity.openSkillFile",arguments:[this.fullPath,this]}):this.iconPath=new k.ThemeIcon("symbol-namespace")}githubOwnerRepo;githubPath;downloadUrl;toWebViewItem(){return{label:this.label,description:this.description,fullPath:this.fullPath,itemType:this.itemType,githubOwnerRepo:this.githubOwnerRepo,githubPath:this.githubPath,downloadUrl:this.downloadUrl}}};var S=class{constructor(e,n,s){this._extensionUri=e;this._type=n;this._githubService=s}static viewType="antigravity.skills";_view;_searchQuery="";_localSkills=[];_remoteSkills=[];_currentPath=null;resolveWebviewView(e,n,s){this._view=e,e.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},e.webview.html=this._getHtmlForWebview(e.webview),e.webview.onDidReceiveMessage(async r=>{switch(r.type){case"search":this._searchQuery=r.value.toLowerCase(),this._updateView();break;case"refresh":this.refresh();break;case"openItem":r.item.itemType==="skill"||r.item.description?.includes("(Directory)")?this._drillDown(r.item):p.commands.executeCommand("antigravity.openSkillFile",r.filePath,r.item);break;case"goBack":this._goBack();break;case"installSkill":p.commands.executeCommand("antigravity.installSkill",r.item);break;case"createSkill":p.commands.executeCommand("antigravity.createSkill");break}}),setTimeout(()=>this.refresh(),1e3)}refresh(){this._currentPath=null,this._view&&this._view.webview.postMessage({type:"loading"}),this._type==="local"?this._loadLocalSkills():this._loadRemoteSkills()}_updateView(e=!1){if(this._view){if(e){this._view.webview.postMessage({type:"loading"});return}let s=(this._type==="local"?this._localSkills:this._remoteSkills).filter(r=>r.label.toLowerCase()==="skill.md"||r.label.toLowerCase().includes(this._searchQuery)).sort((r,t)=>{let i=r.label.toLowerCase(),a=t.label.toLowerCase();return i==="skill.md"?-1:a==="skill.md"?1:r.itemType==="skill"&&t.itemType==="file"?-1:r.itemType==="file"&&t.itemType==="skill"?1:r.label.localeCompare(t.label)}).map(r=>r.toWebViewItem());this._view.webview.postMessage({type:"updateItems",items:s,canGoBack:this._currentPath!==null,viewType:this._type})}}async _drillDown(e){if(this._updateView(!0),this._type==="local")try{let n=w.readdirSync(e.fullPath,{withFileTypes:!0});this._localSkills=n.map(s=>{let r=f.join(e.fullPath,s.name);return new h(s.name,s.isDirectory()?"(Directory)":void 0,r,s.isDirectory()?"skill":"file",s.isDirectory()?p.TreeItemCollapsibleState.Collapsed:p.TreeItemCollapsibleState.None)}),this._currentPath={type:"local",path:e.fullPath}}catch(n){console.error(n)}else{let n=e.githubOwnerRepo,s=e.githubPath||"";try{let r=await this._githubService.getRepoContents(n,s);this._remoteSkills=r.map(t=>{let i=new h(t.name,t.type==="dir"?"(Directory)":void 0,t.html_url,t.type==="dir"?"skill":"file",t.type==="dir"?p.TreeItemCollapsibleState.Collapsed:p.TreeItemCollapsibleState.None);return i.githubOwnerRepo=n,i.githubPath=t.path,i.downloadUrl=t.download_url||void 0,i}),this._currentPath={type:"remote",path:s,repo:n}}catch(r){console.error(r)}}this._updateView()}_goBack(){this.refresh()}_loadLocalSkills(){let e=[],s=p.workspace.getConfiguration("antigravity").get("customGlobalSkillsPath","").trim();if(s?s.startsWith("~")&&(s=f.join(L.homedir(),s.slice(1))):s=f.join(L.homedir(),".gemini","antigravity","skills"),w.existsSync(s)&&e.push(...this._readLocalDir(s,void 0)),p.workspace.workspaceFolders)for(let r of p.workspace.workspaceFolders){let t=f.join(r.uri.fsPath,".gemini","antigravity","skills");w.existsSync(t)&&e.push(...this._readLocalDir(t,void 0))}this._localSkills=e,this._updateView()}_readLocalDir(e,n){let s=[],t=p.workspace.getConfiguration("antigravity").get("hideInvalidSkills",!1);try{let i=w.readdirSync(e,{withFileTypes:!0});for(let a of i)if(a.isDirectory()){let l=f.join(e,a.name),c=w.existsSync(f.join(l,"SKILL.md"));if(!c&&t)continue;let u=new h(a.name,c?n:"Invalid Skill (Missing SKILL.md)",l,"skill",c?p.TreeItemCollapsibleState.Collapsed:p.TreeItemCollapsibleState.None);s.push(u)}}catch(i){console.error(i)}return s}async _loadRemoteSkills(){let s=p.workspace.getConfiguration("antigravity").get("skillRepositories",[]).map(async t=>{let i=[".gemini/antigravity/skills","skills",""];for(let a of i)try{let l=await this._githubService.getRepoContents(t,a);if(l&&l.length>0){if(a!=="")return l.map(c=>{let u=new h(c.name,void 0,c.html_url,c.type==="dir"?"skill":"file",c.type==="dir"?p.TreeItemCollapsibleState.Collapsed:p.TreeItemCollapsibleState.None);return u.githubOwnerRepo=t,u.githubPath=c.path,u.downloadUrl=c.download_url||void 0,u});if(i.indexOf(a)===i.length-1){let c=new h(t,"(Repo Root)",`github:${t}`,"skill",p.TreeItemCollapsibleState.Collapsed);return c.githubOwnerRepo=t,c.githubPath="",[c]}}}catch{}return[]}),r=await Promise.all(s);this._remoteSkills=r.flat(),this._updateView()}_getHtmlForWebview(e){return`<!DOCTYPE html>
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
                        flex: 1;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .install-btn {
                        display: none;
                        padding: 2px 6px;
                        font-size: 10px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 2px;
                        cursor: pointer;
                        margin-left: 8px;
                        flex-shrink: 0;
                    }
                    .install-btn:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                    .item:hover .install-btn {
                        display: block;
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
								updateItems(message.items, message.canGoBack, message.viewType);
								break;
						}
					});

					function updateItems(items, canGoBack, viewType) {
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
                            const isSkill = item.itemType === 'skill' || item.description?.includes('(Directory)') || item.description?.includes('(Repo Root)');
                            if (isSkill) icon = '\u{1F4C1}';
                            if (item.label.toLowerCase().includes('skill.md')) icon = '\u{1F6E1}\uFE0F';

                            const showInstall = viewType === 'remote' && isSkill && item.githubOwnerRepo;

							li.innerHTML = \`
								<span class="item-icon">\${icon}</span>
								<span class="item-label">\${item.label}</span>
								<span class="item-description">\${item.description || ''}</span>
                                \${showInstall ? '<button class="install-btn" title="Install to Local">Install</button>' : ''}
							\`;
							li.addEventListener('click', () => {
								vscode.postMessage({ 
                                    type: 'openItem',
                                    filePath: item.fullPath,
                                    item: item
                                });
							});

                            if (showInstall) {
                                const installBtn = li.querySelector('.install-btn');
                                installBtn.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    vscode.postMessage({ 
                                        type: 'installSkill',
                                        item: item
                                    });
                                });
                            }

							ul.appendChild(li);
						});
                        contentDiv.innerHTML = '';
                        contentDiv.appendChild(ul);
					}
				</script>
			</body>
			</html>`}};var _=g(require("vscode")),y=g(require("fs")),E=g(require("path")),I=class d{constructor(e){this._storage=e}static GITHUB_API_URL="https://api.github.com";static SESSION_OPTIONS={createIfNone:!1};async getToken(e=!1,n=3){try{return(await _.authentication.getSession("github",["repo"],{createIfNone:e}))?.accessToken}catch(s){if(s?.message?.includes("initialized first")){if(n>0)return console.warn(`Antigravity services not yet ready (retrying in 500ms... ${n} left):`,s.message),await new Promise(r=>setTimeout(r,500)),this.getToken(e,n-1);console.warn("Antigravity services failed to initialize after retries:",s.message)}else console.error("Failed to get GitHub session:",s);return}}async getRepoContents(e,n=""){let s=await this.getToken(),r=`${d.GITHUB_API_URL}/repos/${e}/contents/${n}`,t=`github-cache:${e}:${n}`,i=this._storage?.get(t),a={Accept:"application/vnd.github.v3+json","User-Agent":"Antigravity-Skill-Manager-VSCode"};s&&(a.Authorization=`Bearer ${s}`),i?.etag&&(a["If-None-Match"]=i.etag);try{let l=await fetch(r,{headers:a});if(l.status===304&&i)return console.log(`Cache hit for ${r}`),i.data;if(!l.ok){let x=await l.text();throw l.status!==404&&console.error(`GitHub API Error (${l.status}) fetching ${r}: ${x}`),new Error(`GitHub API Error (${l.status}): ${x}`)}let c=await l.json(),u=Array.isArray(c)?c:[c],m=l.headers.get("ETag");return m&&this._storage&&await this._storage.update(t,{etag:m,data:u}),u}catch(l){return l instanceof Error&&l.message.includes("Error (404)")||console.error(`Error fetching contents for ${e}:`,l),i?i.data:[]}}async downloadFolder(e,n,s){let r=await this.getRepoContents(e,n);y.existsSync(s)||y.mkdirSync(s,{recursive:!0});let t=await this.getToken(),i={};t&&(i.Authorization=`Bearer ${t}`);for(let a of r){let l=E.join(s,a.name);if(a.type==="dir")await this.downloadFolder(e,a.path,l);else if(a.type==="file"&&a.download_url)try{let c=await fetch(a.download_url,{headers:i});if(!c.ok)throw new Error(`Failed to download ${a.download_url}: ${c.statusText}`);let u=await c.arrayBuffer(),m=Buffer.from(u);y.writeFileSync(l,m)}catch(c){console.error(`Error downloading file ${a.name}:`,c),_.window.showErrorMessage(`Failed to download file ${a.name}: ${c.message}`)}}}};var v=g(require("fs")),C=g(require("path")),P=class{getMinimalTemplate(e){return{name:"Minimal",description:"A basic SKILL.md with frontmatter.",files:{"SKILL.md":`---
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
`}}}getTemplates(e){return[this.getMinimalTemplate(e),this.getScriptBasedTemplate(e),this.getMultiAgentTemplate(e)]}async generateTemplate(e,n,s){let t=this.getTemplates(e).find(i=>i.name===n);if(!t)throw new Error(`Template "${n}" not found.`);v.existsSync(s)||v.mkdirSync(s,{recursive:!0});for(let[i,a]of Object.entries(t.files)){let l=C.join(s,i),c=C.dirname(l);v.existsSync(c)||v.mkdirSync(c,{recursive:!0}),v.writeFileSync(l,a)}}};function U(d){console.log("Antigravity Skill Manager is now active!");let e=new I(d.globalState),n=new S(d.extensionUri,"local",e);d.subscriptions.push(o.window.registerWebviewViewProvider("antigravity.localSkills",n));let s=new S(d.extensionUri,"remote",e);d.subscriptions.push(o.window.registerWebviewViewProvider("antigravity.remoteSkills",s));let r=new class{async provideTextDocumentContent(t){try{let i=await fetch(t.query);if(!i.ok)throw new Error(`HTTP ${i.status}: ${i.statusText}`);return await i.text()}catch(i){return`Failed to fetch remote file content:

${i.message}`}}};d.subscriptions.push(o.workspace.registerTextDocumentContentProvider("antigravity-remote",r)),d.subscriptions.push(o.commands.registerCommand("antigravity.refreshLocalSkills",()=>{n.refresh()}),o.commands.registerCommand("antigravity.refreshRemoteSkills",()=>{s.refresh()}),o.commands.registerCommand("antigravity.githubLogin",async()=>{await e.getToken(!0)&&(o.window.showInformationMessage("Successfully authenticated with GitHub."),s.refresh())}),o.commands.registerCommand("antigravity.installSkill",async t=>{if(!t.githubOwnerRepo||!t.githubPath){o.window.showErrorMessage("Cannot install skill: Missing GitHub metadata on tree item.");return}let i=await B(t.label);i&&($.existsSync(i)&&await o.window.showWarningMessage(`A skill named "${t.label}" already exists there. Overwrite?`,{modal:!0},"Overwrite")!=="Overwrite"||o.window.withProgress({location:o.ProgressLocation.Notification,title:`Installing ${t.label}...`,cancellable:!1},async a=>{try{await e.downloadFolder(t.githubOwnerRepo,t.githubPath,i),o.commands.executeCommand("antigravity.refreshLocalSkills"),o.window.showInformationMessage(`Successfully installed ${t.label}!`)}catch(l){o.window.showErrorMessage(`Failed to install ${t.label}: ${l.message}`)}}))}),o.commands.registerCommand("antigravity.createSkill",async()=>{let t=await o.window.showInputBox({prompt:"Enter the new skill name (no spaces, e.g., my-awesome-skill)",validateInput:m=>!m||m.includes(" ")?"Name cannot be empty or contain spaces":null});if(!t)return;let i=await B(t);if(!i)return;if($.existsSync(i)){o.window.showErrorMessage(`Skill directory already exists: ${t}`);return}let a=new P,c=a.getTemplates(t).map(m=>({label:m.name,description:m.description})),u=await o.window.showQuickPick(c,{placeHolder:"Select a structural template for the new skill"});if(u)try{await a.generateTemplate(t,u.label,i),o.window.showInformationMessage(`Successfully created skill: ${t}`),o.commands.executeCommand("antigravity.refreshLocalSkills");let m=b.join(i,"SKILL.md");if($.existsSync(m)){let x=await o.workspace.openTextDocument(m);o.window.showTextDocument(x)}}catch(m){o.window.showErrorMessage(`Failed to create skill: ${m.message}`)}})),d.subscriptions.push(o.commands.registerCommand("antigravity.openSkillFile",async(t,i)=>{if(i&&i.downloadUrl){let a=o.Uri.parse(`antigravity-remote:${i.label}?${i.downloadUrl}`),l=await o.workspace.openTextDocument(a);o.window.showTextDocument(l,{preview:!0})}else if(t.startsWith("http://")||t.startsWith("https://"))o.env.openExternal(o.Uri.parse(t));else{let a=await o.workspace.openTextDocument(t);o.window.showTextDocument(a)}}),o.commands.registerCommand("antigravity.showInvalidSkillError",t=>{o.window.showErrorMessage(`The folder "${t}" does not contain a SKILL.md file. Create one or use the "Create New Skill" command to scaffold a valid skill.`)}),o.commands.registerCommand("antigravity.addRemoteRepo",async()=>{let t=await o.window.showInputBox({prompt:"Enter the GitHub repository (format: owner/repo)",placeHolder:"e.g., rominirani/antigravity-skills",validateInput:l=>/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(l||"")?null:"Invalid format. Must be owner/repo."});if(!t)return;let i=o.workspace.getConfiguration("antigravity"),a=i.get("skillRepositories",[]);if(a.includes(t)){o.window.showInformationMessage(`Repository ${t} is already in your list.`);return}a.push(t),await i.update("skillRepositories",a,o.ConfigurationTarget.Global),s.refresh(),o.window.showInformationMessage(`Added remote repository: ${t}`)}),o.commands.registerCommand("antigravity.removeRemoteRepo",async t=>{if(!t.githubOwnerRepo)return;let i=t.githubOwnerRepo,a=o.workspace.getConfiguration("antigravity"),l=a.get("skillRepositories",[]),c=l.indexOf(i);c>-1&&(l.splice(c,1),await a.update("skillRepositories",l,o.ConfigurationTarget.Global),s.refresh(),o.window.showInformationMessage(`Removed repository: ${i}`))}))}function z(){}function j(){let e=o.workspace.getConfiguration("antigravity").get("customGlobalSkillsPath","").trim();return e?e.startsWith("~")&&(e=b.join(M.homedir(),e.slice(1))):e=b.join(M.homedir(),".gemini","antigravity","skills"),e}async function B(d){let e=j(),n=b.join(e,d),s=o.workspace.workspaceFolders;if(!s||s.length===0)return n;let r=[{label:"$(globe) Global",description:n,target:n},...s.map(i=>{let a=b.join(i.uri.fsPath,".gemini","antigravity","skills",d);return{label:`$(folder) Workspace (${i.name})`,description:a,target:a}})],t=await o.window.showQuickPick(r,{placeHolder:`Where should "${d}" be placed?`});return t?t.target:void 0}0&&(module.exports={activate,deactivate});
