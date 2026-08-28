import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const hook = fs.readFileSync(path.join(root, 'components/experience/useCampaignExperience.ts'), 'utf8');
const campaign = fs.readFileSync(path.join(root, 'lib/defaultCampaign.ts'), 'utf8');
const screens = fs.readdirSync(path.join(root, 'components/screens')).filter((name) => name.endsWith('Screen.tsx'));

assert.ok(screens.length >= 13, `Expected at least 13 screen components, found ${screens.length}`);
assert.match(hook, /defaultCampaign/);
assert.doesNotMatch(hook, /publicApi|apiRequest|BACKEND_API_URL/);
assert.match(campaign, /rewards:/);
assert.doesNotMatch(hook, /setTimeout\([^)]*550/);
console.log(`Standalone frontend verification passed (${screens.length} screen components).`);
