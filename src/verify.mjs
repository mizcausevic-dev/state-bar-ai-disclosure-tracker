#!/usr/bin/env node
// verify.mjs — Validates every event in bars/*.ndjson against the schema
// AND enforces lifecycle ordering: an event's lifecycle_state must be a legal
// successor of the previous event's lifecycle_state for the same bar_jurisdiction.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(HERE, "../schema/disclosure-event.schema.json");
const BARS_DIR = join(HERE, "../bars");

// Legal lifecycle transitions. Source state → set of legal next states.
// "advisory-non-binding" can stand alone (it's a terminal state for non-binding guidance).
const TRANSITIONS = {
  "draft-opinion-circulated":        new Set(["in-public-comment", "formal-opinion-final", "rescinded", "under-review"]),
  "in-public-comment":                new Set(["formal-opinion-final", "draft-opinion-circulated", "rescinded", "under-review"]),
  "formal-opinion-final":             new Set(["mandatory-disclosure-required", "mandatory-disclosure-effective", "amended" /* via rule */, "rule-amendment-proposed", "mandatory-cle-required", "enforcement-active", "rescinded", "superseded", "under-review"]),
  "rule-amendment-proposed":          new Set(["rule-amendment-effective", "in-public-comment", "rescinded", "under-review"]),
  "rule-amendment-effective":         new Set(["mandatory-disclosure-required", "mandatory-disclosure-effective", "enforcement-active", "amended", "rescinded", "superseded", "under-review"]),
  "mandatory-cle-required":           new Set(["mandatory-disclosure-required", "mandatory-disclosure-effective", "enforcement-active", "rescinded", "superseded", "under-review"]),
  "mandatory-disclosure-required":    new Set(["mandatory-disclosure-effective", "enforcement-active", "rescinded", "superseded", "under-review"]),
  "mandatory-disclosure-effective":   new Set(["enforcement-active", "enforcement-action-published", "rescinded", "superseded", "under-review"]),
  "enforcement-active":               new Set(["enforcement-action-published", "rescinded", "superseded", "under-review"]),
  "enforcement-action-published":     new Set(["enforcement-active", "rescinded", "superseded", "under-review"]),
  "advisory-non-binding":             new Set(["formal-opinion-final", "rescinded", "superseded", "under-review", "advisory-non-binding"]),
  "court-standing-order-issued":      new Set(["court-standing-order-rescinded", "amended", "superseded", "under-review"]),
  "court-standing-order-rescinded":   new Set([]),
  "rescinded":                        new Set([]),
  "superseded":                       new Set([]),
  "under-review":                     new Set(["formal-opinion-final", "rule-amendment-proposed", "rule-amendment-effective", "rescinded", "superseded"])
};

function loadNdjson(path) {
  return readFileSync(path, "utf8").trim().split("\n").filter(Boolean).map((line, i) => {
    try { return JSON.parse(line); } catch (e) {
      throw new Error(`${path}:${i + 1} invalid JSON: ${e.message}`);
    }
  });
}

function main() {
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const files = readdirSync(BARS_DIR).filter((f) => f.endsWith(".ndjson")).sort();
  let totalEvents = 0;
  let totalBars = 0;

  for (const file of files) {
    const events = loadNdjson(join(BARS_DIR, file)).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    if (events.length === 0) continue;
    totalBars += 1;

    // Schema each event + same-jurisdiction lifecycle ordering
    for (const [i, event] of events.entries()) {
      if (!validate(event)) {
        console.error(`${file} event[${i}] (${event.event_id}) schema fail:`);
        for (const e of validate.errors || []) console.error(`  ${e.instancePath} ${e.message}`);
        process.exit(1);
      }
      totalEvents += 1;

      // Lifecycle ordering — skip first event in the file (no predecessor)
      if (i === 0) continue;
      const prev = events[i - 1];
      const legal = TRANSITIONS[prev.lifecycle_state];
      if (!legal) {
        console.error(`${file} event[${i}] (${event.event_id}) lifecycle: unknown previous state "${prev.lifecycle_state}"`);
        process.exit(2);
      }
      if (!legal.has(event.lifecycle_state)) {
        console.error(`${file} event[${i}] (${event.event_id}) lifecycle: illegal transition ${prev.lifecycle_state} → ${event.lifecycle_state} (allowed next: ${[...legal].sort().join(", ")})`);
        process.exit(2);
      }
    }
  }

  console.log(`OK · ${totalEvents} events across ${totalBars} bar jurisdictions · schema ✓ · lifecycle transitions ✓`);
}

main();
