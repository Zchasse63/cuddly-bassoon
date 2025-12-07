/**
 * Extract All Tools from Category Files
 *
 * This script reads all tool category files and extracts tool definitions
 * to generate comprehensive documentation.
 *
 * Usage: npx tsx scripts/extract-all-tools.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExtractedTool {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredPermission: string;
  requiresConfirmation: boolean;
  estimatedDuration?: number;
  rateLimit?: number;
  tags: string[];
  inputFields: string[];
  outputFields: string[];
}

// Parse a tool definition from TypeScript source
function extractToolsFromSource(source: string, filename: string): ExtractedTool[] {
  const tools: ExtractedTool[] = [];

  // Match tool definition objects
  // Pattern: id: 'xxx', name: 'xxx', description: 'xxx', ...
  const definitionPattern = /(?:const\s+\w+(?:Def|Definition)\s*[^=]*=\s*\{|:\s*ToolDefinition[^{]*\{)([\s\S]*?)(?=\n\s*\};\s*\n|\n\s*\},\s*\n)/g;

  let match;
  while ((match = definitionPattern.exec(source)) !== null) {
    const block = match[1];

    // Extract id
    const idMatch = block.match(/id:\s*['"`]([^'"`]+)['"`]/);
    if (!idMatch) continue;

    const id = idMatch[1];

    // Extract name
    const nameMatch = block.match(/name:\s*['"`]([^'"`]+)['"`]/);
    const name = nameMatch ? nameMatch[1] : id.split('.').pop() || id;

    // Extract description
    const descMatch = block.match(/description:\s*['"`]([^'"`]+)['"`]/);
    const description = descMatch ? descMatch[1] : '';

    // Extract category
    const catMatch = block.match(/category:\s*['"`]([^'"`]+)['"`]/);
    const category = catMatch ? catMatch[1] : 'other';

    // Extract permission
    const permMatch = block.match(/requiredPermission:\s*['"`]([^'"`]+)['"`]/);
    const requiredPermission = permMatch ? permMatch[1] : 'read';

    // Extract requiresConfirmation
    const confirmMatch = block.match(/requiresConfirmation:\s*(true|false)/);
    const requiresConfirmation = confirmMatch ? confirmMatch[1] === 'true' : false;

    // Extract estimatedDuration
    const durationMatch = block.match(/estimatedDuration:\s*(\d+)/);
    const estimatedDuration = durationMatch ? parseInt(durationMatch[1]) : undefined;

    // Extract rateLimit
    const rateLimitMatch = block.match(/rateLimit:\s*(\d+)/);
    const rateLimit = rateLimitMatch ? parseInt(rateLimitMatch[1]) : undefined;

    // Extract tags
    const tagsMatch = block.match(/tags:\s*\[([^\]]*)\]/);
    const tags: string[] = [];
    if (tagsMatch) {
      const tagContent = tagsMatch[1];
      const tagPattern = /['"`]([^'"`]+)['"`]/g;
      let tagMatch;
      while ((tagMatch = tagPattern.exec(tagContent)) !== null) {
        tags.push(tagMatch[1]);
      }
    }

    tools.push({
      id,
      name,
      description,
      category,
      requiredPermission,
      requiresConfirmation,
      estimatedDuration,
      rateLimit,
      tags,
      inputFields: [],
      outputFields: [],
    });
  }

  // Also try a simpler pattern for inline definitions
  const simplePattern = /id:\s*['"`]([^'"`]+)['"`][^}]*name:\s*['"`]([^'"`]+)['"`][^}]*description:\s*['"`]([^'"`]+)['"`]/g;

  while ((match = simplePattern.exec(source)) !== null) {
    const [, id, name, description] = match;

    // Check if we already have this tool
    if (tools.some(t => t.id === id)) continue;

    // Extract category from surrounding context
    const catMatch = source.slice(Math.max(0, match.index - 500), match.index + 500).match(/category:\s*['"`]([^'"`]+)['"`]/);
    const category = catMatch ? catMatch[1] : 'other';

    // Extract tags
    const tagsMatch = source.slice(match.index, match.index + 500).match(/tags:\s*\[([^\]]*)\]/);
    const tags: string[] = [];
    if (tagsMatch) {
      const tagContent = tagsMatch[1];
      const tagPattern = /['"`]([^'"`]+)['"`]/g;
      let tagMatch;
      while ((tagMatch = tagPattern.exec(tagContent)) !== null) {
        tags.push(tagMatch[1]);
      }
    }

    tools.push({
      id,
      name,
      description,
      category,
      requiredPermission: 'read',
      requiresConfirmation: false,
      tags,
      inputFields: [],
      outputFields: [],
    });
  }

  return tools;
}

// Count tools registered in each file from the register function
function countRegisteredTools(source: string): number {
  // Look for patterns like: toolRegistry.register(
  const registerMatches = source.match(/toolRegistry\.register\(/g);
  return registerMatches ? registerMatches.length : 0;
}

async function main() {
  const categoriesDir = path.join(process.cwd(), 'src/lib/ai/tools/categories');
  const files = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

  console.log(`Found ${files.length} tool category files\n`);

  const allTools: ExtractedTool[] = [];
  const fileSummary: Array<{ file: string; registered: number; extracted: number }> = [];

  for (const file of files) {
    const filePath = path.join(categoriesDir, file);
    const source = fs.readFileSync(filePath, 'utf-8');

    const registered = countRegisteredTools(source);
    const tools = extractToolsFromSource(source, file);

    allTools.push(...tools);
    fileSummary.push({ file, registered, extracted: tools.length });

    console.log(`${file}: ${registered} registered, ${tools.length} extracted`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Total: ${allTools.length} tools extracted`);
  console.log(`Expected: ${fileSummary.reduce((sum, f) => sum + f.registered, 0)} tools registered`);
  console.log(`${'='.repeat(60)}\n`);

  // Group by category
  const byCategory = new Map<string, ExtractedTool[]>();
  for (const tool of allTools) {
    const existing = byCategory.get(tool.category) || [];
    existing.push(tool);
    byCategory.set(tool.category, existing);
  }

  console.log('Tools by category:');
  for (const [category, tools] of byCategory.entries()) {
    console.log(`  ${category}: ${tools.length} tools`);
  }

  // Write output
  const outputPath = path.join(process.cwd(), 'scripts/extracted-tools.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    totalTools: allTools.length,
    byCategory: Object.fromEntries(byCategory),
    tools: allTools,
  }, null, 2));

  console.log(`\nWrote tool data to ${outputPath}`);

  // Also write a summary markdown
  const summaryPath = path.join(process.cwd(), 'scripts/tools-summary.md');
  let summary = `# Extracted Tools Summary\n\nTotal: ${allTools.length} tools\n\n`;

  for (const [category, tools] of Array.from(byCategory.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    summary += `## ${category} (${tools.length} tools)\n\n`;
    for (const tool of tools.sort((a, b) => a.id.localeCompare(b.id))) {
      summary += `- **${tool.id}**: ${tool.name}\n  ${tool.description}\n\n`;
    }
  }

  fs.writeFileSync(summaryPath, summary);
  console.log(`Wrote summary to ${summaryPath}`);
}

main().catch(console.error);
