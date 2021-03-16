/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiButton, EuiEmptyPrompt, EuiLoadingSpinner } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';

import { MIN_SEARCHABLE_SNAPSHOT_LICENSE } from '../../../../common/constants';
import { useKibana, attemptToURIDecode } from '../../../shared_imports';

import { useLoadPoliciesList } from '../../services/api';
import { getPolicyByName } from '../../lib/policies';
import { defaultPolicy } from '../../constants';

import { EditPolicy as PresentationComponent } from './edit_policy';
import { EditPolicyContextProvider } from './edit_policy_context';
import { NavigationContextProvider } from './navigation';

interface RouterProps {
  policyName: string;
}

interface Props {
  getUrlForApp: (
    appId: string,
    options?: {
      path?: string;
      absolute?: boolean;
    }
  ) => string;
}

export const EditPolicy: React.FunctionComponent<Props & RouteComponentProps<RouterProps>> = ({
  match: {
    params: { policyName },
  },
  getUrlForApp,
  history,
}) => {
  const {
    services: { license },
  } = useKibana();
  const { error, isLoading, data: policies, resendRequest } = useLoadPoliciesList(false);

  if (isLoading) {
    return (
      <EuiEmptyPrompt
        title={<EuiLoadingSpinner size="xl" />}
        body={
          <FormattedMessage
            id="xpack.indexLifecycleMgmt.editPolicy.policiesLoading"
            defaultMessage="Loading policies..."
          />
        }
      />
    );
  }
  if (error || !policies) {
    const { statusCode, message } = error ? error : { statusCode: '', message: '' };
    return (
      <EuiEmptyPrompt
        title={
          <h2>
            <FormattedMessage
              id="xpack.indexLifecycleMgmt.editPolicy.lifecyclePoliciesLoadingFailedTitle"
              defaultMessage="Unable to load existing lifecycle policies"
            />
          </h2>
        }
        body={
          <p>
            {message} ({statusCode})
          </p>
        }
        actions={
          <EuiButton onClick={resendRequest} iconType="refresh" color="danger">
            <FormattedMessage
              id="xpack.indexLifecycleMgmt.editPolicy.lifecyclePoliciesReloadButton"
              defaultMessage="Try again"
            />
          </EuiButton>
        }
      />
    );
  }

  const maybePolicy = getPolicyByName(policies, attemptToURIDecode(policyName))?.policy;
  const isNewPolicy = maybePolicy === undefined;
  const policy = maybePolicy ?? defaultPolicy;

  return (
    <EditPolicyContextProvider
      value={{
        isNewPolicy,
        policyName: attemptToURIDecode(policyName),
        policy,
        existingPolicies: policies,
        getUrlForApp,
        license: {
          canUseSearchableSnapshot: () => license.hasAtLeast(MIN_SEARCHABLE_SNAPSHOT_LICENSE),
        },
      }}
    >
      <NavigationContextProvider>
        <PresentationComponent history={history} />
      </NavigationContextProvider>
    </EditPolicyContextProvider>
  );
};
