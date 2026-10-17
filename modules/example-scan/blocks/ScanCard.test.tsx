import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderBlock, setMocks } from '@core/testing';

describe('example-scan/card', () => {
  it('shows the scanned value', async () => {
    setMocks({ qr: { text: 'HELLO-123', format: 'EAN_13' } });
    await renderBlock('example-scan', 'card');
    await userEvent.click(await screen.findByRole('button', { name: /scan/i }));
    expect(await screen.findByText('HELLO-123')).toBeInTheDocument();
    expect(screen.getByText('EAN_13')).toBeInTheDocument();
  });

  it('ignores a cancelled scan', async () => {
    setMocks({ qr: { fail: 'cancel' } });
    await renderBlock('example-scan', 'card');
    const button = await screen.findByRole('button', { name: /scan/i });
    await userEvent.click(button);
    await waitFor(() => expect(button).toBeEnabled());
    expect(screen.queryByText(/mock-qr/)).toBeNull();
  });
});
