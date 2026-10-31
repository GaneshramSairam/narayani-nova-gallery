import fs from 'fs';
import * as esbuild from 'esbuild';

const code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

try {
    const result = esbuild.transformSync(code, {
        loader: 'jsx',
        jsx: 'automatic'
    });
    console.log('esbuild JSX transform: SUCCESS');
} catch (e) {
    console.error('esbuild JSX transform FAILED:', e);
}
