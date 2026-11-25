import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';

// Stamp the commit and build time into the page, so each deploy is visible.
function commit() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

export default defineConfig({
  define: {
    __COMMIT__: JSON.stringify(commit()),
    __BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
});
