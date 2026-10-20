/**
 * Boot the single-file portal in jsdom.
 *
 * ApexCharts is stubbed (jsdom has no layout engine), window.print and
 * downloads are captured, and every console/jsdom error is collected so the
 * suites can fail loudly instead of silently drifting.
 */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const PORTAL = path.resolve(process.cwd(), 'public/mopa-portal.html');

export function boot(options = {}) {
  const { realCharts = false, url = 'https://portal.example/mopa-portal.html' } = options;
  let html = fs.readFileSync(PORTAL, 'utf8');
  if (!realCharts) {
    html = html.replace(/<script>\/\*!\s*\n \* ApexCharts[\s\S]*?<\/script>/, '<script>/* apex stripped */</script>');
  }

  const errors = [];
  const console_ = new VirtualConsole();
  console_.on('jsdomError', (e) => {
    if (!/Not implemented: (window\.(scrollTo|print|alert)|navigation)/.test(e.message)) {
      errors.push('jsdomError: ' + e.message);
    }
  });
  console_.on('error', (m) => errors.push('console.error: ' + m));

  const dom = new JSDOM(html, {
    url,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: console_,
    beforeParse(window) {
      if (!realCharts) {
        window.ApexCharts = class {
          constructor(el, opts) { this.el = el; this.opts = opts; }
          render() { return Promise.resolve(); }
          destroy() {}
          updateOptions() {}
        };
      }
      window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
      window.SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 100, height: 20 });
      window.HTMLCanvasElement.prototype.getContext = () => null;
      window.scrollTo = () => {};
      window.print = () => { window.__prints = (window.__prints || 0) + 1; };
      window.URL.createObjectURL = () => 'blob:test';
      window.URL.revokeObjectURL = () => {};
      window.matchMedia = window.matchMedia || (() => ({
        matches: false, addListener() {}, removeListener() {},
        addEventListener() {}, removeEventListener() {},
      }));
      window.addEventListener('error', (e) => errors.push('window.error: ' + (e.error ? e.error.stack : e.message)));
      window.addEventListener('unhandledrejection', (e) => errors.push('unhandledrejection: ' + e.reason));
    },
  });

  const { window } = dom;
  const { document } = window;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const click = (target) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) throw new Error('Missing element: ' + target);
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  };
  const type = (target, value) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) throw new Error('Missing input: ' + target);
    el.focus();
    el.value = value;
    el.dispatchEvent(new window.Event('input', { bubbles: true }));
  };
  const key = (target, name, opts = {}) => {
    const el = typeof target === 'string' ? $(target) : target;
    el.dispatchEvent(new window.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...opts }));
  };
  const setField = (form, name, value) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) throw new Error('Missing field: ' + name);
    el.value = value;
    el.dispatchEvent(new window.Event('change', { bubbles: true }));
  };
  const submit = (form) => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  const enter = async (role) => {
    if (role) { click(`.role-tile[data-role="${role}"]`); await sleep(80); }
    click('#skipLogin');
    await sleep(420);
  };
  const kpi = (label) => {
    const card = $$('#view .kpi').find((k) => (k.querySelector('.kpi-label')?.textContent || '').includes(label));
    if (!card) return null;
    return parseInt((card.querySelector('[data-count]')?.textContent || '').replace(/\D/g, ''), 10);
  };
  const mini = (label) => {
    const row = $$('#view .stat-mini').find((m) => m.textContent.includes(label));
    return row ? parseInt(row.textContent.replace(/\D/g, ''), 10) : null;
  };

  return { dom, window, document, errors, sleep, $, $$, click, type, key, setField, submit, enter, kpi, mini };
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}
