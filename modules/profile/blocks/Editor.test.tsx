import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderBlock } from '@core/testing';
import { on } from '@core';

describe('profile/editor', () => {
  it('saves and emits profile:changed', async () => {
    const handler = vi.fn();
    const unsub = on('profile:changed', handler);

    await renderBlock('profile', 'editor');

    const input = await screen.findByLabelText(/hledaná pracovní pozice/i);
    fireEvent.change(input, { target: { value: 'Backend Developer' } });

    const saveBtn = screen.getByRole('button', { name: /uložit profil/i });
    await userEvent.click(saveBtn);

    expect(handler).toHaveBeenCalled();
    const emitted = handler.mock.calls.at(-1)?.[0];
    expect(emitted?.desiredRole).toBe('Backend Developer');

    unsub();
  });
});
