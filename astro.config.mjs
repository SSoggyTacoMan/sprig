import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'
import svelte from '@astrojs/svelte'
import rehypeExternalLinks from 'rehype-external-links'
import fs from "node:fs";
import { Buffer } from 'node:buffer';
import buffer from 'node:buffer';
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const preactCompat = path.resolve(__dirname, 'node_modules/preact/compat/dist/compat.module.js');
const preactCompatJsx = path.resolve(__dirname, 'node_modules/preact/compat/jsx-runtime.mjs');
const preactTestUtils = path.resolve(__dirname, 'node_modules/preact/test-utils/dist/testUtils.module.js');

if (typeof buffer.SlowBuffer === 'undefined') {
	buffer.SlowBuffer = class SlowBuffer extends Buffer {};
}
import generateMetadata from "./src/integrations/generate-metadata"
import vercel from "@astrojs/vercel"
const gameFiles = fs.readdirSync("games").filter(f => f.endsWith(".js")).map(game => `./games/${game}`);



export default defineConfig({
	site: 'https://sprig.hackclub.com',
	devToolbar: { enabled: false },
	integrations: [
		preact({ compat: true }),
		svelte(),
		generateMetadata()
	],
	output: 'server',
	adapter: vercel(),
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					api: 'modern'
				}
			}
		},
		resolve: {
			alias: {
				react: preactCompat,
				'react-dom': preactCompat,
				'react-dom/test-utils': preactTestUtils,
				'react/jsx-runtime': preactCompatJsx,
			}
		},
		server: {
      allowedHosts: [
				"sprig.hackclub.com",
        "d444gocccow80c8wkgsg4sss.a.selfhosted.hackclub.com"
      ],
      host: true, // Allow access from non-localhost domains
      cors: true, // Allow CORS (optional)
    },
		optimizeDeps: {
			exclude: ['https'],
			esbuildOptions: {
				alias: {
					react: preactCompat,
					'react-dom': preactCompat,
					'react-dom/test-utils': preactTestUtils,
					'react/jsx-runtime': preactCompatJsx
				}
			}
		},
		plugins: [
			{
				name: 'force-preact-compat-env-aliases',
				configEnvironment(name, options) {
					options.resolve = options.resolve || {};
					
					const compatAliases = [
						{ find: /^react$/, replacement: preactCompat },
						{ find: /^react-dom$/, replacement: preactCompat },
						{ find: /^react-dom\/test-utils$/, replacement: preactTestUtils },
						{ find: /^react\/jsx-runtime$/, replacement: preactCompatJsx },
						{ find: 'react', replacement: preactCompat },
						{ find: 'react-dom', replacement: preactCompat },
						{ find: 'react-dom/test-utils', replacement: preactTestUtils },
						{ find: 'react/jsx-runtime', replacement: preactCompatJsx }
					];

					if (Array.isArray(options.resolve.alias)) {
						options.resolve.alias = [...compatAliases, ...options.resolve.alias];
					} else {
						options.resolve.alias = {
							...options.resolve.alias,
							react: preactCompat,
							'react-dom': preactCompat,
							'react-dom/test-utils': preactTestUtils,
							'react/jsx-runtime': preactCompatJsx
						};
					}

					options.optimizeDeps = options.optimizeDeps || {};
					options.optimizeDeps.esbuildOptions = options.optimizeDeps.esbuildOptions || {};
					options.optimizeDeps.esbuildOptions.alias = {
						...options.optimizeDeps.esbuildOptions.alias,
						react: preactCompat,
						'react-dom': preactCompat,
						'react-dom/test-utils': preactTestUtils,
						'react/jsx-runtime': preactCompatJsx,
					};
				}
			}
		],
		ssr: {
			// If an import is broken in the Vercel deployment, adding it here might fix it!
			noExternal: [ 'tinykeys', 'y-monaco', 'monaco-editor', 'y-webrtc', 'path-browserify' ]
		}
	},
	markdown: {
		shikiConfig: { theme: 'github-light' },
		rehypePlugins: [
			[ rehypeExternalLinks, { target: '_blank' } ]
		]
	}
})
