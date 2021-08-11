/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { t, validateNonEmpty } from '@superset-ui/core';
import { ControlPanelConfig, sections, sharedControls } from '@superset-ui/chart-controls';
// console.log('shared Controls',sharedControls);
const config: ControlPanelConfig = {
  /**
   * The control panel is split into two tabs: "Query" and
   * "Chart Options". The controls that define the inputs to
   * the chart data request, such as columns and metrics, usually
   * reside within "Query", while controls that affect the visual
   * appearance or functionality of the chart are under the
   * "Chart Options" section.
   *
   * There are several predefined controls that can be used.
   * Some examples:
   * - groupby: columns to group by (tranlated to GROUP BY statement)
   * - series: same as groupby, but single selection.
   * - metrics: multiple metrics (translated to aggregate expression)
   * - metric: sane as metrics, but single selection
   * - adhoc_filters: filters (translated to WHERE or HAVING
   *   depending on filter type)
   * - row_limit: maximum number of rows (translated to LIMIT statement)
   *
   * If a control panel has both a `series` and `groupby` control, and
   * the user has chosen `col1` as the value for the `series` control,
   * and `col2` and `col3` as values for the `groupby` control,
   * the resulting query will contain three `groupby` columns. This is because
   * we considered `series` control a `groupby` query field and its value
   * will automatically append the `groupby` field when the query is generated.
   *
   * It is also possible to define custom controls by importing the
   * necessary dependencies and overriding the default parameters, which
   * can then be placed in the `controlSetRows` section
   * of the `Query` section instead of a predefined control.
   *
   * import { validateNonEmpty } from '@superset-ui/core';
   * import {
   *   sharedControls,
   *   ControlConfig,
   *   ControlPanelConfig,
   * } from '@superset-ui/chart-controls';
   *
   * const myControl: ControlConfig<'SelectControl'> = {
   *   name: 'secondary_entity',
   *   config: {
   *     ...sharedControls.entity,
   *     type: 'SelectControl',
   *     label: t('Secondary Entity'),
   *     mapStateToProps: state => ({
   *       sharedControls.columnChoices(state.datasource)
   *       .columns.filter(c => c.groupby)
   *     })
   *     validators: [validateNonEmpty],
   *   },
   * }
   *
   * In addition to the basic drop down control, there are several predefined
   * control types (can be set via the `type` property) that can be used. Some
   * commonly used examples:
   * - SelectControl: Dropdown to select single or multiple values,
       usually columns
   * - MetricsControl: Dropdown to select metrics, triggering a modal
       to define Metric details
   * - AdhocFilterControl: Control to choose filters
   * - CheckboxControl: A checkbox for choosing true/false values
   * - SliderControl: A slider with min/max values
   * - TextControl: Control for text data
   *
   * For more control input types, check out the `incubator-superset` repo
   * and open this file: superset-frontend/src/explore/components/controls/index.js
   *
   * To ensure all controls have been filled out correctly, the following
   * validators are provided
   * by the `@superset-ui/core/lib/validator`:
   * - validateNonEmpty: must have at least one value
   * - validateInteger: must be an integer value
   * - validateNumber: must be an intger or decimal value
   */

  // For control input types, see: superset-frontend/src/explore/components/controls/index.js
  controlPanelSections: [
    sections.legacyTimeseriesTime,
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'cols',
            config: {
              ...sharedControls.groupby,
              label: t('Columns for Underlying Data'),
              description: t('Columns to show in data source'),
            },
          },
        ],
        [
          {
            name: 'groupby',
            config: {
              ...sharedControls.series,
              label: t('Group By'),
              description: t('Columns to group by'),
            },
          },
        ],
        [
          {
            name: 'metrics',
            config: {
              ...sharedControls.metrics,
              // it's possible to add validators to controls if
              // certain selections/types need to be enforced
              validators: [validateNonEmpty],
            },
          },
        ],
        // [
        //   {
        //     name: 'metric',
        //     config: {
        //       ...sharedControls.metric,
        //       validators: [validateNonEmpty],
        //     },
        //   },
        // ],
        ['adhoc_filters'],
        [
          {
            name: 'error_metric',
            config: {
              type: 'SelectControl',
              label: t('Error Metric'),
              default: 'std',
              choices: [
                // [value, label]
                ['std', '1 Standard Deviation'],
                ['2*std', '2 Standard Deviations'],
              ],
              renderTrigger: false,
              description: t('Select the error metric to use'),
            },
          },
        ],
        [
          {
            name: 'row_limit',
            config: sharedControls.row_limit,
          },
        ],
      ],
    },
    {
      label: t('Chart Controls'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'marker_color',
            config: {
              type: 'ColorPickerControl',
              default: 'blue',
              renderTrigger: true,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t('Marker Color'),
              description: t('Color for marker'),
            },
          },
          {
            name: 'marker_size',
            config: {
              type: 'SliderControl',
              default: 20,
              renderTrigger: true,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t('Marker Size'),
              description: t('Size'),
              min: 1,
              max: 50
            },
          },
        ],
        [
          {
            name: 'chart_mode',
            config: {
              type: 'SelectControl',
              label: t('Chart Mode'),
              default: 'lines+markers',
              choices: [
                // [value, label]
                ['lines', 'Lines'],
                ['markers', 'Markers'],
                ['lines+markers', 'Lines and Markers'],
              ],
              renderTrigger: true,
              description: t('Whether to display only markers or also a line'),
            },
          },
        ],
        [
          {
            name: 'show_error_bar',
            config: {
              type: 'CheckboxControl',
              label: t('Show Error Bar'),
              renderTrigger: true,
              default: true,
              description: t('Whether to show the error bar'),
            },
          },
        ],
        [
          {
            name: 'show_legend',
            config: {
              type: 'CheckboxControl',
              label: t('Show Legend'),
              renderTrigger: true,
              default: true,
              description: t('Whether to show the legend'),
            },
          },
        ],
        [
          {
            name: 'legend_text',
            config: {
              type: 'TextControl',
              default: 'ObservedMass',
              renderTrigger: true,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t('Legend Text'),
              description: t('The text you want to see in the legend'),
            },
          },
        ],
        [
          {
            name: 'error_bar_color',
            config: {
              type: 'ColorPickerControl',
              default: 'blue',
              renderTrigger: true,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t('Error Bar Color'),
              description: t('Color for error bar'),
            },
          },
          {
            name: 'error_bar_width',
            config: {
              type: 'SliderControl',
              default: 1,
              renderTrigger: true,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t('Error Bar Width'),
              description: t('Error Bar Width'),
              min: 1,
              max: 5
            },
          },
        ],
        [
          {
            name: 'categorical_timestamp',
            config: {
              type: 'CheckboxControl',
              label: t('X-Axis as Categorical'),
              renderTrigger: true,
              default: false,
              description: t('Whether to show the x-axis timestamp as categorical'),
            },
          },
        ],
      ],
    },
  ],
};

export default config;
