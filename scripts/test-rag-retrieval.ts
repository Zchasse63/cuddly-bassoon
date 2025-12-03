#!/usr/bin/env npx tsx
/**
 * RAG Retrieval Quality Testing
 * Tests search retrieval accuracy across all knowledge base categories
 */

import 'dotenv/config';

// Test questions mapped to expected categories (using actual KB category names)
const TEST_CASES: Array<{
  question: string;
  expectedCategories: string[];
  expectedKeywords: string[];
}> = [
  // Fundamentals
  {
    question: "What is the 70% rule in wholesaling?",
    expectedCategories: ["Fundamentals"],
    expectedKeywords: ["70%", "arv", "repair"],
  },
  {
    question: "How do I calculate Maximum Allowable Offer?",
    expectedCategories: ["Fundamentals", "Deal Analysis"],
    expectedKeywords: ["mao", "maximum", "allowable", "offer"],
  },
  {
    question: "What is ARV and how is it determined?",
    expectedCategories: ["Fundamentals", "Deal Analysis"],
    expectedKeywords: ["arv", "after repair value", "comps"],
  },

  // Deal Analysis
  {
    question: "How do I analyze a potential wholesale deal?",
    expectedCategories: ["Deal Analysis", "Fundamentals"],
    expectedKeywords: ["deal", "analyze", "profit"],
  },
  {
    question: "What are the key metrics for evaluating a property?",
    expectedCategories: ["Deal Analysis", "Fundamentals", "Market Analysis"],
    expectedKeywords: ["metrics", "evaluation", "property"],
  },

  // Filter System (actual KB category name)
  {
    question: "What is an underwater landlord filter?",
    expectedCategories: ["Filter System"],
    expectedKeywords: ["underwater", "landlord", "filter"],
  },
  {
    question: "How do I find motivated sellers?",
    expectedCategories: ["Filter System", "Fundamentals"],
    expectedKeywords: ["motivated", "seller", "distressed"],
  },
  {
    question: "What filters should I use for vacant properties?",
    expectedCategories: ["Filter System"],
    expectedKeywords: ["vacant", "filter", "property"],
  },

  // Buyer Intelligence
  {
    question: "How do I build a cash buyer's list?",
    expectedCategories: ["Buyer Intelligence"],
    expectedKeywords: ["buyer", "cash", "list"],
  },
  {
    question: "What do cash buyers look for in a deal?",
    expectedCategories: ["Buyer Intelligence"],
    expectedKeywords: ["buyer", "criteria", "deal"],
  },

  // Negotiations (actual KB category)
  {
    question: "How do I negotiate with a motivated seller?",
    expectedCategories: ["Negotiations", "Fundamentals"],
    expectedKeywords: ["negotiate", "seller", "motivated"],
  },
  {
    question: "What signs indicate a seller is truly motivated?",
    expectedCategories: ["Negotiations", "Fundamentals"],
    expectedKeywords: ["motivated", "seller", "signs"],
  },

  // Market Analysis
  {
    question: "How do I identify good wholesale markets?",
    expectedCategories: ["Market Analysis"],
    expectedKeywords: ["market", "wholesale", "area"],
  },

  // Outreach & Communication (actual KB category name)
  {
    question: "What's the best cold calling script for sellers?",
    expectedCategories: ["Outreach & Communication"],
    expectedKeywords: ["cold call", "script", "seller"],
  },
  {
    question: "How do I run a direct mail campaign?",
    expectedCategories: ["Outreach & Communication"],
    expectedKeywords: ["direct mail", "campaign", "marketing"],
  },

  // Risk Factors
  {
    question: "What are the common deal killers in wholesaling?",
    expectedCategories: ["Risk Factors"],
    expectedKeywords: ["deal killer", "risk", "avoid"],
  },
  {
    question: "How do I identify title issues before closing?",
    expectedCategories: ["Risk Factors", "Legal & Compliance"],
    expectedKeywords: ["title", "liens", "issues"],
  },

  // Legal & Compliance
  {
    question: "What should be in a wholesale assignment contract?",
    expectedCategories: ["Legal & Compliance"],
    expectedKeywords: ["assignment", "contract", "legal"],
  },
  {
    question: "Is double closing legal in all states?",
    expectedCategories: ["Legal & Compliance"],
    expectedKeywords: ["double close", "legal", "states"],
  },

  // Case Studies
  {
    question: "Show me a real example of a successful wholesale deal",
    expectedCategories: ["Case Studies & Examples"],
    expectedKeywords: ["example", "case study", "success"],
  },
];

interface SearchResult {
  chunkId: string;
  documentId: string;
  content: string;
  similarity: number;
  metadata: {
    title: string;
    category: string;
    slug: string;
    sectionHeaders: string[];
    chunkIndex: number;
  };
}

interface TestResult {
  question: string;
  passed: boolean;
  results: SearchResult[];
  expectedCategories: string[];
  foundCategories: string[];
  latencyMs: number;
  issues: string[];
}

async function runTest(testCase: typeof TEST_CASES[0]): Promise<TestResult> {
  const start = Date.now();
  const issues: string[] = [];

  try {
    const response = await fetch('http://localhost:3000/api/rag/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: testCase.question, options: { limit: 5 } }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const results: SearchResult[] = data.results || [];
    const latencyMs = Date.now() - start;

    // Extract found categories from metadata
    const foundCategories = [...new Set(results.map(r => r.metadata?.category).filter(Boolean))];

    // Check if expected categories are found
    const categoryMatch = testCase.expectedCategories.some(
      expected => foundCategories.some(found =>
        found.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(found.toLowerCase())
      )
    );

    // Check if any expected keywords appear in results
    const allContent = results.map(r =>
      `${r.metadata?.title || ''} ${r.content || ''} ${r.metadata?.category || ''}`.toLowerCase()
    ).join(' ');
    
    const keywordMatches = testCase.expectedKeywords.filter(kw => 
      allContent.includes(kw.toLowerCase())
    );
    const keywordMatch = keywordMatches.length >= 1;

    // Check similarity scores
    const hasRelevantResults = results.some(r => r.similarity >= 0.3);

    if (!categoryMatch) {
      issues.push(`Expected categories [${testCase.expectedCategories.join(', ')}] but got [${foundCategories.join(', ')}]`);
    }

    if (!keywordMatch) {
      issues.push(`No expected keywords found: [${testCase.expectedKeywords.join(', ')}]`);
    }

    if (!hasRelevantResults && results.length > 0) {
      issues.push(`Low relevance scores: max ${Math.max(...results.map(r => r.similarity)).toFixed(3)}`);
    }

    if (results.length === 0) {
      issues.push('No results returned');
    }

    // Embedding generation adds ~300ms, so target is 500ms for end-to-end
    if (latencyMs > 500) {
      issues.push(`Slow response: ${latencyMs}ms (target < 500ms)`);
    }

    return {
      question: testCase.question,
      passed: categoryMatch && keywordMatch && hasRelevantResults,
      results,
      expectedCategories: testCase.expectedCategories,
      foundCategories,
      latencyMs,
      issues,
    };
  } catch (error) {
    return {
      question: testCase.question,
      passed: false,
      results: [],
      expectedCategories: testCase.expectedCategories,
      foundCategories: [],
      latencyMs: Date.now() - start,
      issues: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

async function main() {
  console.log('🧪 RAG Retrieval Quality Testing\n');
  console.log(`Running ${TEST_CASES.length} test cases...\n`);
  console.log('='.repeat(80));

  const results: TestResult[] = [];

  for (const testCase of TEST_CASES) {
    const result = await runTest(testCase);
    results.push(result);

    const status = result.passed ? '✅' : '❌';
    console.log(`\n${status} ${result.question}`);
    console.log(`   Categories: [${result.foundCategories.join(', ')}]`);
    console.log(`   Latency: ${result.latencyMs}ms | Results: ${result.results.length}`);
    
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
    }
  }

  console.log('\n' + '='.repeat(80));
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const avgLatency = Math.round(results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length);
  const passRate = Math.round((passed / results.length) * 100);

  console.log('\n📊 Summary\n');
  console.log(`   Pass Rate: ${passRate}% (${passed}/${results.length})`);
  console.log(`   Avg Latency: ${avgLatency}ms`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);

  // Category coverage
  const allFoundCategories = [...new Set(results.flatMap(r => r.foundCategories))];
  console.log(`\n📁 Categories Found: ${allFoundCategories.length}`);
  allFoundCategories.forEach(cat => console.log(`   - ${cat}`));

  // Failed tests detail
  if (failed > 0) {
    console.log('\n❌ Failed Tests:\n');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   • ${r.question}`);
      r.issues.forEach(i => console.log(`     ${i}`));
    });
  }

  // Exit with error code if tests failed
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);

