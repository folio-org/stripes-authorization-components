import { CONSORTIA_API } from '../../../constants';
import { getConsortiumTenants } from './getConsortiumTenants';

describe('getConsortiumTenants', () => {
  it('should call the correct API endpoint and return tenants', async () => {
    const consortiumId = 'test-consortium-id';
    const tenantsMock = [{ id: 'tenant-1', name: 'Tenant 1' }];
    const httpClient = {
      get: jest.fn(() => ({
        json: jest.fn().mockResolvedValue({ tenants: tenantsMock }),
      })),
    };

    const result = await getConsortiumTenants(httpClient, consortiumId);

    expect(httpClient.get).toHaveBeenCalledWith(`${CONSORTIA_API}/${consortiumId}/tenants`);
    expect(result).toEqual({ tenants: tenantsMock });
  });
});
