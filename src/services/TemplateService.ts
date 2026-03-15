import * as fs from 'fs';
import * as path from 'path';

export type TemplateType = 'Minimal' | 'Script-based' | 'Multi-agent';

export interface SkillTemplate {
    name: TemplateType;
    description: string;
    files: { [relativePath: string]: string };
}

export class TemplateService {
    
    private getMinimalTemplate(skillName: string): SkillTemplate {
        return {
            name: 'Minimal',
            description: 'A basic SKILL.md with frontmatter.',
            files: {
                'SKILL.md': `---
name: ${skillName}
description: Write a description here
---

# Instructions

Write your agent instructions here.
`
            }
        };
    }

    private getScriptBasedTemplate(skillName: string): SkillTemplate {
        return {
            name: 'Script-based',
            description: 'Includes a SKILL.md and a scripts/ folder.',
            files: {
                'SKILL.md': `---
name: ${skillName}
description: Write a description here
---

# Instructions

When using this skill, you can execute the helper script located in \`scripts/run.sh\`.
`,
                'scripts/run.sh': `#!/bin/bash
echo "Hello from ${skillName}!"
`
            }
        };
    }

    private getMultiAgentTemplate(skillName: string): SkillTemplate {
        return {
            name: 'Multi-agent',
            description: 'Scaffolds roles for complex agent interactions.',
            files: {
                'SKILL.md': `---
name: ${skillName}
description: Multi-agent coordination skill
---

# Instructions

This skill involves multiple agents. See the \`agents/\` folder for specific roles.
`,
                'agents/planner.md': `# Planner Agent
Analyze the user request and break it down into steps.
`,
                'agents/executor.md': `# Executor Agent
Run the steps defined by the Planner.
`
            }
        };
    }

    public getTemplates(skillName: string): SkillTemplate[] {
        return [
            this.getMinimalTemplate(skillName),
            this.getScriptBasedTemplate(skillName),
            this.getMultiAgentTemplate(skillName)
        ];
    }

    public async generateTemplate(skillName: string, templateName: TemplateType, targetDir: string): Promise<void> {
        const templates = this.getTemplates(skillName);
        const template = templates.find(t => t.name === templateName);

        if (!template) {
            throw new Error(`Template "${templateName}" not found.`);
        }

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        for (const [relativePath, content] of Object.entries(template.files)) {
            const absolutePath = path.join(targetDir, relativePath);
            const dirName = path.dirname(absolutePath);

            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, { recursive: true });
            }

            fs.writeFileSync(absolutePath, content);
        }
    }
}
