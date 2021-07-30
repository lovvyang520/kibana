/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ExpressionValueVisDimension } from './expression_functions/vis_dimension';
import { Datatable } from '../../expressions/common/expression_types/specs';

export type Dimension = [ExpressionValueVisDimension[] | undefined, string];

const getDimensionName = (columnIndex: number, dimensions: Dimension[]) => {
  for (const dimension of dimensions) {
    if (dimension[0]?.find((d) => d.accessor === columnIndex)) {
      return dimension[1];
    }
  }
};

export const prepareLogTable = (datatable: Datatable, dimensions: Dimension[]) => {
  return {
    ...datatable,
    columns: datatable.columns.map((column, columnIndex) => {
      return {
        ...column,
        meta: {
          ...column.meta,
          dimensionName: getDimensionName(columnIndex, dimensions),
        },
      };
    }),
  };
};
