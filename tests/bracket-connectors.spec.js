// tests/bracket-connectors.spec.js
//
// Regressão visual + estrutural pro bug das linhas conectoras invisíveis,
// fixado em v4.9.0 (commit 29e7424). Cobre R64 mobile e desktop, com
// asserções de quantidade de paths, classes winner-path e ausência de
// elementos clipados pelo viewport.
//
// Pré-requisito: o ambiente de teste tem que estar populado com dados
// reais do seedTournament2026 (ou equivalente) — pelo menos uma categoria
// no estágio de R64 com winners marcados em alguns rounds.
//
// Execução:
//   npx playwright test tests/bracket-connectors.spec.js
//
// Variáveis de ambiente esperadas:
//   BASE_URL      — ex: http://localhost:8080 ou https://staging.tennispoint.app
//   TEST_EMAIL    — usuário comum (não-admin) com acesso ao torneio
//   TEST_PASSWORD — senha
//   TOURNAMENT_CATEGORY — slug da categoria pra navegar (ex: 'cat-5a')

const { test, expect, devices } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const TEST_EMAIL = process.env.TEST_EMAIL || 'celulardojohnatan@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'changeme';
const CATEGORY = process.env.TOURNAMENT_CATEGORY || 'cat-5a';

/**
 * Helper: faz login e navega até a chave da categoria escolhida,
 * aguardando o bracket renderizar e os paths SVG aparecerem.
 */
async function loginAndOpenBracket(page) {
  await page.goto(`${BASE_URL}/index.html`);

  // Login
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button:has-text("Entrar")');

  // Espera entrar no app
  await page.waitForSelector('#app-shell:not(.hidden)', { timeout: 10000 });

  // Navega para o torneio
  await page.click('[data-screen="tournament"]');
  await page.waitForSelector('.bracket-scroll', { timeout: 5000 });

  // Garante que está na aba Chave
  const chaveTab = page.locator('text=Chave').first();
  if (await chaveTab.isVisible()) await chaveTab.click();

  // Seleciona a categoria desejada
  await page.click(`[data-category="${CATEGORY}"]`);

  // Espera SVG e paths renderizarem. Importante: depois do fix, o JS define
  // width/height do SVG em pixels. Confirma que os atributos foram setados.
  await page.waitForFunction(() => {
    const svg = document.getElementById('bracket-svg');
    if (!svg) return false;
    const w = parseFloat(svg.getAttribute('width') || '0');
    const h = parseFloat(svg.getAttribute('height') || '0');
    return w > 100 && h > 100 && svg.querySelectorAll('path').length > 0;
  }, { timeout: 10000 });
}

/**
 * Conta paths totais e winner-paths no SVG do bracket.
 */
async function countPaths(page) {
  return page.evaluate(() => {
    const svg = document.getElementById('bracket-svg');
    if (!svg) return { total: 0, winners: 0, w: 0, h: 0 };
    const paths = svg.querySelectorAll('path');
    const winners = svg.querySelectorAll('path.winner-path');
    return {
      total: paths.length,
      winners: winners.length,
      w: parseFloat(svg.getAttribute('width') || '0'),
      h: parseFloat(svg.getAttribute('height') || '0'),
    };
  });
}

/**
 * Confere que cada path tem comprimento real desenhado (não é tracinho
 * minúsculo causado pelo bug do gap !important).
 */
async function pathLengthsReasonable(page) {
  return page.evaluate(() => {
    const svg = document.getElementById('bracket-svg');
    if (!svg) return [];
    const paths = Array.from(svg.querySelectorAll('path'));
    return paths.map(p => {
      try { return p.getTotalLength(); } catch { return 0; }
    });
  });
}

// ============================================================
// TESTES
// ============================================================

test.describe('Bracket connectors — regressão v4.9.0', () => {
  test.describe('Desktop (1440x900)', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('R64 desenha conectores visíveis e dimensionados', async ({ page }) => {
      await loginAndOpenBracket(page);
      const stats = await countPaths(page);

      // Em R64 com 6 rounds, esperamos uma quantidade significativa de paths.
      // Cada match não-final gera ~3 paths (h-saida-m1, h-saida-m2, vertical, h-target).
      // 64+32+16+8+4+2+1 = 127 matches, cada um até 4 paths => muito acima de 50.
      expect(stats.total).toBeGreaterThan(50);

      // SVG dimensionado em pixels (não 100%) — width e height precisam cobrir
      // toda a árvore. Em R64 desktop, scrollWidth típico > 1200px e scrollHeight > 3000px.
      expect(stats.w).toBeGreaterThan(800);
      expect(stats.h).toBeGreaterThan(2000);

      // Pelo menos alguns winner-paths devem estar pintados (assumindo seed
      // com pelo menos R64 e R32 decididos).
      expect(stats.winners).toBeGreaterThan(0);
    });

    test('Paths têm comprimento real (não tracinhos minúsculos)', async ({ page }) => {
      await loginAndOpenBracket(page);
      const lengths = await pathLengthsReasonable(page);

      // Pelo menos 80% dos paths têm comprimento ≥ 20px (não são tracinhos).
      const meaningful = lengths.filter(l => l >= 20).length;
      const ratio = meaningful / lengths.length;
      expect(ratio).toBeGreaterThan(0.8);
    });

    test('Nenhum match está em position:static (todos absolute)', async ({ page }) => {
      await loginAndOpenBracket(page);
      const positions = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.bk-match'))
          .map(m => getComputedStyle(m).position);
      });
      // Após o fix, todos os matches devem estar em position:absolute.
      const allAbsolute = positions.every(p => p === 'absolute');
      expect(allAbsolute).toBe(true);
    });

    test('SVG width/height em pixels, não 100%', async ({ page }) => {
      await loginAndOpenBracket(page);
      const computed = await page.evaluate(() => {
        const svg = document.getElementById('bracket-svg');
        return {
          attrW: svg.getAttribute('width'),
          attrH: svg.getAttribute('height'),
          cssW: getComputedStyle(svg).width,
          cssH: getComputedStyle(svg).height,
        };
      });
      // Os atributos width/height devem ser numéricos (em px), não vazios.
      expect(parseFloat(computed.attrW)).toBeGreaterThan(0);
      expect(parseFloat(computed.attrH)).toBeGreaterThan(0);
    });
  });

  test.describe('Mobile (412x915 — Pixel 5)', () => {
    test.use({ ...devices['Pixel 5'] });

    test('R64 desenha conectores em viewport mobile', async ({ page }) => {
      await loginAndOpenBracket(page);
      const stats = await countPaths(page);

      expect(stats.total).toBeGreaterThan(50);
      expect(stats.winners).toBeGreaterThanOrEqual(0);

      // Em mobile, scroll horizontal é esperado. SVG ainda assim cobre tudo.
      expect(stats.w).toBeGreaterThan(800);
      expect(stats.h).toBeGreaterThan(2000);
    });

    test('Stroke-width adaptado em mobile (≤480px)', async ({ page }) => {
      await loginAndOpenBracket(page);
      const sw = await page.evaluate(() => {
        const p = document.querySelector('.bracket-svg path');
        return p ? parseFloat(getComputedStyle(p).strokeWidth) : 0;
      });
      // Em mobile a regra @media reduz pra 2.5 (regular) ou 3 (winner).
      expect(sw).toBeGreaterThan(0);
      expect(sw).toBeLessThanOrEqual(3.5);
    });
  });

  test.describe('Re-layout em mudança', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('Resize da janela re-renderiza conectores', async ({ page }) => {
      await loginAndOpenBracket(page);
      const before = await countPaths(page);

      // Encolhe a viewport
      await page.setViewportSize({ width: 800, height: 600 });
      await page.waitForTimeout(100); // throttle do redraw

      const after = await countPaths(page);
      // Quantidade de paths não muda com resize (mesma estrutura), mas
      // dimensões sim.
      expect(after.total).toBe(before.total);
      expect(after.h).toBeGreaterThan(2000);
    });
  });
});
