/**
 * Sensitivity Filter Service
 * Detects and blocks forbidden topics in outreach messages
 * Ensures compliance with ethical communication standards
 */

import {
  SensitivityCheckResult,
  DetectedTopic,
  SensitivityCategory,
  SensitivityLevel,
} from './types';

// ============================================================================
// Forbidden Topic Patterns
// ============================================================================

interface TopicPattern {
  category: SensitivityCategory;
  patterns: RegExp[];
  severity: 'caution' | 'forbidden';
}

const TOPIC_PATTERNS: TopicPattern[] = [
  {
    category: 'divorce',
    severity: 'forbidden',
    patterns: [
      /\bdivorc(e|ed|ing)\b/i,
      /\bseparation\b/i,
      /\bmarital\s+(issues?|problems?|troubles?)\b/i,
      /\bsplit(ting)?\s+up\b/i,
      /\bex[\s-]?(wife|husband|spouse)\b/i,
      /\bcustody\b/i,
    ],
  },
  {
    category: 'foreclosure',
    severity: 'forbidden',
    patterns: [
      /\bforeclos(ure|ed|ing)\b/i,
      /\bpre[\s-]?foreclosure\b/i,
      /\bbank\s+taking\b/i,
      /\blosing\s+(your|the)\s+home\b/i,
      /\bdefault(ed|ing)?\s+on\s+(mortgage|loan)\b/i,
      /\bshort\s+sale\b/i,
      /\bunderwater\s+(mortgage|home)\b/i,
    ],
  },
  {
    category: 'death_probate',
    severity: 'forbidden',
    patterns: [
      /\bdeath\b/i,
      /\bdied\b/i,
      /\bdeceased\b/i,
      /\bprobate\b/i,
      /\binherit(ed|ance)?\b/i,
      /\bestate\s+sale\b/i,
      /\bpassed\s+away\b/i,
      /\bloss\s+of\s+(a\s+)?loved\s+one\b/i,
      /\bfuneral\b/i,
      /\bgriev(e|ing)\b/i,
    ],
  },
  {
    category: 'health',
    severity: 'forbidden',
    patterns: [
      /\bsick(ness)?\b/i,
      /\bill(ness)?\b/i,
      /\bdisab(led|ility)\b/i,
      /\bmedical\s+(issues?|problems?|bills?|expenses?)\b/i,
      /\bhospital(ized)?\b/i,
      /\bcancer\b/i,
      /\bchronic\s+(illness|condition)\b/i,
      /\bhealth\s+(issues?|problems?|crisis)\b/i,
      /\bnursing\s+home\b/i,
      /\bassisted\s+living\b/i,
    ],
  },
  {
    category: 'legal',
    severity: 'forbidden',
    patterns: [
      /\blawsuit\b/i,
      /\blitigation\b/i,
      /\blegal\s+(issues?|problems?|troubles?)\b/i,
      /\bcourt\s+(case|order|hearing)\b/i,
      /\bjudgment\b/i,
      /\blien\b/i,
      /\btax\s+lien\b/i,
      /\bcode\s+violation\b/i,
      /\bcriminal\b/i,
      /\barrest(ed)?\b/i,
    ],
  },
  {
    category: 'financial_distress',
    severity: 'caution',
    patterns: [
      /\bbankrupt(cy)?\b/i,
      /\bdebt\b/i,
      /\bfinancial\s+(distress|hardship|difficulties?|problems?|troubles?)\b/i,
      /\bcan'?t\s+(afford|pay)\b/i,
      /\bstruggling\s+(financially|to\s+pay)\b/i,
      /\bbehind\s+on\s+(payments?|bills?|mortgage)\b/i,
      /\bcollection(s)?\b/i,
      /\bcreditor\b/i,
    ],
  },
];

// ============================================================================
// Sensitivity Checking
// ============================================================================

/**
 * Check message content for sensitive topics
 */
export function checkSensitivity(content: string): SensitivityCheckResult {
  const detectedTopics: DetectedTopic[] = [];
  let highestSeverity: SensitivityLevel = 'safe';

  for (const topicPattern of TOPIC_PATTERNS) {
    for (const pattern of topicPattern.patterns) {
      const matches = content.matchAll(new RegExp(pattern, 'gi'));

      for (const match of matches) {
        if (match.index !== undefined) {
          detectedTopics.push({
            topic: topicPattern.category,
            category: topicPattern.category,
            matched_text: match[0],
            position: {
              start: match.index,
              end: match.index + match[0].length,
            },
          });

          // Update highest severity
          if (topicPattern.severity === 'forbidden') {
            highestSeverity = 'forbidden';
          } else if (topicPattern.severity === 'caution' && highestSeverity === 'safe') {
            highestSeverity = 'caution';
          }
        }
      }
    }
  }

  // Remove duplicate detections at same position
  const uniqueTopics = deduplicateTopics(detectedTopics);

  return {
    is_safe: highestSeverity === 'safe',
    sensitivity_level: highestSeverity,
    detected_topics: uniqueTopics,
    suggestions: generateSuggestions(uniqueTopics),
  };
}

/**
 * Remove duplicate topic detections at overlapping positions
 */
function deduplicateTopics(topics: DetectedTopic[]): DetectedTopic[] {
  const seen = new Set<string>();
  return topics.filter((topic) => {
    const key = `${topic.position.start}-${topic.position.end}-${topic.category}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Generate suggestions for detected issues
 */
function generateSuggestions(topics: DetectedTopic[]): string[] {
  const suggestions: string[] = [];
  const categories = new Set(topics.map((t) => t.category));

  if (categories.has('divorce')) {
    suggestions.push('Remove references to marital status or relationship changes.');
  }
  if (categories.has('foreclosure')) {
    suggestions.push(
      'Avoid mentioning foreclosure or mortgage default. Focus on general property interest.'
    );
  }
  if (categories.has('death_probate')) {
    suggestions.push('Remove references to death, probate, or inheritance. Keep message neutral.');
  }
  if (categories.has('health')) {
    suggestions.push(
      'Remove health-related references. Focus on property, not personal circumstances.'
    );
  }
  if (categories.has('legal')) {
    suggestions.push('Avoid legal terminology. Keep the message simple and non-threatening.');
  }
  if (categories.has('financial_distress')) {
    suggestions.push('Soften financial language. Focus on opportunity rather than distress.');
  }

  if (suggestions.length === 0 && topics.length > 0) {
    suggestions.push('Review flagged content and consider rephrasing to be more neutral.');
  }

  return suggestions;
}

// ============================================================================
// Content Sanitization
// ============================================================================

/**
 * Attempt to sanitize content by removing sensitive phrases
 * Returns null if content cannot be safely sanitized
 */
export function sanitizeContent(content: string): {
  sanitized: string | null;
  removed: string[];
  canSanitize: boolean;
} {
  const check = checkSensitivity(content);

  if (check.is_safe) {
    return { sanitized: content, removed: [], canSanitize: true };
  }

  // If forbidden topics detected, cannot auto-sanitize
  if (check.sensitivity_level === 'forbidden') {
    return {
      sanitized: null,
      removed: check.detected_topics.map((t) => t.matched_text),
      canSanitize: false,
    };
  }

  // For caution-level, attempt to remove phrases
  let sanitized = content;
  const removed: string[] = [];

  // Sort by position descending to avoid index shifting
  const sortedTopics = [...check.detected_topics].sort(
    (a, b) => b.position.start - a.position.start
  );

  for (const topic of sortedTopics) {
    const before = sanitized.substring(0, topic.position.start);
    const after = sanitized.substring(topic.position.end);
    sanitized = before + after;
    removed.push(topic.matched_text);
  }

  // Clean up extra whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Re-check sanitized content
  const recheck = checkSensitivity(sanitized);

  return {
    sanitized: recheck.is_safe ? sanitized : null,
    removed,
    canSanitize: recheck.is_safe,
  };
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if content is safe to send
 */
export function isSafeToSend(content: string): boolean {
  const check = checkSensitivity(content);
  return check.is_safe;
}

/**
 * Check if content requires review (caution level)
 */
export function requiresReview(content: string): boolean {
  const check = checkSensitivity(content);
  return check.sensitivity_level === 'caution';
}

/**
 * Check if content is blocked (forbidden level)
 */
export function isBlocked(content: string): boolean {
  const check = checkSensitivity(content);
  return check.sensitivity_level === 'forbidden';
}

// ============================================================================
// Category-Specific Checks
// ============================================================================

/**
 * Check for specific category
 */
export function checkForCategory(content: string, category: SensitivityCategory): DetectedTopic[] {
  const check = checkSensitivity(content);
  return check.detected_topics.filter((t) => t.category === category);
}

/**
 * Get all detected categories
 */
export function getDetectedCategories(content: string): SensitivityCategory[] {
  const check = checkSensitivity(content);
  return [...new Set(check.detected_topics.map((t) => t.category))];
}

// ============================================================================
// Highlight Sensitive Content
// ============================================================================

/**
 * Get content with sensitive parts highlighted (for UI display)
 */
export function highlightSensitiveContent(content: string): {
  html: string;
  plaintext: string;
  hasIssues: boolean;
} {
  const check = checkSensitivity(content);

  if (check.is_safe) {
    return { html: content, plaintext: content, hasIssues: false };
  }

  // Sort topics by position
  const sortedTopics = [...check.detected_topics].sort(
    (a, b) => a.position.start - b.position.start
  );

  let html = '';
  let lastEnd = 0;

  for (const topic of sortedTopics) {
    // Add text before this match
    html += escapeHtml(content.substring(lastEnd, topic.position.start));

    // Add highlighted match
    const severity =
      TOPIC_PATTERNS.find((p) => p.category === topic.category)?.severity || 'caution';
    const color = severity === 'forbidden' ? '#ef4444' : '#f59e0b';
    html += `<mark style="background-color: ${color}20; border-bottom: 2px solid ${color};" title="${topic.category}">${escapeHtml(topic.matched_text)}</mark>`;

    lastEnd = topic.position.end;
  }

  // Add remaining text
  html += escapeHtml(content.substring(lastEnd));

  return {
    html,
    plaintext: content,
    hasIssues: true,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// Export Category List
// ============================================================================

export const SENSITIVITY_CATEGORIES: SensitivityCategory[] = [
  'divorce',
  'foreclosure',
  'death_probate',
  'health',
  'legal',
  'financial_distress',
];

export const CATEGORY_LABELS: Record<SensitivityCategory, string> = {
  divorce: 'Divorce / Marital Issues',
  foreclosure: 'Foreclosure',
  death_probate: 'Death / Probate',
  health: 'Health Issues',
  legal: 'Legal Troubles',
  financial_distress: 'Financial Distress',
};
