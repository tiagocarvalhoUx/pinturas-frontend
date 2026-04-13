const fs = require('fs');
const path = require('path');

const distIndex = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(distIndex, 'utf8');

const ogTags = `
    <!-- SEO -->
    <meta name="description" content="Serviços profissionais de pintura residencial e comercial. Solicite seu orçamento com fotos e receba resposta em até 24h." />

    <!-- Open Graph -->
    <meta property="og:type"         content="website" />
    <meta property="og:url"          content="https://pinturas-reformas.vercel.app/" />
    <meta property="og:title"        content="A. Coraça & T. Carvalho Pinturas e Reformas" />
    <meta property="og:description"  content="Pintura residencial e comercial com qualidade. Solicite orçamento com fotos online." />
    <meta property="og:image"        content="https://pinturas-reformas.vercel.app/og-image.png" />
    <meta property="og:image:width"  content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale"       content="pt_BR" />
    <meta property="og:site_name"    content="A. Coraça & T. Carvalho Pinturas" />

    <!-- Twitter Card -->
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="A. Coraça & T. Carvalho Pinturas e Reformas" />
    <meta name="twitter:description" content="Pintura residencial e comercial com qualidade. Solicite orçamento com fotos online." />
    <meta name="twitter:image"       content="https://pinturas-reformas.vercel.app/og-image.png" />

    <meta name="theme-color" content="#8A2BE2" />`;

// Inject right after <title>...</title>
html = html.replace(/(<\/title>)/, `$1\n${ogTags}`);

fs.writeFileSync(distIndex, html, 'utf8');
console.log('✅ OG tags injetadas em dist/index.html');

// Copy og-image.png to dist/
const src  = path.join(__dirname, 'public', 'og-image.png');
const dest = path.join(__dirname, 'dist', 'og-image.png');
if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('✅ og-image.png copiado para dist/');
}
