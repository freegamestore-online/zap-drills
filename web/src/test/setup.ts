import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Keep tests off the network. The leaderboard hook fetches on mount; tests that care
// about a request stub fetch themselves.
vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) })));
