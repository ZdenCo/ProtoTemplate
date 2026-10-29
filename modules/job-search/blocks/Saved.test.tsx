import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderBlock } from '@core/testing';

describe('job-search/saved', () => {
  it('shows empty state when no jobs are saved', async () => {
    await renderBlock('job-search', 'saved');
    expect(await screen.findByText('Žádné uložené nabídky')).toBeInTheDocument();
  });

  it('saves a job from results and displays it in saved block', async () => {
    await renderBlock('job-search', 'results');

    const saveButtons = await screen.findAllByRole('button', { name: /uložit nabídku/i });
    expect(saveButtons.length).toBeGreaterThan(0);
    await userEvent.click(saveButtons[0]!);

    cleanup();

    await renderBlock('job-search', 'saved');
    expect(await screen.findByText(/Frontend Vývojář|Senior React/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^odebrat$/i })).toBeInTheDocument();
  });
});
