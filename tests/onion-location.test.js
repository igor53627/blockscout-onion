/**
 * Onion-Location Header Tests
 *
 * Tests validate that nginx configuration can properly set Onion-Location headers
 * for clearnet-to-onion redirection in Tor Browser.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Onion-Location Header Configuration', () => {
  const nginxConfigPath = join(process.cwd(), 'nginx.conf');
  let nginxConfig;

  it('should read nginx configuration file', () => {
    expect(() => {
      nginxConfig = readFileSync(nginxConfigPath, 'utf8');
    }).not.toThrow();
    expect(nginxConfig).toBeDefined();
    expect(nginxConfig.length).toBeGreaterThan(0);
  });

  it('should contain Onion-Location header configuration section', () => {
    nginxConfig = readFileSync(nginxConfigPath, 'utf8');

    // Should have comments explaining Onion-Location
    expect(nginxConfig).toContain('Onion-Location');
  });

  it('should have example configuration for adding Onion-Location header', () => {
    nginxConfig = readFileSync(nginxConfigPath, 'utf8');

    // Should show how to add the header with add_header directive
    expect(nginxConfig).toMatch(/add_header\s+Onion-Location/);
  });

  it('should include placeholder for actual onion address', () => {
    nginxConfig = readFileSync(nginxConfigPath, 'utf8');

    // Should have a placeholder showing onion address format
    expect(nginxConfig).toMatch(/\.onion/);
  });

  it('should properly format Onion-Location header with http:// scheme', () => {
    nginxConfig = readFileSync(nginxConfigPath, 'utf8');

    // Onion-Location should use http:// (not https://) for .onion addresses
    expect(nginxConfig).toMatch(/http:\/\/.*\.onion/);
  });

  it('should include comments about when to use Onion-Location', () => {
    nginxConfig = readFileSync(nginxConfigPath, 'utf8');

    // Should explain clearnet vs onion usage
    expect(nginxConfig.toLowerCase()).toMatch(/clearnet|tor browser/);
  });
});

describe('Onion-Location Documentation', () => {
  const docsPath = join(process.cwd(), 'docs', 'ONION-LOCATION.md');
  let docContent;

  it('should have dedicated Onion-Location documentation file', () => {
    expect(() => {
      docContent = readFileSync(docsPath, 'utf8');
    }).not.toThrow();
    expect(docContent).toBeDefined();
  });

  it('should explain what Onion-Location header does', () => {
    docContent = readFileSync(docsPath, 'utf8');

    expect(docContent).toContain('Onion-Location');
    expect(docContent.toLowerCase()).toMatch(/tor browser|hidden service/);
  });

  it('should include nginx configuration examples', () => {
    docContent = readFileSync(docsPath, 'utf8');

    expect(docContent).toContain('nginx');
    expect(docContent).toContain('add_header');
  });

  it('should document browser behavior and user experience', () => {
    docContent = readFileSync(docsPath, 'utf8');

    expect(docContent.toLowerCase()).toMatch(/user|browser|notification|prompt/);
  });

  it('should reference official Tor Project documentation', () => {
    docContent = readFileSync(docsPath, 'utf8');

    expect(docContent.toLowerCase()).toMatch(/torproject\.org|tor project/);
  });

  it('should include screenshot reference or assets section', () => {
    docContent = readFileSync(docsPath, 'utf8');

    // Should mention where to find or place screenshots
    expect(docContent.toLowerCase()).toMatch(/screenshot|image|example|public/);
  });

  it('should provide security considerations', () => {
    docContent = readFileSync(docsPath, 'utf8');

    expect(docContent.toLowerCase()).toMatch(/security|https|clearnet/);
  });
});

describe('Project Documentation Integration', () => {
  const readmePath = join(process.cwd(), 'README.md');

  it('should reference Onion-Location documentation in main README', () => {
    const readme = readFileSync(readmePath, 'utf8');

    // Should link to the Onion-Location documentation
    expect(readme).toMatch(/ONION-LOCATION\.md/);
  });
});

describe('Asset Organization', () => {
  const publicPath = join(process.cwd(), 'public');

  it('should have public directory for documentation assets', () => {
    const { statSync } = require('fs');
    const stat = statSync(publicPath);
    expect(stat.isDirectory()).toBe(true);
  });

  it('should document where to place Onion-Location screenshots', () => {
    const docsPath = join(process.cwd(), 'docs', 'ONION-LOCATION.md');
    const docContent = readFileSync(docsPath, 'utf8');

    // Should tell users where to place screenshots
    expect(docContent).toContain('public/');
  });
});
