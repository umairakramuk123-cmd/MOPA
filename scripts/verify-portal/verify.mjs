/**
 * End-to-end verification for public/mopa-portal.html.
 *
 *   npm run verify:portal
 *
 * Boots the real single file in jsdom and drives it like a user: sign-in,
 * every view, sorting, the command palette, all fifteen reports, settings,
 * reset, focus handling, plus a static accessibility sweep and a cross-view
 * number audit. Exits non-zero when anything regresses.
 */
import { boot, assert } from './lib.mjs';

const results = [];
const check = async (name, fn) => {
  const started = Date.now();
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail, ms: Date.now() - started });
    console.log(`  PASS  ${name}${detail ? ' — ' + detail : ''}`);
  } catch (e) {
    results.push({ name, ok: false, detail: e.message, ms: Date.now() - started });
    console.log(`  FAIL  ${name} — ${e.message}`);
  }
};
const section = (title) => console.log('\n' + title);

const VIEWS = ['dashboard', 'executive', 'bills', 'tracking', 'committees', 'documents', 'alerts',
  'reports', 'ministries', 'approvals', 'users', 'audit', 'settings', 'profile', 'help'];

/* ---------------------------------------------------------------- sign-in */
section('Sign-in');
let ctx = boot();
{
  const { $, $$, click, sleep, window, document } = ctx;
  await check('seven roles offered on the animated login', async () => {
    await sleep(300);
    assert($$('.role-tile').length === 7, 'expected seven role tiles');
    return $$('.role-tile').map((t) => t.getAttribute('data-role')).join(', ');
  });
  await check('role → OTP → portal', async () => {
    click('.role-tile[data-role="data-manager"]'); await sleep(100);
    click('#continueBtn'); await sleep(150);
    assert(!$('#stepOtp').hidden, 'OTP step did not open');
    click('#otpFill'); await sleep(50);
    click('#verifyBtn'); await sleep(900);
    assert($('#login').classList.contains('done'), 'portal did not open');
    assert(!$('#app').hidden, 'app is still hidden');
    return 'signed in as Data Manager';
  });
  await check('sign-out restores the login and clears the hash', async () => {
    click('#userBtn'); await sleep(150);
    click('[data-act="signout"]'); await sleep(300);
    assert(!$('#login').classList.contains('done'), 'login overlay not restored');
    assert(window.location.hash === '' || window.location.hash === '#', 'hash not cleared: ' + window.location.hash);
  });
  await check('no runtime errors during sign-in', async () => {
    assert(ctx.errors.length === 0, ctx.errors.join(' | '));
  });
  ctx.dom.window.close();
}

/* ------------------------------------------------------------ every view */
section('Views');
ctx = boot();
{
  const { $, $$, click, sleep, enter, document } = ctx;
  await sleep(300);
  await enter('super-admin');
  await check('all fifteen views render a headline and content', async () => {
    const seen = [];
    for (const v of VIEWS) {
      const nav = $(`.nav-item[data-nav="${v}"]`);
      assert(nav, 'missing nav entry for ' + v);
      click(nav); await sleep(220);
      const title = $('.page-title');
      assert(title, 'no page title on ' + v);
      assert($('#view').innerHTML.length > 600, 'view too small: ' + v);
      assert($('#srStatus').textContent.includes('opened'), 'live region not updated for ' + v);
      seen.push(title.textContent.trim());
    }
    return seen.length + ' views';
  });
  await check('no runtime errors while touring views', async () => {
    assert(ctx.errors.length === 0, ctx.errors.join(' | '));
  });
  await check('every rendered action has a handler', async () => {
    const seen = new Set();
    for (const v of VIEWS) {
      const nav = $(`.nav-item[data-nav="${v}"]`);
      if (!nav) continue;
      click(nav); await sleep(180);
      $$('[data-act]').forEach((el) => seen.add(el.getAttribute('data-act')));
    }
    // overlays
    for (const act of ['new-bill', 'upload-doc', 'invite-user']) {
      const el = $(`[data-act="${act}"]`);
      if (!el) continue;
      click(el); await sleep(150);
      $$('[data-act]').forEach((n) => seen.add(n.getAttribute('data-act')));
      click('[data-act="close-modal"]'); await sleep(120);
    }
    const fs = await import('node:fs');
    const src = fs.readFileSync('public/mopa-portal.html', 'utf8');
    const handled = new Set([...src.matchAll(/case "([a-z0-9-]+)":/g)].map((m) => m[1]));
    ['open-bill', 'search-doc', 'search-ministry', 'search-report', 'search-view'].forEach((a) => handled.add(a));
    const dead = [...seen].filter((a) => !handled.has(a));
    assert(dead.length === 0, 'unhandled actions: ' + dead.join(', '));
    return seen.size + ' actions';
  });
}

/* --------------------------------------------------------- accessibility */
section('Accessibility');
{
  const { $, $$, click, sleep, document } = ctx;
  await check('no duplicate ids, unlabelled controls or empty buttons', async () => {
    const problems = [];
    for (const v of VIEWS) {
      const nav = $(`.nav-item[data-nav="${v}"]`);
      if (!nav) continue;
      click(nav); await sleep(200);
      const ids = $$('[id]').map((e) => e.id);
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      if (dupes.length) problems.push(v + ': duplicate ids ' + [...new Set(dupes)].join(','));
      $$('button').forEach((b) => {
        if (!b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')) {
          problems.push(v + ': empty button ' + b.className);
        }
      });
      $$('input:not([type="hidden"]), select, textarea').forEach((i) => {
        const labelled = i.closest('label') || i.getAttribute('aria-label') || i.getAttribute('placeholder');
        if (!labelled) problems.push(v + ': unlabelled ' + (i.name || i.className));
      });
      $$('[aria-sort]').forEach((th) => {
        if (!['none', 'ascending', 'descending', 'other'].includes(th.getAttribute('aria-sort'))) {
          problems.push(v + ': bad aria-sort');
        }
      });
      $$('.chart').forEach((c) => {
        if (c.getAttribute('role') !== 'img' || !c.getAttribute('aria-label')) problems.push(v + ': unlabelled chart');
      });
    }
    assert(problems.length === 0, problems.slice(0, 4).join(' | '));
    return '15 views clean';
  });
  await check('focus is trapped in modals and restored on close', async () => {
    click('[data-nav="bills"]'); await sleep(250);
    const trigger = $('[data-act="new-bill"]');
    trigger.focus();
    click(trigger); await sleep(250);
    const modal = $('#modal');
    const focusables = [...modal.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)')];
    focusables[focusables.length - 1].focus();
    ctx.key(document.activeElement, 'Tab');
    await sleep(80);
    assert(document.activeElement === focusables[0], 'tab did not wrap inside the modal');
    ctx.key(document.activeElement, 'Escape');
    await sleep(150);
    assert(!modal.classList.contains('on'), 'Escape did not close the modal');
    assert(document.activeElement === trigger, 'focus was not returned to the trigger');
    return 'trap + restore';
  });
  await check('drawer traps Tab and closes on Escape', async () => {
    click('#bills-table tbody tr'); await sleep(300);
    const drawer = $('#drawer');
    assert(drawer.classList.contains('on'), 'drawer did not open');
    assert(document.activeElement === drawer, 'drawer did not take focus');
    const items = [...drawer.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter((el) => el.offsetParent !== null || drawer.contains(el));
    items[items.length - 1].focus();
    ctx.key(document.activeElement, 'Tab');
    await sleep(60);
    assert(document.activeElement === items[0], 'drawer tab did not wrap');
    ctx.key(document.activeElement, 'Escape');
    await sleep(150);
    assert(!drawer.classList.contains('on'), 'Escape did not close the drawer');
  });
}

/* --------------------------------------------------------------- sorting */
section('Registry');
{
  const { $, $$, click, sleep, type, document } = ctx;
  await check('seven sortable columns publish aria-sort', async () => {
    click('[data-nav="bills"]'); await sleep(250);
    const heads = $$('#bills-table thead th');
    assert(heads.length === 7, 'expected seven columns, found ' + heads.length);
    click($('#bills-table .th-sort[data-key="title"]')); await sleep(180);
    assert($('#bills-table thead th:nth-child(1)').getAttribute('aria-sort') === 'ascending', 'title did not sort ascending');
    const first = $('#bills-table tbody tr').getAttribute('data-id');
    click($('#bills-table .th-sort[data-key="title"]')); await sleep(180);
    assert($('#bills-table thead th:nth-child(1)').getAttribute('aria-sort') === 'descending', 'title did not reverse');
    const second = $('#bills-table tbody tr').getAttribute('data-id');
    assert(first !== second, 'order did not change');
    assert($('#srStatus').textContent.startsWith('Sorted by'), 'sort was not announced');
    return 'asc/desc + announcement';
  });
  await check('search filters in place and keeps focus', async () => {
    type('[data-field="billQ"]', 'finance'); await sleep(200);
    const rows = $$('#bills-table tbody tr').length;
    assert(rows > 0 && rows < 10, 'search did not narrow the table');
    assert(document.activeElement === $('[data-field="billQ"]'), 'focus left the search box');
    type('[data-field="billQ"]', 'zzzz'); await sleep(200);
    assert($('#bills-table').textContent.includes('No bills match'), 'missing empty state');
    click('[data-act="reset-bills"]'); await sleep(200);
    assert($$('#bills-table tbody tr').length === 10, 'reset did not restore the page');
    return '15 → ' + rows + ' → empty → reset';
  });
  await check('deadline column only shows live committee clocks', async () => {
    click($('#bills-table .th-sort[data-key="deadline"]')); await sleep(200);
    const cells = $$('#bills-table tbody tr').map((r) => r.children[5].textContent.trim());
    assert(cells.every((c) => c !== '—'), 'expected live deadlines first');
    return cells[0];
  });
}

/* --------------------------------------------------------------- palette */
section('Command palette');
{
  const { $, $$, click, sleep, type, key, document } = ctx;
  await check('results span bills, documents, divisions, reports and pages', async () => {
    const input = $('#globalSearch');
    input.focus();
    type('#globalSearch', 'bill'); await sleep(200);
    const kinds = new Set($$('#searchPop .sr-item').map((i) => i.getAttribute('data-kind')));
    assert(kinds.size >= 3, 'expected several result kinds, got ' + [...kinds].join(','));
    assert(input.getAttribute('aria-expanded') === 'true', 'combobox not expanded');
    assert(input.getAttribute('aria-activedescendant'), 'no active option');
    key(input, 'ArrowDown'); await sleep(80);
    const active = input.getAttribute('aria-activedescendant');
    assert(active && active.startsWith('sr-opt-'), 'active descendant not tracked');
    return [...kinds].join(', ');
  });
  await check('Enter opens the highlighted result', async () => {
    const input = $('#globalSearch');
    type('#globalSearch', 'audit'); await sleep(200);
    key(input, 'Enter'); await sleep(350);
    assert($('#searchPop').hidden, 'palette stayed open');
    assert(input.getAttribute('aria-expanded') === 'false', 'aria-expanded not reset');
  });
  await check('Escape closes without errors', async () => {
    type('#globalSearch', 'finance'); await sleep(200);
    key($('#globalSearch'), 'Escape'); await sleep(150);
    assert($('#searchPop').hidden, 'Escape did not close the palette');
  });
}

/* --------------------------------------------------------------- reports */
section('Statutory reports');
{
  const { $, $$, click, sleep, window } = ctx;
  await check('all fifteen reports build a live preview', async () => {
    click('[data-nav="reports"]'); await sleep(300);
    const ids = [...new Set($$('[data-act="generate-report"]').map((b) => b.getAttribute('data-id')))];
    assert(ids.length === 15, 'expected fifteen reports, found ' + ids.length);
    const shapes = [];
    for (const id of ids) {
      click($(`[data-act="generate-report"][data-id="${id}"]`)); await sleep(140);
      const title = $('.modal-title')?.textContent.trim();
      assert(title, 'no preview for ' + id);
      const rows = $$('#modal .report-table tbody tr').length;
      const cols = $$('#modal .report-table thead th').length;
      assert(rows > 0 && cols > 0, 'empty preview for ' + id);
      shapes.push(`${id}:${rows}x${cols}`);
      click('[data-act="close-modal"]'); await sleep(100);
    }
    return shapes.join(' ');
  });
  await check('CSV export and print sheet work', async () => {
    click($('[data-act="generate-report"][data-id="R-01"]')); await sleep(200);
    click('[data-act="report-export"]'); await sleep(200);
    assert($$('#toasts .toast').pop().textContent.includes('Report downloaded'), 'no export confirmation');
    click('[data-act="report-print"]'); await sleep(300);
    const rows = $$('#printSheet tbody tr').length;
    assert(rows > 40, 'print sheet missing rows: ' + rows);
    assert(window.__prints === 1, 'window.print was not called');
    return rows + ' rows printable';
  });
}

/* -------------------------------------------------------------- settings */
section('Settings');
{
  const { $, $$, click, sleep, window, document } = ctx;
  await check('pausing a rule mutes alerts everywhere', async () => {
    click('[data-nav="settings"]'); await sleep(250);
    const toggle = $('[data-setting="committee"]');
    toggle.checked = false;
    toggle.dispatchEvent(new window.Event('change', { bubbles: true }));
    await sleep(300);
    const bell = $('#bellBtn').getAttribute('aria-label');
    click('[data-nav="alerts"]'); await sleep(300);
    const banner = $('.banner')?.textContent || '';
    assert(/muted/i.test(banner), 'no muted banner: ' + banner.slice(0, 80));
    assert(bell === '0 open alerts' || parseInt(bell, 10) < 8, 'bell did not follow the rule');
    return bell + ' · ' + banner.replace(/\s+/g, ' ').slice(0, 48);
  });
  await check('compact density applies to the document', async () => {
    click('[data-nav="settings"]'); await sleep(200);
    const compact = $('[data-setting="compact"]');
    compact.checked = true;
    compact.dispatchEvent(new window.Event('change', { bubbles: true }));
    await sleep(150);
    assert(document.body.classList.contains('density-compact'), 'density class missing');
  });
  await check('reset restores the seeded dataset', async () => {
    click('[data-act="reset-demo"]'); await sleep(200);
    assert($('#modal').classList.contains('on'), 'reset confirmation did not open');
    click('[data-act="reset-demo-confirm"]'); await sleep(300);
    assert(!$('#modal').classList.contains('on'), 'reset modal stayed open');
    click('[data-nav="bills"]'); await sleep(250);
    assert($('.table-foot').textContent.includes('of 54 bills'), 'registry not restored: ' + $('.table-foot').textContent.trim());
    return '54 bills';
  });
}

/* ---------------------------------------------------------- consistency */
section('Number consistency');
{
  const { $, $$, click, sleep, window } = ctx;
  await check('overdue and committee counts agree across views', async () => {
    click('[data-nav="dashboard"]'); await sleep(900);
    const dash = { total: ctx.kpi('Total bills'), committee: ctx.kpi('In committee review'), overdue: ctx.kpi('Overdue deadlines') };
    click('[data-nav="committees"]'); await sleep(900);
    const com = { committee: ctx.kpi('Before committee'), overdue: ctx.kpi('Overdue reports') };
    click('[data-nav="ministries"]'); await sleep(900);
    const min = { overdue: ctx.mini('Overdue clocks'), total: ctx.mini('Bills in scope') };
    click('[data-nav="bills"]'); await sleep(400);
    const registry = ctx.mini('Total bills');
    assert(dash.total === registry && dash.total === min.total, 'bill totals disagree');
    assert(dash.committee === com.committee, 'committee totals disagree');
    assert(dash.overdue === com.overdue && com.overdue === min.overdue, 'overdue totals disagree');
    return `${dash.total} bills · ${dash.committee} in committee · ${dash.overdue} overdue`;
  });
  await check('acknowledging an alert updates the bell', async () => {
    click('[data-nav="alerts"]'); await sleep(300);
    // restore the committee rule so the list has items again
    click('[data-nav="settings"]'); await sleep(250);
    const toggle = $('[data-setting="committee"]');
    toggle.checked = true;
    toggle.dispatchEvent(new window.Event('change', { bubbles: true }));
    await sleep(300);
    click('[data-nav="alerts"]'); await sleep(300);
    const before = $('#bellBtn').getAttribute('aria-label');
    const ack = $('[data-act="ack-alert"]');
    assert(ack, 'no alert to acknowledge');
    click(ack); await sleep(300);
    const after = $('#bellBtn').getAttribute('aria-label');
    assert(before !== after, 'bell did not change');
    return before + ' → ' + after;
  });
  ctx.dom.window.close();
}

/* -------------------------------------------------------------- role matrix */
section('Roles and scope');
{
  const matrix = [];
  for (const role of ['super-admin', 'data-manager', 'secretary', 'ministry', 'law-justice', 'pmo', 'secretariat']) {
    const c = boot();
    await c.sleep(300);
    await c.enter(role);
    const navs = [...new Set(c.$$('.nav-item[data-nav]').map((n) => n.getAttribute('data-nav')))];
    let broken = null;
    for (const v of navs) {
      c.click(`.nav-item[data-nav="${v}"]`);
      await c.sleep(160);
      if (!c.$('.page-title')) broken = v;
      if (c.errors.length) broken = v + ' (' + c.errors[0] + ')';
    }
    matrix.push({ role, navs: navs.length, broken });
    c.dom.window.close();
  }
  await check('every role opens every permitted view', async () => {
    const bad = matrix.filter((m) => m.broken);
    assert(bad.length === 0, bad.map((b) => b.role + ' at ' + b.broken).join(', '));
    return matrix.map((m) => `${m.role}:${m.navs}`).join(' ');
  });
  await check('division users stay inside their scope', async () => {
    const c = boot();
    await c.sleep(300);
    await c.enter('ministry');
    c.click('[data-nav="bills"]'); await c.sleep(300);
    const scoped = c.mini('Total bills');
    c.click('[data-nav="ministries"]'); await c.sleep(300);
    const rows = c.$$('#ministry-rows tr').length;
    const inScope = c.mini('Bills in scope');
    assert(rows === 1, 'division user sees ' + rows + ' divisions');
    assert(scoped === inScope, 'scope totals disagree');
    c.dom.window.close();
    return scoped + ' bills, one division';
  });
}

/* ------------------------------------------------------------------ output */
const failed = results.filter((r) => !r.ok);
const passed = results.length - failed.length;
console.log(`\n${passed}/${results.length} checks passed`);
if (failed.length) {
  console.log('\nFailures:');
  failed.forEach((f) => console.log(`  · ${f.name}: ${f.detail}`));
  process.exit(1);
}
console.log('PORTAL VERIFICATION PASSED');
process.exit(0);
