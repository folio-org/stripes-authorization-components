import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import {
  pcPostRequest,
  pcPublicationDetails,
  pcPublicationResults,
} from 'fixtures';
import { PUBLISH_COORDINATOR_STATUSES } from '../../../constants';
import {
  TIMEOUT,
  usePublishCoordinator,
} from './usePublishCoordinator';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const kyMock = {
  get: jest.fn(),
  post: jest.fn(),
};

const publicationResults = pcPublicationResults.publicationResults.map(({ response, ...rest }) => ({
  response: JSON.parse(response),
  ...rest,
}));
const response = {
  publicationResults,
  publicationErrors: [],
  totalRecords: pcPublicationResults.totalRecords,
};

const getDetailsMock = jest.fn((status) => Promise.resolve({ ...pcPublicationDetails, status }));
const getResultsMock = jest.fn(() => Promise.resolve(pcPublicationResults));

const getMockedImplementation = (status = PUBLISH_COORDINATOR_STATUSES.COMPLETE) => (url) => ({
  json: () => Promise.resolve(url.endsWith('/results') ? getResultsMock() : getDetailsMock(status)),
});

describe('usePublishCoordinator', () => {
  beforeEach(() => {
    kyMock.get.mockImplementation(getMockedImplementation());
    useOkapiKy.mockReturnValue(kyMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call initPublicationRequest and return publication results', async () => {
    const { result } = renderHook(() => usePublishCoordinator(), { wrapper });

    kyMock.post.mockImplementation(() => ({
      json: () => Promise.resolve({ id: pcPublicationDetails.id, status: pcPublicationDetails.status }),
    }));

    const { initPublicationRequest } = result.current;

    const res = await initPublicationRequest(pcPostRequest);
    expect(kyMock.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ json: expect.objectContaining({ url: pcPostRequest.url }) }));
    expect(res).toEqual(response);
  });

  it('should poll publish coordinator until the publication status is \'In progress\'', async () => {
    kyMock.get
      .mockImplementationOnce(getMockedImplementation(PUBLISH_COORDINATOR_STATUSES.IN_PROGRESS))
      .mockImplementationOnce(getMockedImplementation(PUBLISH_COORDINATOR_STATUSES.IN_PROGRESS))
      .mockImplementation(getMockedImplementation(PUBLISH_COORDINATOR_STATUSES.COMPLETE));

    const { result } = renderHook(() => usePublishCoordinator(), { wrapper });

    const { getPublicationResponse } = result.current;

    expect(
      await getPublicationResponse({
        id: pcPublicationDetails.id,
        status: PUBLISH_COORDINATOR_STATUSES.IN_PROGRESS,
      })
    ).toEqual(response);
    expect(getDetailsMock).toHaveBeenCalledTimes(3);
    expect(getResultsMock).toHaveBeenCalledTimes(1);
  }, TIMEOUT * 3);

  describe('Errors', () => {
    it('should format publish coordinator result with \'Error\' status', async () => {
      const errorMessage = 'Test error message';
      const errorResult = {
        tenantId: pcPostRequest.tenants[0],
        response: errorMessage,
        statusCode: 400,
      };

      getResultsMock
        .mockClear()
        .mockImplementation(() => ({
          publicationResults: [errorResult],
        }));

      const { result } = renderHook(() => usePublishCoordinator(), { wrapper });

      const { getPublicationResponse } = result.current;

      return expect(await getPublicationResponse(pcPublicationDetails.id)).toEqual(expect.objectContaining({
        publicationErrors: [errorResult],
      }));
    });
  });
});
