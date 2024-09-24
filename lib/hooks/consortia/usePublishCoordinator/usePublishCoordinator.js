import partititon from 'lodash/partition';
import { useCallback } from 'react';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  CONSORTIA_API,
  PUBLISH_COORDINATOR_STATUSES,
} from '../../../constants';
import { getConsortium } from '../../../utils';

export const TIMEOUT = 2500;

const formatPublicationResult = ({ publicationResults, totalRecords }) => {
  const [results, errors] = partititon(publicationResults, ({ statusCode }) => statusCode >= 200 && statusCode < 300);

  const formattedResults = results.map(({ response, ...rest }) => ({
    response: JSON.parse(response),
    ...rest,
  }));

  return {
    publicationResults: formattedResults,
    publicationErrors: errors,
    totalRecords,
  };
};

export const usePublishCoordinator = () => {
  const ky = useOkapiKy();
  const stripes = useStripes();

  const consortium = getConsortium(stripes);
  const baseApi = `${CONSORTIA_API}/${consortium?.id}/publications`;

  const getPublicationResults = useCallback((id, { signal } = {}) => {
    return ky.get(`${baseApi}/${id}/results`, { signal })
      .json()
      .then(formatPublicationResult);
  }, [ky, baseApi]);

  const getPublicationDetails = useCallback(async (requestId, { signal } = {}) => {
    const { id, status } = await ky.get(`${baseApi}/${requestId}`, { signal }).json();

    if (status !== PUBLISH_COORDINATOR_STATUSES.IN_PROGRESS) return getPublicationResults(id, { signal });

    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));

    return !signal?.aborted
      ? getPublicationDetails(id, { signal })
      : Promise.reject(signal);
  }, [baseApi, getPublicationResults, ky]);

  const getPublicationResponse = useCallback(({ id, status }, { signal } = {}) => {
    if (status !== PUBLISH_COORDINATOR_STATUSES.IN_PROGRESS) return getPublicationResults(id, { signal });

    return getPublicationDetails(id, { signal });
  }, [getPublicationDetails, getPublicationResults]);

  return {
    getPublicationDetails,
    getPublicationResponse,
  };
};
