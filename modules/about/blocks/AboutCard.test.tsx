import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { appConfig } from '@core';
import { renderBlock } from '@core/testing';

describe('about/card', () => {
  it('renders app version and description', async () => {
    await renderBlock('about', 'card');
    expect(await screen.findByText(`Version ${appConfig.version}`)).toBeInTheDocument();
    expect(await screen.findByText('Modular mobile web application running inside ProtoShell.')).toBeInTheDocument();
  });
});
