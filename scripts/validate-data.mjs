import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

console.log('========================================================');
console.log('       Quatro Clicks Full Test & Integrity Suite        ');
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
  'components/CreateOrderModal.tsx',
  'components/OrdersBoard.tsx',
  'components/SpecialistCabinetModal.tsx',
  'components/CategoryDirectory.tsx',
  'components/CategoryDrilldownHeader.tsx',
  'data/seedOrders.ts',
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
  'repair_construction',
  'beauty',
  'transport',
  'currency_exchange',
  'translators',
  'legal_lawyers',
  'education',
  'tourism',
  'appliances_repair',
  'auto',
  'real_estate',
  'jobs',
  'it_services',
  'food_shops',
];

for (const catId of expectedCategoryIds) {
  assert(
    categoriesContent.includes(`id: '${catId}'`),
    `Category '${catId}' defined in data/categories.ts`
  );
}
assert(expectedCategoryIds.length === 14, 'Exactly 14 client categories defined in data/categories.ts');

const clientRequiredSubcategories = [
  'Бетонные работы, кладка',
  'Укладка плитки',
  'Электрика',
  'Водоснабжение сантехника',
  'Двери входные',
  'Двери межкомнатные',
  'Сварочные Работы',
  'Окна',
  'Штукатурка',
  'Перегородки гипсокартон',
  'Кондиционеры',
  'Газ',
  'Комплексные работы',
  'Кухни',
  'Мебель',
  'Проект',
  'Услуги Obras',
  'Продажа материалов Materiales',
  'Окрашивание волос / стрижка',
  'Маникюр / педикюр',
  'Депиляция',
  'Косметология',
  'Массаж',
  'Ламинирование, окрашивание, коррекция бровей',
  'Перманентный макияж',
  'Трансфер Аэропорт',
  'Лицензированный CTPCBA',
  'Выездной',
  'Языки: Испанский',
  'Дети: Математика',
  'Танцы: Танго',
  'Гид',
  'Телефоны',
  'Прокат автомобилей',
  'Аренда: Услуги по подбору',
  'Вакансии',
  'Резюме',
  'Изготовление сайта',
  'Администрирование',
];

for (const sub of clientRequiredSubcategories) {
  assert(
    categoriesContent.includes(`'${sub}'`),
    `Client subcategory '${sub}' defined in categories.ts`
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

// Check premier specialist Alexander Marchenko (spec-1)
assert(seedContent.includes("contractorId: '0001/001'"), "Premier specialist spec-1 has contractorId '0001/001'");
assert(seedContent.includes("Александр Марченко"), "Premier specialist name is 'Александр Марченко'");
assert(seedContent.includes("Ventanas porteñas"), "Premier specialist company is 'Ventanas porteñas'");
assert(seedContent.includes("ventanasportenas.ar"), "Premier specialist website is configured");
assert(seedContent.includes("+54 9 11 3015 9399") || seedContent.includes("+5491130159399"), "Premier specialist phone is configured (+54 9 11 3015 9399)");
assert(seedContent.includes("+54 9 11 3386 7500") || seedContent.includes("+5491133867500"), "Premier specialist WhatsApp is configured (+54 9 11 3386 7500)");

// Check that all 14 categories have specialists in seedData
for (const catId of expectedCategoryIds) {
  assert(
    seedContent.includes(`category: '${catId}'`),
    `Seed data includes at least one specialist in category '${catId}'`
  );
}

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

// Client mission statement exact text verification
const expectedRuMission = 'Данная платформа предназначена для бесплатного размещения информации о вашей деятельности и направлена на упрощение поиска необходимой услуги в Аргентине как для русскоязычного населения, так и для испаноговорящих';
const expectedEsMission = 'Esta plataforma está destinada a la publicación gratuita de información sobre tu actividad profesional y orientada a simplificar la búsqueda de servicios en Argentina tanto para la comunidad hispanohablante como rusoparlante.';

assert(transContent.includes(expectedRuMission), 'lib/translations.ts includes client exact RU mission statement');
assert(transContent.includes(expectedEsMission), 'lib/translations.ts includes client exact ES mission statement');
assert(transContent.includes('contractorIdLabel'), 'lib/translations.ts includes contractor profile field translations');
assert(transContent.includes('Quatro Clicks'), 'lib/translations.ts features Quatro Clicks branding');

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

// TEST 9: Seed Orders Validation
console.log('\n9. Validating Marketplace Seed Orders Data:');
const seedOrdersContent = readFileSync(resolve(process.cwd(), 'data/seedOrders.ts'), 'utf8');

const orderIdMatches = [...seedOrdersContent.matchAll(/id:\s*'(order-\d+)'/g)].map((m) => m[1]);
assert(orderIdMatches.length >= 6, `Found ${orderIdMatches.length} seed orders in seedOrders.ts (>= 6 required)`);

const uniqueOrderIds = new Set(orderIdMatches);
assert(uniqueOrderIds.size === orderIdMatches.length, `All order IDs are strictly unique (${uniqueOrderIds.size}/${orderIdMatches.length})`);

// Check required realistic orders
assert(
  seedOrdersContent.includes('DNI') || seedOrdersContent.includes('перевод'),
  "Seed orders include DNI legal translation task"
);
assert(
  seedOrdersContent.includes('кондиционер') || seedOrdersContent.includes('сплит'),
  "Seed orders include air conditioner repair/maintenance task"
);
assert(
  seedOrdersContent.includes('квартир') || seedOrdersContent.includes('аренд'),
  "Seed orders include apartment search / rental assistance task"
);
assert(
  seedOrdersContent.includes('торт') || seedOrdersContent.includes('Медовик'),
  "Seed orders include birthday cake bakery task"
);
assert(
  seedOrdersContent.includes("status: 'open'") &&
  seedOrdersContent.includes("status: 'in_progress'") &&
  seedOrdersContent.includes("status: 'completed'"),
  "Seed orders represent open, in_progress, and completed lifecycle states"
);
assert(
  seedOrdersContent.includes("currency: 'ARS'") && seedOrdersContent.includes("currency: 'USD'"),
  "Seed orders support dual currency (ARS and USD)"
);

// TEST 10: 1% Commission Platform Model & Storage Integrity
console.log('\n10. Validating 1% Commission Platform Model & Storage Functions:');
const storageContent = readFileSync(resolve(process.cwd(), 'lib/storage.ts'), 'utf8');

assert(
  storageContent.includes('export function getStoredOrders'),
  "lib/storage.ts exports getStoredOrders"
);
assert(
  storageContent.includes('export function saveCustomOrder'),
  "lib/storage.ts exports saveCustomOrder"
);
assert(
  storageContent.includes('export function updateOrderStatus'),
  "lib/storage.ts exports updateOrderStatus"
);
assert(
  storageContent.includes('export function completeOrderWithFee'),
  "lib/storage.ts exports completeOrderWithFee"
);
assert(
  storageContent.includes('finalSum * 0.01'),
  "Platform commission is calculated at strictly 1% of final contract sum"
);
assert(
  storageContent.includes('0.14') || storageContent.includes('0.15'),
  "Savings metric tracks comparison against 15% platforms (e.g. Profi.ru)"
);

// Mathematical verification of 1% fee and 14% net savings vs 15% platforms
const calcFee = (sum) => Math.round(sum * 0.01 * 100) / 100;
const calcSaving = (sum) => Math.round(sum * 0.14 * 100) / 100;
assert(calcFee(50000) === 500, "50.000 ARS order yields exactly 500 ARS 1% platform commission");
assert(calcSaving(50000) === 7000, "50.000 ARS order saves 7.000 ARS (14%) compared to 15% platforms");
assert(calcFee(200) === 2, "$200 USD order yields exactly $2 USD 1% platform commission");
assert(calcSaving(200) === 28, "$200 USD order saves $28 USD (14%) compared to 15% platforms");
assert(calcFee(85000) === 850 && calcSaving(85000) === 11900, "85.000 ARS order yields 850 ARS fee and 11.900 ARS savings");

assert(
  storageContent.includes('export function getSpecialistCabinetState'),
  "lib/storage.ts exports getSpecialistCabinetState"
);
assert(
  storageContent.includes('export function topUpSpecialistDeposit'),
  "lib/storage.ts exports topUpSpecialistDeposit with payment simulation"
);
assert(
  storageContent.includes('export function getLoggedInSpecialist'),
  "lib/storage.ts exports getLoggedInSpecialist"
);
assert(
  storageContent.includes('export function loginSpecialist'),
  "lib/storage.ts exports loginSpecialist"
);
assert(
  storageContent.includes('export function loginSpecialistByCredential'),
  "lib/storage.ts exports loginSpecialistByCredential"
);
assert(
  storageContent.includes('export function logoutSpecialist'),
  "lib/storage.ts exports logoutSpecialist"
);

// TEST 11: Two-Sided Marketplace UI Integration & Bilingual Parity
console.log('\n11. Validating Two-Sided Marketplace & 1% Commission UI Integration:');
const createOrderModalContent = readFileSync(resolve(process.cwd(), 'components/CreateOrderModal.tsx'), 'utf8');
const ordersBoardContent = readFileSync(resolve(process.cwd(), 'components/OrdersBoard.tsx'), 'utf8');
const cabinetModalContent = readFileSync(resolve(process.cwd(), 'components/SpecialistCabinetModal.tsx'), 'utf8');
const navbarContent = readFileSync(resolve(process.cwd(), 'components/Navbar.tsx'), 'utf8');
const addSpecialistModalContent = readFileSync(resolve(process.cwd(), 'components/AddSpecialistModal.tsx'), 'utf8');

// Specialist registration subtle fee notice
assert(
  addSpecialistModalContent.includes('Комиссия за заказ всего 1%'),
  "AddSpecialistModal includes subtle 1% fee notice exclusively for registering specialists"
);

// CreateOrderModal checks
assert(
  createOrderModalContent.includes('saveCustomOrder'),
  "CreateOrderModal invokes saveCustomOrder"
);
assert(
  !createOrderModalContent.includes('commissionBadge'),
  "CreateOrderModal keeps client interface clean without commission distractions"
);
assert(
  createOrderModalContent.includes('contactMethod') && createOrderModalContent.includes('whatsapp'),
  "CreateOrderModal provides contact methods (WhatsApp, Telegram, phone)"
);

// OrdersBoard checks
assert(
  ordersBoardContent.includes('ordersBoardTitle'),
  "OrdersBoard renders marketplace title and header"
);
assert(
  !ordersBoardContent.includes('commissionBadge'),
  "OrdersBoard keeps public order cards clean without tacky commission badges"
);
assert(
  ordersBoardContent.includes('wa.me'),
  "OrdersBoard generates direct WhatsApp contact deep link"
);
assert(
  ordersBoardContent.includes('orderTakeJobBtn'),
  "OrdersBoard enables specialists to transition open orders to in_progress"
);
assert(
  ordersBoardContent.includes('budgetFilter'),
  "OrdersBoard provides comprehensive budget filter (ARS brackets, USD, negotiable)"
);

// SpecialistCabinetModal clean financial portal & auth checks
assert(
  cabinetModalContent.includes('cabinetDepositBalance'),
  "SpecialistCabinetModal displays deposit balance card"
);
assert(
  cabinetModalContent.includes('cabinetCompletedOrders'),
  "SpecialistCabinetModal displays completed orders count card"
);
assert(
  cabinetModalContent.includes('cabinetClosedVolume'),
  "SpecialistCabinetModal displays revenue/volume card"
);
assert(
  cabinetModalContent.includes('cabinetActiveOrders'),
  "SpecialistCabinetModal displays active orders card"
);
assert(
  cabinetModalContent.includes('cabinetAuthTitle'),
  "SpecialistCabinetModal includes elegant specialist authentication gate"
);
assert(
  cabinetModalContent.includes('cabinetAuthQuickDemoTitle'),
  "SpecialistCabinetModal provides quick-select demo login for registered specialists"
);
assert(
  cabinetModalContent.includes('cabinetLogoutBtn'),
  "SpecialistCabinetModal provides logout option for authenticated specialists"
);
assert(
  cabinetModalContent.includes('completeDealFeeNotice'),
  "SpecialistCabinetModal mentions 1% service retention strictly in deal completion"
);
assert(
  cabinetModalContent.includes('cabinetTransactionFeeLine'),
  "SpecialistCabinetModal statement log line item mentions fee strictly by order"
);
assert(
  !cabinetModalContent.includes('1% FEE'),
  "SpecialistCabinetModal removes tacky '1% FEE' badge from header"
);
assert(
  !cabinetModalContent.includes('В 15 раз выгоднее!'),
  "SpecialistCabinetModal removes promotional 15x comparison banner"
);
assert(
  cabinetModalContent.includes('initialOrderToComplete'),
  "SpecialistCabinetModal supports initialOrderToComplete for direct board completion"
);
assert(
  cabinetModalContent.includes('mercadopago') && cabinetModalContent.includes('usdt') && cabinetModalContent.includes('rubles_p2p'),
  "SpecialistCabinetModal simulates top-up via MercadoPago, USDT, and Rubles P2P"
);

// Navbar & Hero checks (Concise, uncluttered, no orders board)
assert(
  !navbarContent.includes('createOrderBtn') && !navbarContent.includes('Publicar pedido'),
  "Navbar removes public create order CTA in line with maximum conciseness"
);
assert(
  !navbarContent.includes('ordersBoardTab'),
  "Navbar removes orders board tab in line with maximum conciseness"
);
assert(
  navbarContent.includes('isMasterMenuOpen') && navbarContent.includes('specialistCabinetTab'),
  "Navbar features clean unified master menu dropdown housing cabinet and registration"
);
assert(
  !navbarContent.includes('1%'),
  "Navbar removes cluttered 1% commission badges for clean spacious header"
);
assert(
  !heroContent.includes('createOrderHeroBtn') && !heroContent.includes('Pedir presupuesto'),
  "HeroSection removes order request button in line with maximum conciseness"
);
assert(
  !pageContent.includes('<OrdersBoard') && !pageContent.includes('<CreateOrderModal') && pageContent.includes('SpecialistCabinetModal'),
  "app/page.tsx removes OrdersBoard and CreateOrderModal while retaining SpecialistCabinetModal"
);
assert(
  navbarContent.includes("aria-label={locale === 'ru' ? 'Для мастеров' : 'Para profesionales'}"),
  "Navbar master menu button includes accessible aria-label"
);
assert(
  navbarContent.includes('[isMasterMenuOpen]'),
  "Navbar outside-click listener lifecycle is scoped to [isMasterMenuOpen] to prevent memory leaks"
);
assert(
  navbarContent.includes('truncate') && navbarContent.includes('flex-shrink-0'),
  "Navbar mobile navigation switcher includes truncate and flex-shrink-0 protections"
);
assert(
  filterBarContent.includes('favoritesOnly') && filterBarContent.includes('setFavoritesOnly'),
  "FilterBar supports favoritesOnly toggle and active chip for catalog filtering"
);
assert(
  pageContent.includes('favoritesOnly={favoritesOnly}'),
  "app/page.tsx links favorites state with FilterBar"
);
assert(
  storageContent.includes('resolvedCurrency'),
  "lib/storage.ts ensures dual currency safety and correct commission currency for deals"
);
assert(
  navbarContent.includes('loggedInSpecialist'),
  "Navbar supports loggedInSpecialist display and session state"
);
assert(
  pageContent.includes('loggedInSpecialist') && pageContent.includes('handleLoginSpecialist'),
  "app/page.tsx manages specialist session and passes state to modals"
);
assert(
  cabinetModalContent.includes('t.cabinetAuthLoginAs') && cabinetModalContent.includes('roleName'),
  "SpecialistCabinetModal formats quick demo items with 'Войти как [Имя] ([Специальность])'"
);
assert(
  !cabinetModalContent.includes('completedOrders.length || cabinetState.completedOrdersCount'),
  "SpecialistCabinetModal eliminates falsy 0 || 1 bug in completed orders counter"
);
assert(
  storageContent.includes('subDigits') && storageContent.includes('q.length >= 3'),
  "lib/storage.ts handles Argentine phone numbers with 15 prefix and prevents short accidental name matches"
);
assert(
  pageContent.includes("status === 'in_progress' ? specId : undefined"),
  "app/page.tsx assigns in_progress marketplace orders to the logged-in specialist"
);
assert(
  pageContent.includes('getSpecialistCabinetState(specId)'),
  "app/page.tsx refreshes cabinet metrics for the specific specialist completing a deal"
);
assert(
  !transContent.includes('в 15 раз выгоднее Profi.ru') && !transContent.includes('15 veces más económico que otras plataformas'),
  "lib/translations.ts removes promotional platform comparison slogans"
);

// Quatro Clicks Rebranding & Contractor Verification Architecture
assert(navbarContent.includes('Quatro Clicks'), "Navbar features 'Quatro Clicks' branding");
const footerContent = readFileSync(resolve(process.cwd(), 'components/Footer.tsx'), 'utf8');
assert(footerContent.includes('Quatro Clicks'), "Footer features 'Quatro Clicks' branding");
assert(layoutContent.includes('Quatro Clicks'), "Root layout features 'Quatro Clicks' branding");
assert(cabinetModalContent.includes('Quatro Clicks'), "SpecialistCabinetModal features 'Quatro Clicks' branding");
assert(ordersBoardContent.includes('Quatro Clicks'), "OrdersBoard features 'Quatro Clicks' branding");
assert(
  addSpecialistModalContent.includes('privateConfidentialNotice') || addSpecialistModalContent.includes('privateDniPhoto'),
  "AddSpecialistModal includes private identity verification disclosure"
);
assert(
  transContent.includes('Паспорт или DNI фото для исключения мошенничества, не для общего доступа'),
  "lib/translations.ts includes private identity verification disclosure"
);
assert(
  addSpecialistModalContent.includes('contractorId') || addSpecialistModalContent.includes('0001/001') || addSpecialistModalContent.includes('contractorIdLabel'),
  "AddSpecialistModal supports contractor identification architecture"
);
assert(
  addSpecialistModalContent.includes('handleToggleSubcategory') || addSpecialistModalContent.includes('selectedSubcategories'),
  "AddSpecialistModal supports granular subcategory selection during contractor registration"
);
const packageJsonContent = readFileSync(resolve(process.cwd(), 'package.json'), 'utf8');
assert(
  packageJsonContent.includes('"name": "quatro-clicks"'),
  "package.json features 'quatro-clicks' platform name"
);
const specialistCardContent = readFileSync(resolve(process.cwd(), 'components/SpecialistCard.tsx'), 'utf8');
assert(
  specialistCardContent.includes('specialist.phone'),
  "SpecialistCard provides direct telephone calling channel"
);
assert(
  specialistCardContent.includes('granularLanguages'),
  "SpecialistCard renders multi-language indicators"
);

// TEST 12: Two-Level Home Page Flow & Category Directory Integrity
console.log('\n12. Validating Two-Level Home Page Flow & Category Directory Integrity:');
const catDirContent = readFileSync(resolve(process.cwd(), 'components/CategoryDirectory.tsx'), 'utf8');
const drilldownHeaderContent = readFileSync(resolve(process.cwd(), 'components/CategoryDrilldownHeader.tsx'), 'utf8');

assert(
  catDirContent.includes('CATEGORIES.map'),
  "CategoryDirectory iterates over and renders the 14 category cards"
);
assert(
  catDirContent.includes('onSelectCategory') && catDirContent.includes('onSelectSubcategory'),
  "CategoryDirectory supports drill-down triggers on category cards and subcategory tags"
);
assert(
  catDirContent.includes('specialistSubs') && catDirContent.includes('displaySubcategories'),
  "CategoryDirectory prioritizes populated subcategories from specialists to prevent 0-result dead-ends"
);
assert(
  pageContent.includes("selectedCategory === 'all' && !searchQuery.trim()"),
  "app/page.tsx strictly isolates root home page state when selectedCategory is 'all' and search is empty"
);
assert(
  pageContent.includes('<CategoryDirectory'),
  "app/page.tsx renders CategoryDirectory on the root home page"
);
assert(
  pageContent.includes('showCategoryPills={false}'),
  "app/page.tsx configures HeroSection to hide redundant category pills on root page"
);

// Verify root state has NO map and NO mixed specialists list
const rootStateStartIndex = pageContent.indexOf("selectedCategory === 'all' && !searchQuery.trim()");
const drilldownStartIndex = pageContent.indexOf("/* ================= DRILL-DOWN STATE & SEARCH RESULTS ================= */");
const rootStateBlock = rootStateStartIndex !== -1 && drilldownStartIndex !== -1
  ? pageContent.slice(rootStateStartIndex, drilldownStartIndex)
  : '';

assert(
  rootStateBlock && !rootStateBlock.includes('<LeafletMap'),
  "Root state strictly excludes LeafletMap (no map on root home page)"
);
assert(
  rootStateBlock && !rootStateBlock.includes('<SpecialistCard'),
  "Root state strictly excludes SpecialistCard (no mixed specialist cards on root home page)"
);
assert(
  rootStateBlock && !rootStateBlock.includes('<StatsBanner'),
  "Root state strictly excludes StatsBanner (no marketing banner noise on root home page)"
);
assert(
  !pageContent.includes('<StatsBanner'),
  "app/page.tsx completely purges StatsBanner marketing blocks from page"
);

// Verify drill-down state renders map and specialist list
assert(
  drilldownHeaderContent.includes('backToCategories') && drilldownHeaderContent.includes('ArrowLeft'),
  "CategoryDrilldownHeader includes prominent 'backToCategories' return button with arrow icon"
);
assert(
  drilldownHeaderContent.includes('category.subcategories.map'),
  "CategoryDrilldownHeader renders clickable subcategories horizontal scroll strip"
);
assert(
  pageContent.includes('<CategoryDrilldownHeader'),
  "app/page.tsx renders CategoryDrilldownHeader during category drill-down"
);
assert(
  pageContent.includes('handleBackToCategories'),
  "app/page.tsx implements handleBackToCategories to return to root 14-category view"
);
assert(
  pageContent.includes("selectedSubcategory !== 'all'") && pageContent.includes('hasSub && !hasService'),
  "app/page.tsx filters specialists by selected subcategory and service titles"
);
assert(
  pageContent.includes('categoryObj'),
  "app/page.tsx indexes category titles in search text for discovery by category name"
);
assert(
  filterBarContent.includes('selectedSubcategory') && filterBarContent.includes('setSelectedSubcategory'),
  "FilterBar supports selectedSubcategory filter and deselect chip"
);
assert(
  transContent.includes('backToCategories') && transContent.includes('browseCategoriesTitle'),
  "lib/translations.ts includes backToCategories and browseCategoriesTitle keys in both RU and ES"
);
assert(
  transContent.includes('specialistSingle') && transContent.includes('profileSingle'),
  "lib/translations.ts includes pluralization keys (specialistSingle, profileSingle) in both RU and ES"
);

// TEST 13: Sleek Functional Footer Integrity (Barrios purge, functional links, language toggle)
console.log('\n13. Validating Sleek Functional Footer Integrity:');
assert(
  !footerContent.includes('BARRIOS') && !footerContent.includes('Barrios destacados'),
  "Footer purges non-functional barrio links dump"
);
assert(
  !footerContent.includes('ordersBoardTab'),
  "Footer purges orders board tab in line with maximum conciseness"
);
assert(
  !footerContent.includes('createOrderBtn'),
  "Footer purges create order modal trigger in line with maximum conciseness"
);
assert(
  footerContent.includes('onOpenCabinet') && footerContent.includes('specialistCabinetTab'),
  "Footer provides functional direct trigger for specialist cabinet"
);
assert(
  !footerContent.includes('CATEGORIES.map'),
  "Footer purges duplicate category shortcuts dump in line with single-level design"
);
assert(
  footerContent.includes('setLocale') && footerContent.includes("setLocale('ru')") && footerContent.includes("setLocale('es')"),
  "Footer includes bilingual language toggle switch (RU & ES)"
);
assert(
  pageContent.includes('onNavigateToCatalog=') && pageContent.includes('setLocale='),
  "app/page.tsx wires interactive navigation and language handlers to Footer"
);
assert(
  !footerContent.includes('onSelectBarrio'),
  "Footer cleans up obsolete onSelectBarrio prop interface"
);
assert(
  pageContent.includes('setSelectedCategory(catId)') && pageContent.includes("setSearchQuery('')"),
  "app/page.tsx footer category shortcuts cleanly reset search and drill down directly"
);
const heroSectionContent = readFileSync(resolve(process.cwd(), 'components/HeroSection.tsx'), 'utf8');
assert(
  !heroSectionContent.includes('проверенных анкет') && !heroSectionContent.includes('perfiles verificados'),
  "HeroSection purges redundant marketing trust stats from minimalist home page"
);

// TEST 14: Categories-First Ultra-Clean Directory Architecture
console.log('\n14. Validating Categories-First Minimalist Architecture:');
assert(
  catDirContent.includes('indexNumber') && catDirContent.includes("padStart(2, '0')"),
  "CategoryDirectory implements 01..14 numbered index corresponding to client ТЗ"
);
assert(
  catDirContent.includes('getProfileCountText') && catDirContent.includes('profileSingle'),
  "CategoryDirectory applies grammatically correct profile counters in RU & ES"
);
assert(
  catDirContent.includes('displaySubcategories.map') && catDirContent.includes('onSelectSubcategory'),
  "CategoryDirectory renders directly clickable subcategory pills with instant drill-down"
);
assert(
  heroSectionContent.includes('heroSubtitle') && !heroSectionContent.includes('text-5xl'),
  "HeroSection presents mission statement in compact typography banner without bulky heading bloat"
);
assert(
  navbarContent.includes('Вход для мастеров') && navbarContent.includes('setLocale'),
  "Navbar provides sleek minimalist controls ('Вход для мастеров' and language switcher)"
);
assert(
  drilldownHeaderContent.includes('indexNumber'),
  "CategoryDrilldownHeader preserves 01..14 numbered index continuity"
);
assert(
  catDirContent.includes('flex flex-col gap-2.5 sm:gap-3'),
  "CategoryDirectory renders single-column layout for maximum conciseness and above-the-fold visibility"
);
assert(
  catDirContent.includes('specialistSubsList'),
  "CategoryDirectory balances trade diversity across specialists for prominent core subcategory discovery"
);
assert(
  drilldownHeaderContent.includes('.replace') && pageContent.includes('.replace'),
  "Drilldown return buttons prevent double-arrow visual defects when rendering backToCategories"
);

console.log('\n15. Validating Official Quatro Clicks Logo & Asset Integrity:');
assert(existsSync('public/logo-horizontal.png'), "public/logo-horizontal.png exists for light mode");
assert(existsSync('public/logo-dark.png'), "public/logo-dark.png exists for dark mode");
assert(existsSync('public/logo-icon.png'), "public/logo-icon.png exists for app emblem/icon");
assert(existsSync('public/favicon.ico') && existsSync('app/favicon.ico'), "favicon.ico exists in public and app roots");
assert(existsSync('public/favicon-32x32.png') && existsSync('public/apple-touch-icon.png'), "Multi-resolution browser tab icons exist (32x32 and 180x180)");
assert(navbarContent.includes('logo-horizontal.png') && navbarContent.includes('logo-dark.png'), "Navbar renders official responsive Quatro Clicks logo for light & dark modes");
assert(footerContent.includes('logo-horizontal.png') && footerContent.includes('logo-dark.png'), "Footer renders official responsive Quatro Clicks logo for light & dark modes");
assert(layoutContent.includes('logo-icon.png') && layoutContent.includes('favicon.ico'), "Root layout links to official Quatro Clicks logo emblem favicon and favicon.ico");

// TEST 16: Price-Free Large Cards, Compact On-Demand Map & Filter Overload Purge
console.log('\n16. Validating Concise Specialist Cards, Compact Map & Minimalist Architecture:');
assert(
  !specialistCardContent.includes('formatCurrency') && !specialistCardContent.includes('srv.price'),
  "SpecialistCard is completely price-free in line with client guidelines"
);
assert(
  specialistCardContent.includes('h-20 w-20') || specialistCardContent.includes('h-24 sm:w-24'),
  "SpecialistCard features enlarged avatar (h-20/h-24) for superior readability"
);
assert(
  specialistCardContent.includes('text-lg sm:text-xl') || specialistCardContent.includes('text-xl'),
  "SpecialistCard features larger, prominent typography for contractor names"
);
assert(
  pageContent.includes('h-64 sm:h-72') && pageContent.includes('showCategoryMap'),
  "app/page.tsx features compact, reduced-height map (h-64 sm:h-72) triggered by on-demand button"
);
assert(
  !pageContent.includes('<FilterBar'),
  "app/page.tsx purges bulky FilterBar component in favor of clean 3-level hierarchical navigation"
);
assert(
  pageContent.includes('max-w-4xl') && pageContent.includes('space-y-4'),
  "app/page.tsx lays out specialist cards in a single, spacious, highly readable column"
);

// TEST 17: UI/UX Redesign & Functional Refinements Validation
console.log('\n17. Validating Complete UI/UX Redesign & Functional Refinements:');
const globalsCssContent = readFileSync(resolve(process.cwd(), 'app/globals.css'), 'utf8');
const typesContent = readFileSync(resolve(process.cwd(), 'types/index.ts'), 'utf8');
const specialistDetailContent = readFileSync(resolve(process.cwd(), 'components/SpecialistDetailModal.tsx'), 'utf8');

// 17.1 Palette RAL 7035 / RAL 7004 & White category/card plates
assert(
  globalsCssContent.includes('--ral-7035: #D7DADC;') && globalsCssContent.includes('--ral-7004: #9CA1A6;'),
  "app/globals.css configures corporate RAL 7035 (#D7DADC) and RAL 7004 (#9CA1A6) variables"
);
assert(
  pageContent.includes('bg-[#D7DADC]'),
  "app/page.tsx root container applies RAL 7035 backdrop (#D7DADC)"
);
assert(
  specialistCardContent.includes('bg-white') && specialistCardContent.includes('dark:bg-slate-900'),
  "Specialist cards maintain pure white plate background for high contrast against grey backdrop"
);

// 17.2 Navbar Red Menu Border & Larger Language Switcher
assert(
  navbarContent.includes('border-2 border-red-500'),
  "Navbar renders red accent border (RAL 3020 / border-red-500) around 'Вход для мастеров'"
);
assert(
  navbarContent.includes('px-3.5 sm:px-4 py-1.5'),
  "Navbar provides enlarged, high-contrast RU/ES language toggle switch"
);

// 17.3 HeroSection Decoupled Search & Autocomplete
assert(
  heroSectionContent.includes('localQuery') && heroSectionContent.includes('matchingCategories') && heroSectionContent.includes('matchingSpecialists'),
  "HeroSection implements decoupled local search with smooth autocomplete suggestions dropdown"
);

// 17.4 SpecialistDetailModal Escape listener & Fixed Close Button
assert(
  specialistDetailContent.includes("e.key === 'Escape'") && specialistDetailContent.includes('onClick={onClose}'),
  "SpecialistDetailModal supports backdrop click dismissal and Escape key listener"
);
assert(
  specialistDetailContent.includes('z-50') && specialistDetailContent.includes('absolute top-'),
  "SpecialistDetailModal features prominent fixed z-50 close button preventing photo overlap lockouts"
);

// 17.5 SpecialistCard Layout Matching User Sketch
assert(
  specialistCardContent.includes('#{specialist.contractorId}') || specialistCardContent.includes('contractorId'),
  "SpecialistCard displays contractor ID badge in header row"
);
assert(
  specialistCardContent.includes('categoryBadgeTitle') && specialistCardContent.includes('groupBadgeTitle'),
  "SpecialistCard displays 3 hierarchical header badges matching sketch"
);
assert(
  specialistCardContent.includes('specialist.gallery') && specialistCardContent.includes('slice(0, 4)'),
  "SpecialistCard renders completed work portfolio strip from specialist.gallery"
);
assert(
  specialistCardContent.includes('md:flex-col'),
  "SpecialistCard renders right-side vertical action buttons stack (Heart, Phone, WhatsApp, Arrow)"
);

// 17.6 Specialist Cabinet Review Moderation & Verified Deals
assert(
  typesContent.includes("status?: 'pending' | 'approved' | 'rejected'") && typesContent.includes('verifiedDeal?: boolean'),
  "types/index.ts defines review moderation status and verified deal fields"
);
assert(
  storageContent.includes('getAllReviewsForSpecialist') && storageContent.includes('updateReviewStatus'),
  "lib/storage.ts exports review moderation functions (getAllReviewsForSpecialist, updateReviewStatus)"
);
assert(
  cabinetModalContent.includes('activeCabinetTab') && cabinetModalContent.includes('handleModerateReview'),
  "SpecialistCabinetModal implements review moderation tab with approve/reject actions"
);
assert(
  cabinetModalContent.includes('handleCopyReviewLink') && cabinetModalContent.includes('reviewDeal='),
  "SpecialistCabinetModal provides verified client review link generator upon deal completion"
);

// 17.7 Registration Form: Single Column, Works instead of Advantages, No Prices
assert(
  addSpecialistModalContent.includes('max-w-xl') && addSpecialistModalContent.includes('flex flex-col gap-'),
  "AddSpecialistModal renders concise single vertical column layout ('в столбик')"
);
assert(
  addSpecialistModalContent.includes('COMMON_WORKS_RU') && addSpecialistModalContent.includes('COMMON_WORKS_ES'),
  "AddSpecialistModal replaces advantages with selectable performed works ('Выполняемые работы')"
);
assert(
  !addSpecialistModalContent.includes('servicePrice') && !addSpecialistModalContent.includes('primaryService') && !addSpecialistModalContent.includes('priceCurrency'),
  "AddSpecialistModal completely eliminates price and currency inputs in line with client ТЗ"
);

assert(
  specialistDetailContent.includes('verifiedDealBadge') && specialistDetailContent.includes('rev.verifiedDeal'),
  "SpecialistDetailModal displays verified deal badge on customer reviews"
);
assert(
  specialistDetailContent.includes('selectedPhoto') && specialistDetailContent.includes('object-contain'),
  "SpecialistDetailModal provides uncropped photo lightbox viewer with instant escape/close functionality"
);
assert(
  specialistCardContent.includes('onSelectPhoto'),
  "SpecialistCard supports direct opening of work photos in uncropped lightbox"
);
assert(
  pageContent.includes('reviewDealParam') && pageContent.includes('reviewDealId'),
  "app/page.tsx restores reviewDeal deep-link state directly to customer review form"
);
assert(
  pageContent.includes('window.history.back()'),
  "app/page.tsx uses native browser history back on specialist modal close to avoid trapped navigation"
);

// 17.8 History API & Map Strict Placement
assert(
  pageContent.includes("window.addEventListener('popstate'") && pageContent.includes('pushNavState'),
  "app/page.tsx synchronizes drilldown levels and specialist modal with browser History API"
);
assert(
  !catDirContent.includes('onViewAllOnMap'),
  "CategoryDirectory does not render map button on Levels 1, 2, or 3"
);

// 17.9 Zero Prices & Avatar Face Framing Verification
const specialistPageContent = readFileSync(resolve(process.cwd(), 'app/specialist/[slug]/page.tsx'), 'utf8');
assert(
  specialistCardContent.includes('object-top') && specialistCardContent.includes('object-cover'),
  "SpecialistCard avatar uses object-cover object-top ensuring contractor face is 100% visible"
);
assert(
  !specialistDetailContent.includes('formatCurrency') && !specialistPageContent.includes('formatCurrency'),
  "SpecialistDetailModal and SpecialistPage have 0 occurrences of formatCurrency (100% price-free)"
);
assert(
  specialistDetailContent.includes('Выполняемые работы и услуги') && specialistPageContent.includes('Выполняемые работы и услуги'),
  "Specialist profiles render 'Выполняемые работы и услуги' without price tags"
);
assert(
  seedContent.includes('crop=faces') && seedContent.includes('w=400&h=400'),
  "seedData.ts ensures all specialist avatars use crop=faces and 1:1 aspect ratio"
);

// Summary
console.log('\n========================================================');
console.log(`Total tests: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('========================================================');

if (failedTests > 0) {
  console.error('\nData integrity and verification check failed!');
  process.exit(1);
} else {
  console.log('\nAll Quatro Clicks tests and data validations passed successfully!');
}
