---
slug: tool-predict-classify-owner
title: "Classify Owner Type - AI Tool Documentation"
category: AI Tools
subcategory: Predictive Analytics Tools
tags: [tool-predictive, tool-owner, tool-classification, tool-entity-detection, action-match]
related_docs: [motivation-scoring-workflow, interpreting-motivation-scores, motivation-scoring-fundamentals]
difficulty_level: beginner
tool_id: predict.classify_owner
---
# Classify Owner Type

## Quick Reference

| Property | Value |
|----------|-------|
| **Tool ID** | `predict.classify_owner` |
| **Category** | Predictive Analytics Tools |
| **Permission** | read |
| **Confirmation Required** | No |
| **Typical Duration** | 500ms |
| **Rate Limit** | 50 calls/minute |

## Description

Classify a property owner into categories: Individual (owner-occupied/absentee), Investor/Entity (LLC, corporation, trust), or Institutional (bank REO, government, estate). Uses pattern matching on owner name and optional signals.

## When to Use

Use **Classify Owner Type** when you need to:
- Score seller motivation
- Predict deal close probability

## Example Prompts

- "Use Classify Owner Type for [subject]"
- "Classify a property owner into categories: Individual (owner-occupied/absentee), Investor/Entity (LLC, corporation, trust), or Institutional (bank REO, government, estate)"

## Tips

- Combine with other data sources for more accurate predictions
- Higher confidence scores indicate more reliable results
