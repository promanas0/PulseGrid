import * as esbuild from 'esbuild';

async function build() {
  console.log("Building Reown AppKit bundle with esbuild...");
  
  await esbuild.build({
    entryPoints: ['scripts/reown-appkit-entry.js'],
    bundle: true,
    minify: true,
    format: 'iife',
    outfile: 'reown-appkit.bundle.js',
    target: ['chrome100', 'firefox100', 'safari15'],
    define: {
      'process.env.NODE_ENV': '"production"',
      'global': 'window',
    },
    banner: {
      js: `
if (typeof window !== 'undefined') {
  window.global = window;
  if (!window.process) {
    window.process = {
      env: { NODE_ENV: 'production' },
      version: 'v20.0.0',
      versions: {},
      platform: 'browser',
      nextTick: function(fn) { setTimeout(fn, 0); }
    };
  }
}
      `,
    },
  });

  console.log("Build complete: reown-appkit.bundle.js successfully created!");
}

build().catch(err => {
  console.error("Build failed:", err);
  process.exit(1);
});
