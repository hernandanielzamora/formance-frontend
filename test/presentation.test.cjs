const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { renderToStaticMarkup } = require('react-dom/server');

const modules = new Map();
function load(file) {
  file = path.resolve(file);
  if (modules.has(file)) return modules.get(file);
  const exports = {}; modules.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, require(key) {
    if (!key.startsWith('.') && !key.startsWith('@/')) return require(key);
    const base = key.startsWith('@/') ? path.resolve('src', key.slice(2)) : path.resolve(path.dirname(file), key);
    return load(['.tsx', '.ts'].map(ext => base + ext).find(candidate => fs.existsSync(candidate)));
  } });
  return exports;
}
const { slides } = load('src/presentation/slides.tsx');

test('Product pitch has nine ordered scenes, assigned speakers and a seven-minute introduction', () => {
  assert.deepEqual(Array.from(slides, slide => slide.id), ['inicio', 'equipo', 'problema', 'mercado', 'posicionamiento', 'propuesta', 'experiencia', 'demo', 'cierre']);
  assert.deepEqual(Array.from(slides, slide => slide.speaker), ['Hernán', 'Hernán', 'Hernán', 'Nahuel', 'Nahuel', 'Diego', 'Matías', 'Matías', 'Hernán']);
  assert.equal(slides[7].handoffTo, 'Hernán');
  assert.equal(slides.slice(0, 8).reduce((sum, slide) => sum + slide.durationSeconds, 0), 420);
  assert.equal(slides[8].theme, 'dark');
});

test('Visible pitch stays focused on the product; technical explanations belong in notes or backup', () => {
  const forbidden = /elicitación|relevamiento|diagnóstico|AS-IS|TO-BE|RF01|RNF|CU01|stakeholders|modelo de negocio|requerimientos|casos de uso|UML|Next\.js|React|TypeScript|Express|Firebase|USDA|Gemini/i;
  for (const slide of slides) {
    const markup = renderToStaticMarkup(slide.render);
    assert.doesNotMatch(markup.replace(/<[^>]+>/g, ''), forbidden, slide.id);
    assert.match(markup, new RegExp(`id="${slide.id}-title"`));
    assert.ok(slide.notes.length > 0);
  }
  const demoNotes = slides[7].notes.join(' ');
  for (const text of ['FLOW 1', 'FLOW 2', 'PROGRESO', 'RESUMEN', 'Gemini estima', 'Los cálculos los realiza el sistema']) assert.ok(demoNotes.includes(text));
});

test('The complete academic deck is preserved and six backup topics never enter the public registry', () => {
  const { academicDeck } = load('src/presentation/academic-deck.tsx');
  const { backupSlides } = load('src/presentation/backup-deck.tsx');
  assert.equal(academicDeck.length, 21);
  assert.equal(backupSlides.length, 6);
  for (const slide of backupSlides) assert.ok(!slides.some(main => main.id === slide.id));
  assert.deepEqual(Array.from(backupSlides, slide => slide.title), ['Stack tecnológico', 'Arquitectura', 'Requerimientos funcionales', 'Casos de uso', 'RNF · calidad y modelado', 'AS-IS / diagnóstico']);
});
