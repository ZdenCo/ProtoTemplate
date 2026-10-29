import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderBlock } from '@core/testing';
import { appConfig, createKeyValueStore } from '@core';

describe('job-search/results', () => {
  it('renders ranked job cards for a profile', async () => {
    await renderBlock('job-search', 'results');

    const matches = await screen.findAllByText(/React Developer|Vývojář/i);
    expect(matches.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/% shoda/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Zdroje nabídek')).toBeInTheDocument();
  });

  it('shows the per-source error when failSource is set', async () => {
    const store = createKeyValueStore(`${appConfig.id}.job-search.`);
    await store.setJSON('__settings', { failSource: 'startupjobs.cz' });

    await renderBlock('job-search', 'results');

    await waitFor(() => {
      expect(screen.getByText(/startupjobs\.cz.*nedostupný/i)).toBeInTheDocument();
    });

    await store.setJSON('__settings', { failSource: 'none' });
  });
});
