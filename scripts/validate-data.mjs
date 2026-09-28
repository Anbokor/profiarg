// Comprehensive validation and test script for ProfiARG seed data, categories, barrios, and bilingual translations
import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('========================================================');
console.log('         ProfiARG Full Test & Integrity Suite           ');
console.log('========================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
  }
}

// TEST 1: Source Files Completeness
console.log('1. Checking file existence and non-empty size:');
const filesToCheck = [
  'data/categories.ts',
  'data/barrios.ts',
  'data/seedData.ts',
  'lib/translations.ts',
  'lib/utils.ts',
  'lib/storage.ts',
  'components/Navbar.tsx',
  'components/HeroSection.tsx',
  'components/FilterBar.tsx',
  'components/SpecialistCard.tsx',
  'components/LeafletMap.tsx',
  'components/SpecialistDetailModal.tsx',
  'components/AddSpecialistModal.tsx',
  'components/StatsBanner.tsx',
  'components/Footer.tsx',
  'app/page.tsx',
  'app/specialist/[slug]/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  'tailwind.config.ts',
  'package.json',
];

for (const f of filesToCheck) {
  try {
    const fullPath = resolve(process.cwd(), f);
    const content = readFileSync(fullPath, 'utf8');
    assert(content && content.length > 50, `${f} exists and is populated (${content.length} bytes)`);
  } catch (err) {
    assert(false, `Could not read ${f}: ${err.message}`);
  }
}

// TEST 2: Categories Validation
console.log('\n2. Validating Categories Data:');
const categoriesContent = readFileSync(resolve(process.cwd(), 'data/categories.ts'), 'utf8');
const expectedCategoryIds = [
  'immigration',
  'medicine',
  'real_estate',
  'beauty',
  'food',
  'repair',
  'education',
  'it_freelance',
  'pets',
  'tourism',
];

for (const catId of expectedCategoryIds) {
  assert(
    categoriesContent.includes(`id: '${catId}'`),
    `Category '${catId}' defined in data/categories.ts`
  );
}

// TEST 3: Barrios Validation
console.log('\n3. Validating Barrios Data:');
const barriosContent = readFileSync(resolve(process.cwd(), 'data/barrios.ts'), 'utf8');
const expectedBarrios = [
  'Palermo Soho',
  'Palermo Hollywood',
  'Recoleta',
  'Belgrano',
  'Puerto Madero',
  'Caballito',
  'San Telmo',
  'Colegiales',
  'Almagro',
  'Nuñez',
  'Vicente López',
  'San Isidro',
  'Tigre & Nordelta',
];

for (const b of expectedBarrios) {
  assert(barriosContent.includes(b), `Barrio '${b}' defined with coordinates in data/barrios.ts`);
}

// Verify coordinates bounds for Buenos Aires (Lat: -34 to -35, Lng: -58 to -59)
const coordMatches = barriosContent.matchAll(/lat:\s*(-[\d.]+),\s*lng:\s*(-[\d.]+)/g);
let coordCount = 0;
let allCoordsValid = true;
for (const match of coordMatches) {
  coordCount++;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (lat > -34.0 || lat < -35.0 || lng > -58.0 || lng < -59.0) {
    allCoordsValid = false;
    console.error(`Invalid coordinates found: lat ${lat}, lng ${lng}`);
  }
}
assert(coordCount >= 10 && allCoordsValid, `All ${coordCount} barrio coordinates are within Buenos Aires bounds`);

// TEST 4: Seed Specialists Validation
console.log('\n4. Validating Seed Specialists Data:');
const seedContent = readFileSync(resolve(process.cwd(), 'data/seedData.ts'), 'utf8');

// Check specialists IDs
const idMatches = [...seedContent.matchAll(/id:\s*'(spec-\d+)'/g)].map((m) => m[1]);
assert(idMatches.length >= 15, `Found ${idMatches.length} specialist profiles in seedData (>= 15 required)`);

// Check unique IDs
const uniqueIds = new Set(idMatches);
assert(uniqueIds.size === idMatches.length, `All specialist IDs are strictly unique (${uniqueIds.size}/${idMatches.length})`);

// Check unique slugs
const slugMatches = [...seedContent.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
const uniqueSlugs = new Set(slugMatches);
assert(uniqueSlugs.size === slugMatches.length, `All specialist slugs are strictly unique (${uniqueSlugs.size}/${slugMatches.length})`);

// Check WhatsApp numbers
const waMatches = [...seedContent.matchAll(/whatsapp:\s*'\+?(\d+)'/g)].map((m) => m[1]);
let allWaValid = true;
for (const wa of waMatches) {
  if (!wa.startsWith('549')) {
    allWaValid = false;
    console.error(`WhatsApp does not start with Argentine prefix 549: ${wa}`);
  }
}
assert(allWaValid && waMatches.length >= 15, `All ${waMatches.length} WhatsApp numbers have valid Argentine international prefix (549...)`);

// TEST 5: Translation Dictionary Key Parity
console.log('\n5. Validating Bilingual Translation Dictionary (RU & ES):');
const transContent = readFileSync(resolve(process.cwd(), 'lib/translations.ts'), 'utf8');

// Extract ru block and es block
const ruBlockMatch = transContent.match(/ru:\s*\{([\s\S]*?)\},\s*es:\s*\{/);
const esBlockMatch = transContent.match(/es:\s*\{([\s\S]*?)\},\s*\};/);

assert(ruBlockMatch && esBlockMatch, 'Both RU and ES dictionaries extracted successfully');

if (ruBlockMatch && esBlockMatch) {
  const ruKeys = [...ruBlockMatch[1].matchAll(/^\s+([a-zA-Z0-9_]+):/gm)].map((m) => m[1]);
  const esKeys = [...esBlockMatch[1].matchAll(/^\s+([a-zA-Z0-9_]+):/gm)].map((m) => m[1]);

  const ruKeySet = new Set(ruKeys);
  const esKeySet = new Set(esKeys);

  const missingInEs = ruKeys.filter((k) => !esKeySet.has(k));
  const missingInRu = esKeys.filter((k) => !ruKeySet.has(k));

  assert(
    missingInEs.length === 0,
    `No missing keys in ES dictionary (Missing: ${missingInEs.join(', ') || 'none'})`
  );
  assert(
    missingInRu.length === 0,
    `No missing keys in RU dictionary (Missing: ${missingInRu.join(', ') || 'none'})`
  );
  assert(ruKeySet.size >= 50, `Dictionary contains ${ruKeySet.size} bilingual UI translation keys`);
}

// TEST 6: Tailwind Configuration
console.log('\n6. Validating Tailwind Config:');
const tailwindContent = readFileSync(resolve(process.cwd(), 'tailwind.config.ts'), 'utf8');
assert(
  tailwindContent.includes("'./data/**/*.{js,ts,jsx,tsx}'"),
  "Tailwind content includes './data/**/*.{js,ts,jsx,tsx}' to prevent purging category styles"
);
assert(
  tailwindContent.includes("'./lib/**/*.{js,ts,jsx,tsx}'"),
  "Tailwind content includes './lib/**/*.{js,ts,jsx,tsx}'"
);

// TEST 7: Leaflet CSS Import in Root Layout
console.log('\n7. Validating Leaflet Stylesheet Bundle:');
const layoutContent = readFileSync(resolve(process.cwd(), 'app/layout.tsx'), 'utf8');
assert(
  layoutContent.includes("import 'leaflet/dist/leaflet.css';"),
  "Root layout bundles 'leaflet/dist/leaflet.css'"
);

// TEST 8: Category Scroll Clipping & Deselect UI Integrity
console.log('\n8. Validating Category Scroll & Deselect UI Implementation:');
const heroContent = readFileSync(resolve(process.cwd(), 'components/HeroSection.tsx'), 'utf8');
const filterBarContent = readFileSync(resolve(process.cwd(), 'components/FilterBar.tsx'), 'utf8');
const pageContent = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8');
const globalsContent = readFileSync(resolve(process.cwd(), 'app/globals.css'), 'utf8');

// HeroSection verification
assert(
  heroContent.includes('flex-shrink-0'),
  "HeroSection uses 'flex-shrink-0' on category pill buttons to prevent squishing"
);
assert(
  !heroContent.includes('justify-center gap-2 overflow-x-auto'),
  "HeroSection removed 'justify-center' from overflow container to prevent negative scroll clipping"
);
assert(
  heroContent.includes('LayoutGrid'),
  "HeroSection includes 'LayoutGrid' icon for prominent 'All Categories' pill"
);
assert(
  heroContent.includes('setSelectedCategory(isSelected ? \'all\' : cat.id)'),
  "HeroSection toggles category off back to 'all' when already selected"
);
assert(
  heroContent.includes('scrollCategories'),
  "HeroSection has horizontal scroll controls for category overflow navigation"
);
assert(
  heroContent.includes('container.scrollTo'),
  "HeroSection centers active category via container.scrollTo (prevents window scrolling jump)"
);
assert(
  heroContent.includes('aria-pressed'),
  "HeroSection buttons include aria-pressed for accessible toggle state"
);

// FilterBar verification
assert(
  filterBarContent.includes('CATEGORIES.map'),
  "FilterBar renders category selection options"
);
assert(
  filterBarContent.includes("setSelectedCategory('all')"),
  "FilterBar provides clear (X) deselect button for active category filter"
);
assert(
  filterBarContent.includes('activeFilters'),
  "FilterBar renders active filters chip strip"
);
assert(
  filterBarContent.includes('ChevronDown'),
  "FilterBar includes ChevronDown dropdown indicators for select controls"
);

// Scrollbar utility verification
assert(
  globalsContent.includes('.scrollbar-none') && globalsContent.includes('scrollbar-width: none'),
  "app/globals.css provides full cross-browser .scrollbar-none utility"
);

// app/page.tsx toggle & reset verification
assert(
  pageContent.includes('handleToggleCategory'),
  "app/page.tsx defines handleToggleCategory helper"
);
assert(
  pageContent.includes("setSelectedCategory('all')"),
  "app/page.tsx handleResetFilters explicitly resets selectedCategory to 'all'"
);
assert(
  pageContent.includes('onReset={handleResetFilters}'),
  "app/page.tsx passes handleResetFilters to HeroSection"
);

// Summary
console.log('\n========================================================');
console.log(`Total tests: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('========================================================');

if (failedTests > 0) {
  console.error('\nData integrity and verification check failed!');
  process.exit(1);
} else {
  console.log('\nAll ProfiARG tests and data validations passed successfully!');
}
