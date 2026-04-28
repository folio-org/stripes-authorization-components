import { QueryClient, QueryClientProvider } from 'react-query';

import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import { useEditRoleMutation } from './useEditRoleMutation';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useEditRoleMutation', () => {
  it('should make put request with provided role and capabilities list ids', async () => {
    const putMock = jest.fn().mockReturnValue({ json: () => Promise.resolve({}) });

    useOkapiKy.mockClear().mockReturnValue({
      put: putMock,
    });

    const metadata = { version: 1, createdDate: '2024-01-01', createdByUserId: 'user1', updatedDate: '2024-01-01', updatedByUserId: 'user1' };

    const { result } = renderHook(
      () => useEditRoleMutation({ id:'1', type: 'REGULAR', metadata, description: 'description', name: 'name' }, ['1', '2', '3'], { handleError: jest.fn() }),
      { wrapper },
    );

    await act(async () => { result.current.mutateRole(); });

    expect(putMock).toHaveBeenCalledWith('roles/1', {
      json: expect.objectContaining({
        metadata: expect.objectContaining({
          version: metadata.version,
        }),
      }),
    });
  });
});
