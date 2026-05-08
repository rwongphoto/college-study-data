# Crime Trend Analysis Platform (MVP Plan)

## Overview

Build a **data-driven crime trend platform** that analyzes and
visualizes reported crime patterns over time at the **city and
neighborhood level**.

Positioning: \> Not a "crime map" → a **trend intelligence and narrative
platform**

Core principles: - Data-driven (not sensational) - Trend-focused (not
static rankings) - Transparent (methodology + limitations) - Scalable
(programmatic pages)

## Core Idea

Aggregate public crime data → normalize → analyze trends → generate: -
Interactive maps (Mapbox) - Neighborhood-level pages - Data-driven
narratives - Forecasts (time series)

## Why This Works

-   Crime data is widely available (free, public datasets)
-   High user interest (real estate, safety awareness)
-   Weak competition in **analytics + narrative layer**
-   Strong SEO potential via **programmatic pages**

## Data Sources

Start with: - San Francisco Police Department (SFPD) open data

## Architecture

Pipeline: Ingest → Normalize → Validate → Store → Aggregate → Model →
Publish

## Stack (Minimal Cost)

-   Python
-   Pandas
-   SQLite / Postgres
-   GitHub Actions
-   Next.js + Vercel
-   Mapbox
-   Prophet

Estimated cost: \$0--\$20/month

## MVP Scope

-   1 city (San Francisco)
-   3--5 districts
-   Simple crime groupings
-   Daily updates

## Key Insight

The moat is: - data normalization - time-series modeling - narrative
generation - scalable content system
