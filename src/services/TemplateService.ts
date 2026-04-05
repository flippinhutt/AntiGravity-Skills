import * as fs from 'fs';
import * as path from 'path';

/**
 * Supported skill template types.
 */
export type TemplateType = 'Minimal' | 'Script-based' | 'Multi-agent';

/**
 * Structure of a skill template definition.
 */
export interface SkillTemplate {
    /** Name of the template. */
    name: TemplateType;
    /** Short description of what the template provides. */
    description: string;
    /** Key-value pairs of relative file paths and their contents. */
    files: { [relativePath: string]: string };
}

/**
 * Service for generating new Antigravity skills from predefined templates.
 */
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

    /**
     * Gets a list of all available skill templates.
     * @param skillName The name of the new skill.
     * @returns An array of SkillTemplate objects.
     */
    public getTemplates(skillName: string): SkillTemplate[] {
        return [
            this.getMinimalTemplate(skillName),
            this.getScriptBasedTemplate(skillName),
            this.getMultiAgentTemplate(skillName)
        ];
    }

    /**
     * Generates a new skill from a template and saves it to a target directory.
     * 
     * @param skillName Name of the skill to be generated.
     * @param templateName The template type to use.
     * @param targetDir The directory to save the skill into.
     * @throws Error if the template type is not found.
     */
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
