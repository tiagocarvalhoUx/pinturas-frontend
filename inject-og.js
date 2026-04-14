const fs   = require('fs');
const path = require('path');

// ── 1. Gera og-image.png 1200x630 comprimido < 600KB ────────────────────────
async function buildOgImage() {
  const src  = path.join(__dirname, 'public', 'og-image.png');
  const dest = path.join(__dirname, 'dist', 'og-image.png');

  if (!fs.existsSync(src)) {
    console.warn('⚠️  public/og-image.png não encontrado');
    return;
  }

  try {
    const sharp = require('sharp');

    // Cria canvas 1200x630 preto + logo centralizado com padding
    await sharp({
      create: {
        width: 1200, height: 630,
        channels: 4,
        background: { r: 10, g: 8, b: 18, alpha: 1 }, // fundo escuro roxo
      },
    })
      .composite([{
        input: await sharp(src)
          .resize(500, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        gravity: 'centre',
      }])
      .png({ quality: 85, compressionLevel: 8 })
      .toFile(dest);

    const kb = Math.round(fs.statSync(dest).size / 1024);
    console.log(`✅ og-image.png gerado 1200×630 — ${kb}KB`);
  } catch (e) {
    // fallback: só copia sem redimensionar
    fs.copyFileSync(src, dest);
    console.log('✅ og-image.png copiado (fallback)');
  }
}

// ── 2. Injeta meta tags no dist/index.html ───────────────────────────────────
function injectMetaTags() {
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  let html = fs.readFileSync(distIndex, 'utf8');

  // Evita injeção dupla
  if (html.includes('og:title')) {
    console.log('ℹ️  OG tags já presentes, pulando injeção');
    return;
  }

  const ogTags = `
    <!-- SEO -->
    <meta name="description" content="Serviços profissionais de pintura residencial e comercial em São Paulo. Solicite orçamento online com fotos e receba resposta em até 24 horas." />

    <!-- Open Graph (WhatsApp, Facebook, Telegram) -->
    <meta property="og:type"         content="website" />
    <meta property="og:url"          content="https://pinturas-reformas.vercel.app/" />
    <meta property="og:title"        content="A. Coraça & T. Carvalho — Pinturas e Reformas SP" />
    <meta property="og:description"  content="Pintura residencial e comercial com qualidade e profissionalismo. Interna, externa, textura e laqueação. Solicite seu orçamento agora com fotos pelo app." />
    <meta property="og:image"        content="https://pinturas-reformas.vercel.app/og-image.png" />
    <meta property="og:image:width"  content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type"   content="image/png" />
    <meta property="og:locale"       content="pt_BR" />
    <meta property="og:site_name"    content="A. Coraça & T. Carvalho Pinturas" />

    <!-- Twitter Card -->
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="A. Coraça & T. Carvalho — Pinturas e Reformas SP" />
    <meta name="twitter:description" content="Pintura residencial e comercial com qualidade. Solicite orçamento com fotos online." />
    <meta name="twitter:image"       content="https://pinturas-reformas.vercel.app/og-image.png" />

    <meta name="theme-color" content="#8A2BE2" />`;

  html = html.replace(/(<\/title>)/, `$1\n${ogTags}`);
  fs.writeFileSync(distIndex, html, 'utf8');
  console.log('✅ OG tags injetadas em dist/index.html');
}

// ── Executa ──────────────────────────────────────────────────────────────────
buildOgImage().then(injectMetaTags);
