/**
 * Generate Complete AI Tool Documentation
 *
 * Uses extracted-tools.json to generate comprehensive documentation
 * for ALL tools in the platform.
 *
 * Usage: npx tsx scripts/generate-complete-tool-docs.ts
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
}

interface ToolData {
  totalTools: number;
  byCategory: Record<string, ExtractedTool[]>;
  tools: ExtractedTool[];
}

// Category metadata for documentation
const CATEGORY_INFO: Record<string, {
  displayName: string;
  subcategory: string;
  description: string;
  relatedDocs: string[];
  useCases: string[];
}> = {
  deal_analysis: {
    displayName: 'Deal Analysis Tools',
    subcategory: 'Financial Analysis',
    description: 'Tools for analyzing wholesale deals, calculating MAO, ARV, and profit potential.',
    relatedDocs: ['maximum-allowable-offer-formula', 'arv-calculation-methods', 'deal-analysis-framework'],
    useCases: ['Calculate MAO for a property', 'Analyze deal profitability', 'Score deal quality'],
  },
  property_search: {
    displayName: 'Property Search Tools',
    subcategory: 'Property Discovery',
    description: 'Tools for finding properties, applying filters, and managing saved searches.',
    relatedDocs: ['first-search-workflow', 'rentcast-overview', 'filter-absentee-owner'],
    useCases: ['Find properties by location', 'Filter by motivation indicators', 'Save and manage searches'],
  },
  buyer_management: {
    displayName: 'Buyer Management Tools',
    subcategory: 'CRM & Buyers',
    description: 'Tools for managing buyer relationships, matching, and analysis.',
    relatedDocs: ['buyer-management-workflow', 'building-buyer-list', 'buyer-types-explained'],
    useCases: ['Match buyers to properties', 'Analyze buyer activity', 'Score buyer fit'],
  },
  predictive: {
    displayName: 'Predictive Analytics Tools',
    subcategory: 'AI & Predictions',
    description: 'AI-powered tools for predicting seller motivation, deal outcomes, and optimal pricing.',
    relatedDocs: ['motivation-scoring-workflow', 'interpreting-motivation-scores', 'motivation-scoring-fundamentals'],
    useCases: ['Score seller motivation', 'Predict deal close probability', 'Calculate optimal offer price'],
  },
  crm: {
    displayName: 'CRM & Lead Tools',
    subcategory: 'Lead Management',
    description: 'Tools for managing leads, tracking engagement, and organizing your pipeline.',
    relatedDocs: ['crm-pipeline-workflow', 'motivation-scoring-fundamentals'],
    useCases: ['Organize leads into lists', 'Track engagement history', 'Prioritize outreach'],
  },
  data_enrichment: {
    displayName: 'Skip Trace & Enrichment Tools',
    subcategory: 'Contact Discovery',
    description: 'Tools for finding contact information and enriching lead data.',
    relatedDocs: ['skip-trace-workflow'],
    useCases: ['Find phone numbers and emails', 'Validate contact info', 'Enrich lead records'],
  },
  market_analysis: {
    displayName: 'Market Analysis Tools',
    subcategory: 'Market Intelligence',
    description: 'Tools for analyzing markets, trends, velocity, and comparable sales.',
    relatedDocs: ['market-analysis-fundamentals', 'rentcast-market-data', 'interpreting-market-velocity'],
    useCases: ['Analyze market trends', 'Find comparable sales', 'Assess market velocity'],
  },
  deal_pipeline: {
    displayName: 'Deal Pipeline Tools',
    subcategory: 'Deal Management',
    description: 'Tools for managing deals through your pipeline from prospect to close.',
    relatedDocs: ['deal-pipeline-workflow', 'deal-analysis-framework'],
    useCases: ['Track deal stages', 'Manage deal activities', 'Forecast pipeline'],
  },
  permits: {
    displayName: 'Permit Analysis Tools',
    subcategory: 'Property Intelligence',
    description: 'Tools for analyzing construction permits and renovation history.',
    relatedDocs: ['shovels-overview', 'shovels-permit-data', 'interpreting-permit-activity'],
    useCases: ['Check permit history', 'Identify renovation activity', 'Assess property condition'],
  },
  contractors: {
    displayName: 'Contractor Intelligence Tools',
    subcategory: 'Property Intelligence',
    description: 'Tools for finding and analyzing contractors from permit data.',
    relatedDocs: ['shovels-overview', 'repair-estimation-guide'],
    useCases: ['Find contractors by area', 'Analyze contractor quality', 'Get contractor history'],
  },
  map: {
    displayName: 'Map & Geographic Tools',
    subcategory: 'Geographic Analysis',
    description: 'Tools for map-based analysis, heat mapping, and geographic intelligence.',
    relatedDocs: ['census-overview', 'heat-map-workflow'],
    useCases: ['Create heat maps', 'Analyze areas', 'Route planning'],
  },
  communication: {
    displayName: 'Communication Tools',
    subcategory: 'Outreach & Notifications',
    description: 'Tools for SMS, email, and other communication channels.',
    relatedDocs: ['sms-campaign-workflow', 'email-sequence-workflow'],
    useCases: ['Send SMS messages', 'Create email sequences', 'Track communication'],
  },
  document_generation: {
    displayName: 'Document Generation Tools',
    subcategory: 'Documents',
    description: 'Tools for generating contracts, reports, and other documents.',
    relatedDocs: ['document-generation-workflow', 'wholesale-contracts-101'],
    useCases: ['Generate contracts', 'Create reports', 'Export data'],
  },
  batch_operations: {
    displayName: 'Batch Operations Tools',
    subcategory: 'Efficiency',
    description: 'Tools for processing multiple records at once.',
    relatedDocs: ['batch-processing-workflow'],
    useCases: ['Batch skip trace', 'Bulk updates', 'Mass operations'],
  },
  automation: {
    displayName: 'Automation Tools',
    subcategory: 'Workflow Automation',
    description: 'Tools for automating repetitive tasks and workflows.',
    relatedDocs: ['automation-setup-workflow'],
    useCases: ['Auto follow-up', 'Deal stage triggers', 'Automated alerts'],
  },
  intelligence: {
    displayName: 'Intelligence Tools',
    subcategory: 'AI Analysis',
    description: 'Advanced AI tools for property and deal intelligence.',
    relatedDocs: ['combining-multiple-signals', 'deal-analysis-framework'],
    useCases: ['Deep analysis', 'Pattern recognition', 'Intelligence reports'],
  },
  portfolio: {
    displayName: 'Portfolio Tools',
    subcategory: 'Portfolio Management',
    description: 'Tools for managing and analyzing property portfolios.',
    relatedDocs: ['portfolio-analysis-workflow'],
    useCases: ['Portfolio overview', 'Performance tracking', 'Portfolio optimization'],
  },
  advanced_search: {
    displayName: 'Advanced Search Tools',
    subcategory: 'Property Discovery',
    description: 'Sophisticated search tools for complex property matching.',
    relatedDocs: ['advanced-search-workflow', 'first-search-workflow'],
    useCases: ['Similar property search', 'Pattern matching', 'Complex criteria'],
  },
  integrations: {
    displayName: 'Integration Tools',
    subcategory: 'External Integrations',
    description: 'Tools for connecting with external services and APIs.',
    relatedDocs: ['integration-setup-workflow'],
    useCases: ['CRM sync', 'Data import', 'External connections'],
  },
  verticals: {
    displayName: 'Vertical Tools',
    subcategory: 'Specialization',
    description: 'Tools for specific real estate verticals and niches.',
    relatedDocs: [],
    useCases: ['Vertical-specific analysis', 'Niche strategies'],
  },
  utility: {
    displayName: 'Utility Tools',
    subcategory: 'System',
    description: 'Utility tools for system operations and data management.',
    relatedDocs: [],
    useCases: ['Data conversion', 'System status', 'Utility operations'],
  },
  reporting: {
    displayName: 'Reporting & Analytics Tools',
    subcategory: 'Analytics',
    description: 'Tools for generating reports, tracking KPIs, and analyzing performance.',
    relatedDocs: ['reporting-workflow'],
    useCases: ['Generate reports', 'Track KPIs', 'Analyze trends'],
  },
};

// Convert tool ID to slug
function toolIdToSlug(id: string): string {
  return `tool-${id.replace(/\./g, '-').replace(/_/g, '-')}`;
}

// Convert category to slug
function categoryToSlug(category: string): string {
  return category.replace(/_/g, '-');
}

// Generate tags for a tool
function generateTags(tool: ExtractedTool): string[] {
  const tags = new Set<string>();

  // Add original tags with tool- prefix
  tool.tags.forEach(tag => tags.add(`tool-${tag}`));

  // Add category tag
  tags.add(`tool-${categoryToSlug(tool.category)}`);

  // Add action tags based on name/description
  const text = (tool.name + ' ' + tool.description).toLowerCase();
  if (text.includes('search') || text.includes('find')) tags.add('action-search');
  if (text.includes('analyze') || text.includes('analysis')) tags.add('action-analyze');
  if (text.includes('calculate')) tags.add('action-calculate');
  if (text.includes('predict')) tags.add('action-predict');
  if (text.includes('score')) tags.add('action-score');
  if (text.includes('match')) tags.add('action-match');
  if (text.includes('export')) tags.add('action-export');
  if (text.includes('generate')) tags.add('action-generate');
  if (text.includes('create')) tags.add('action-create');
  if (text.includes('track')) tags.add('action-track');
  if (text.includes('report')) tags.add('action-report');

  // Add concept tags
  if (text.includes('mao')) tags.add('concept-mao');
  if (text.includes('arv')) tags.add('concept-arv');
  if (text.includes('motivation')) tags.add('concept-motivation');
  if (text.includes('equity')) tags.add('concept-equity');
  if (text.includes('permit')) tags.add('signal-permit');

  // Add data source tags
  if (text.includes('rentcast')) tags.add('data-rentcast');
  if (text.includes('shovels')) tags.add('data-shovels');
  if (text.includes('census')) tags.add('data-census');

  return Array.from(tags).slice(0, 15); // Limit to 15 tags
}

// Generate tool markdown
function generateToolMarkdown(tool: ExtractedTool): string {
  const slug = toolIdToSlug(tool.id);
  const tags = generateTags(tool);
  const catInfo = CATEGORY_INFO[tool.category] || {
    displayName: tool.category,
    subcategory: 'Other',
    description: '',
    relatedDocs: [],
    useCases: [],
  };

  const frontmatter = `---
slug: ${slug}
title: "${tool.name} - AI Tool Documentation"
category: AI Tools
subcategory: ${catInfo.displayName}
tags: [${tags.join(', ')}]
related_docs: [${catInfo.relatedDocs.slice(0, 3).join(', ')}]
difficulty_level: beginner
tool_id: ${tool.id}
---`;

  const content = `
# ${tool.name}

## Quick Reference

| Property | Value |
|----------|-------|
| **Tool ID** | \`${tool.id}\` |
| **Category** | ${catInfo.displayName} |
| **Permission** | ${tool.requiredPermission} |
| **Confirmation Required** | ${tool.requiresConfirmation ? 'Yes' : 'No'} |
${tool.estimatedDuration ? `| **Typical Duration** | ${tool.estimatedDuration}ms |` : ''}
${tool.rateLimit ? `| **Rate Limit** | ${tool.rateLimit} calls/minute |` : ''}

## Description

${tool.description}

## When to Use

Use **${tool.name}** when you need to:
${generateUseCases(tool, catInfo)}

## Example Prompts

${generateExamples(tool)}

## Tips

${generateTips(tool, catInfo)}
`;

  return frontmatter + content;
}

function generateUseCases(tool: ExtractedTool, catInfo: typeof CATEGORY_INFO[string]): string {
  const useCases: string[] = [];

  // Add category-specific use cases
  if (catInfo.useCases.length > 0) {
    useCases.push(...catInfo.useCases.slice(0, 2).map(uc => `- ${uc}`));
  }

  // Add tool-specific use cases based on description
  const desc = tool.description.toLowerCase();
  if (desc.includes('search') || desc.includes('find')) {
    useCases.push('- Find specific records matching criteria');
  }
  if (desc.includes('analyze')) {
    useCases.push('- Get detailed analysis and insights');
  }
  if (desc.includes('create') || desc.includes('generate')) {
    useCases.push('- Create new records or content');
  }
  if (desc.includes('track') || desc.includes('monitor')) {
    useCases.push('- Track progress and changes over time');
  }

  return useCases.slice(0, 4).join('\n') || '- Perform the operation described above';
}

function generateExamples(tool: ExtractedTool): string {
  const examples: string[] = [];
  const name = tool.name.toLowerCase();
  const desc = tool.description.toLowerCase();

  // Generate contextual examples
  if (name.includes('search') || name.includes('find')) {
    examples.push(`- "Search for [criteria]"`);
    examples.push(`- "Find [items] matching [conditions]"`);
  } else if (name.includes('analyze')) {
    examples.push(`- "Analyze [subject]"`);
    examples.push(`- "What's the analysis for [item]?"`);
  } else if (name.includes('score') || name.includes('calculate')) {
    examples.push(`- "Calculate the ${name.replace(/score|calculate/gi, '').trim()} for [item]"`);
    examples.push(`- "What's the score for [subject]?"`);
  } else if (name.includes('predict')) {
    examples.push(`- "Predict [outcome] for [subject]"`);
    examples.push(`- "What's the likelihood of [event]?"`);
  } else if (name.includes('generate') || name.includes('create')) {
    examples.push(`- "Generate a ${name.replace(/generate|create/gi, '').trim()} for [subject]"`);
    examples.push(`- "Create [item] with [parameters]"`);
  } else if (name.includes('get') || name.includes('list')) {
    examples.push(`- "Get ${name.replace(/get|list/gi, '').trim()}"`);
    examples.push(`- "Show me [items]"`);
  } else {
    examples.push(`- "Use ${tool.name} for [subject]"`);
    examples.push(`- "${tool.description.split('.')[0]}"`);
  }

  return examples.map(e => e).join('\n');
}

function generateTips(tool: ExtractedTool, catInfo: typeof CATEGORY_INFO[string]): string {
  const tips: string[] = [];

  if (tool.requiresConfirmation) {
    tips.push('- This tool requires confirmation before executing');
  }

  if (tool.rateLimit && tool.rateLimit < 20) {
    tips.push('- Rate limited - use sparingly for best performance');
  }

  if (tool.category === 'predictive') {
    tips.push('- Combine with other data sources for more accurate predictions');
    tips.push('- Higher confidence scores indicate more reliable results');
  } else if (tool.category === 'deal_analysis') {
    tips.push('- Verify ARV with recent comparable sales');
    tips.push('- Include repair estimates for accurate MAO calculations');
  } else if (tool.category === 'buyer_management') {
    tips.push('- Keep buyer preferences updated for accurate matching');
  }

  return tips.length > 0 ? tips.join('\n') : '- Provide complete input data for best results';
}

// Generate category overview
function generateCategoryOverview(category: string, tools: ExtractedTool[]): string {
  const catInfo = CATEGORY_INFO[category] || {
    displayName: category,
    subcategory: 'Other',
    description: `Tools in the ${category} category.`,
    relatedDocs: [],
    useCases: [],
  };

  const allTags = new Set<string>();
  tools.forEach(t => generateTags(t).forEach(tag => allTags.add(tag)));

  const frontmatter = `---
slug: tool-category-${categoryToSlug(category)}
title: "${catInfo.displayName} - Complete Reference"
category: AI Tools
subcategory: ${catInfo.subcategory}
tags: [${Array.from(allTags).slice(0, 10).join(', ')}]
related_docs: [${catInfo.relatedDocs.slice(0, 3).join(', ')}]
difficulty_level: beginner
---`;

  const toolList = tools.map(t => `
### ${t.name}

**ID**: \`${t.id}\`

${t.description}
`).join('\n');

  const content = `
# ${catInfo.displayName}

## Overview

${catInfo.description}

**Total Tools**: ${tools.length}

## Available Tools

${toolList}

## Common Use Cases

${catInfo.useCases.map(uc => `- ${uc}`).join('\n') || 'See individual tool documentation for use cases.'}

## Related Documentation

${catInfo.relatedDocs.map(doc => `- [${doc}](${doc})`).join('\n') || 'See main documentation index.'}
`;

  return frontmatter + content;
}

// Generate main index
function generateMainIndex(toolData: ToolData): string {
  const frontmatter = `---
slug: ai-tools-overview
title: "AI Tools Reference - Complete Platform Documentation"
category: AI Tools
subcategory: Overview
tags: [tool-overview, ai-tools, platform-tools]
related_docs: [first-search-workflow, deal-pipeline-workflow, crm-pipeline-workflow]
difficulty_level: beginner
---`;

  const categoryList = Object.entries(toolData.byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, tools]) => {
      const catInfo = CATEGORY_INFO[category] || { displayName: category };
      return `- **[${catInfo.displayName}](tool-category-${categoryToSlug(category)})**: ${tools.length} tools`;
    })
    .join('\n');

  const content = `
# AI Tools Reference

## Overview

This platform provides **${toolData.totalTools} AI-powered tools** across ${Object.keys(toolData.byCategory).length} categories to help you find deals, manage buyers, analyze markets, and close more wholesale transactions.

## Tool Categories

${categoryList}

## How to Use These Tools

### Natural Language Requests

Simply describe what you want to do. The AI will select the appropriate tools automatically.

**Examples:**
- "Find high-equity properties in Miami"
- "Calculate MAO for this property"
- "Match buyers to this deal"
- "Score the seller's motivation"

### Tool Selection

The AI automatically selects tools based on your request. You don't need to know tool IDs - just describe your goal.

### Confirmation

Some tools that modify data require confirmation before executing.

## Quick Start

1. **Search**: "Find properties in [location]"
2. **Analyze**: "Analyze the deal for [address]"
3. **Score**: "Score seller motivation for [property]"
4. **Match**: "Find buyers for this property"

## Related Documentation

- [Getting Started Workflow](first-search-workflow)
- [Deal Analysis Framework](deal-analysis-framework)
- [CRM Pipeline Guide](crm-pipeline-workflow)
`;

  return frontmatter + content;
}

async function main() {
  // Load extracted tools
  const toolDataPath = path.join(process.cwd(), 'scripts/extracted-tools.json');
  if (!fs.existsSync(toolDataPath)) {
    console.error('Error: Run extract-all-tools.ts first');
    process.exit(1);
  }

  const toolData: ToolData = JSON.parse(fs.readFileSync(toolDataPath, 'utf-8'));
  console.log(`Loaded ${toolData.totalTools} tools from extraction\n`);

  const outputDir = path.join(process.cwd(), 'knowledge-base/11-ai-tools');

  // Clear existing generated docs (but keep manually created ones)
  console.log('Generating documentation...\n');

  let totalDocs = 0;

  // Generate category overviews and individual tool docs
  for (const [category, tools] of Object.entries(toolData.byCategory)) {
    const categorySlug = categoryToSlug(category);
    const categoryDir = path.join(outputDir, categorySlug);

    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Generate category overview
    const overviewContent = generateCategoryOverview(category, tools);
    const overviewPath = path.join(categoryDir, '_overview.md');
    fs.writeFileSync(overviewPath, overviewContent);
    totalDocs++;

    // Generate individual tool docs
    for (const tool of tools) {
      const toolContent = generateToolMarkdown(tool);
      const toolSlug = toolIdToSlug(tool.id);
      const toolPath = path.join(categoryDir, `${toolSlug}.md`);
      fs.writeFileSync(toolPath, toolContent);
      totalDocs++;
    }

    console.log(`  ${category}: ${tools.length + 1} docs`);
  }

  // Generate main index
  const indexContent = generateMainIndex(toolData);
  const indexPath = path.join(outputDir, '_overview.md');
  fs.writeFileSync(indexPath, indexContent);
  totalDocs++;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generated ${totalDocs} documentation files`);
  console.log(`  - ${Object.keys(toolData.byCategory).length} category overviews`);
  console.log(`  - ${toolData.totalTools} tool docs`);
  console.log(`  - 1 main index`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);
