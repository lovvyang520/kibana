/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState, useEffect, Fragment } from 'react';

import {
  EuiText,
  EuiLoadingKibana,
  EuiCallOut,
  EuiTextColor,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiStat,
} from '@elastic/eui';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { CoreStart } from 'kibana/public';
import { isEmpty } from 'lodash';
import { ALERTING_EXAMPLE_APP_ID, AlwaysFiringParams } from '../../common/constants';
import {
  Alert,
  AlertTaskState,
  LEGACY_BASE_ALERT_API_PATH,
} from '../../../../plugins/alerting/common';

type Props = RouteComponentProps & {
  http: CoreStart['http'];
  id: string;
};

function hasCraft(state: any): state is { craft: string } {
  return state && state.craft;
}
export const ViewPeopleInSpaceAlertPage = withRouter(({ http, id }: Props) => {
  const [alert, setAlert] = useState<Alert<AlwaysFiringParams> | null>(null);
  const [alertState, setAlertState] = useState<AlertTaskState | null>(null);

  useEffect(() => {
    if (!alert) {
      http
        .get<Alert<AlwaysFiringParams> | null>(`${LEGACY_BASE_ALERT_API_PATH}/alert/${id}`)
        .then(setAlert);
    }
    if (!alertState) {
      http
        .get<AlertTaskState | null>(`${LEGACY_BASE_ALERT_API_PATH}/alert/${id}/state`)
        .then(setAlertState);
    }
  }, [alert, alertState, http, id]);

  return alert && alertState ? (
    <Fragment>
      <EuiCallOut title={`Rule "${alert.name}"`} iconType="search">
        <p>
          This is a specific view for all
          <EuiTextColor color="accent"> example.people-in-space </EuiTextColor> Rules created by the
          <EuiTextColor color="accent"> {ALERTING_EXAMPLE_APP_ID} </EuiTextColor>
          plugin.
        </p>
      </EuiCallOut>
      <EuiSpacer size="l" />
      <EuiText>
        <h2>Alerts</h2>
      </EuiText>
      {isEmpty(alertState.alertInstances) ? (
        <EuiCallOut title="No Alerts!" color="warning" iconType="help">
          <p>
            The people in {alert.params.craft} at the moment <b>are not</b> {alert.params.op}{' '}
            {alert.params.outerSpaceCapacity}
          </p>
        </EuiCallOut>
      ) : (
        <Fragment>
          <EuiCallOut title="Active State" color="success" iconType="user">
            <p>
              The rule has been triggered because the people in {alert.params.craft} at the moment{' '}
              {alert.params.op} {alert.params.outerSpaceCapacity}
            </p>
          </EuiCallOut>
          <EuiSpacer size="l" />
          <div>
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiStat
                  title={Object.keys(alertState.alertInstances ?? {}).length}
                  description={`People in ${alert.params.craft}`}
                  titleColor="primary"
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiDescriptionList compressed>
                  {Object.entries(alertState.alertInstances ?? {}).map(
                    ([instance, { state }], index) => (
                      <Fragment key={index}>
                        <EuiDescriptionListTitle>{instance}</EuiDescriptionListTitle>
                        <EuiDescriptionListDescription>
                          {hasCraft(state) ? state.craft : 'Unknown Craft'}
                        </EuiDescriptionListDescription>
                      </Fragment>
                    )
                  )}
                </EuiDescriptionList>
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        </Fragment>
      )}
    </Fragment>
  ) : (
    <EuiLoadingKibana size="xl" />
  );
});
