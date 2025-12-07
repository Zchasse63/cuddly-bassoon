---
slug: tool-category-predictive
title: "Predictive Analytics Tools - Complete Reference"
category: AI Tools
subcategory: AI & Predictions
tags: [tool-predictive, tool-motivation, tool-seller, tool-analysis, tool-stratified-scoring, action-analyze, action-predict, action-score, concept-motivation, tool-deals]
related_docs: [motivation-scoring-workflow, interpreting-motivation-scores, motivation-scoring-fundamentals]
difficulty_level: beginner
---
# Predictive Analytics Tools

## Overview

AI-powered tools for predicting seller motivation, deal outcomes, and optimal pricing.

**Total Tools**: 7

## Available Tools


### Predict Seller Motivation

**ID**: `predict.seller_motivation`

Analyze property and owner data using stratified scoring models. Uses different scoring logic based on owner type: Individual (long ownership = HIGH motivation), Investor/Entity (long ownership = LOW motivation), Institutional (process-focused). Optionally includes AI-enhanced DealFlow IQ score.


### Predict Deal Close Probability

**ID**: `predict.deal_close_probability`

Predict the likelihood of a deal closing using market velocity and property data.


### Calculate Optimal Offer Price

**ID**: `predict.optimal_offer_price`

Calculate optimal offer price using real ARV from RentCast and market data.


### Predict Time to Close

**ID**: `predict.time_to_close`

Predict deal timeline using market velocity data and deal type analysis.


### Classify Owner Type

**ID**: `predict.classify_owner`

Classify a property owner into categories: Individual (owner-occupied/absentee), Investor/Entity (LLC, corporation, trust), or Institutional (bank REO, government, estate). Uses pattern matching on owner name and optional signals.


### Batch Score Seller Motivation

**ID**: `predict.batch_motivation`

Calculate seller motivation scores for multiple properties at once. Returns scores, owner classifications, and recommendations for up to 20 properties. Useful for prioritizing lead lists.


### Compare Motivation Scores

**ID**: `predict.compare_motivation`

Compare seller motivation scores across multiple properties to prioritize outreach. Ranks properties and provides analysis of which to contact first.


## Common Use Cases

- Score seller motivation
- Predict deal close probability
- Calculate optimal offer price

## Related Documentation

- [motivation-scoring-workflow](motivation-scoring-workflow)
- [interpreting-motivation-scores](interpreting-motivation-scores)
- [motivation-scoring-fundamentals](motivation-scoring-fundamentals)
