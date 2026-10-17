import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderBlock } from '@core/testing';

describe('__MODULE_ID__/card', () => {
  it('counts taps', async () => {
    await renderBlock('__MODULE_ID__', 'card');
    await userEvent.click(await screen.findByRole('button', { name: 'Tap' }));
    expect(await screen.findByText(/Tapped 1 times/)).toBeInTheDocument();
  });
});
