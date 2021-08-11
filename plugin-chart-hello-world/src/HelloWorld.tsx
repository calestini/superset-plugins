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
import React, { PureComponent, createRef, useState } from 'react';
import Plot from 'react-plotly.js'; // added by LC
import { styled } from '@superset-ui/core';
import { HelloWorldProps, HelloWorldStylesProps } from './types';
import { Modal, Button, Table } from 'antd';


/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default class HelloWorld extends PureComponent<HelloWorldProps> {
  // Often, you just want to get a hold of the DOM and go nuts.
  // Here, you can do that with createRef, and componentDidMount.

  rootElem = createRef<HTMLDivElement>();

  state = {
    visible: false ,
    filteredData: this.props.sourceData;
  };

  showModal = () => {

      this.setState({
          filteredData: this.formatUnderlyingData(this.props.sourceData),
          visible: true,
      });
  };

  handleOk = e => {
      this.setState({
          visible: false,
      });
  };

  handleCancel = e => {
      this.setState({
          visible: false,
      });
  };

  filterUnderlyingData = (min, max) => {
    let filtered = this.props.sourceData.filter(x=>{
      if (
        x['__timestamp']>=min &&
        x['__timestamp']<=max
      ){
        return {
          ...x,
          __timestamp :  new Date(x.__timestamp).toString().slice(0,10);
        }
      };
    });

    filtered = this.formatUnderlyingData(filtered);

    return filtered;
  }

  clickEvent = (selection: object) => {

    var x1 = new Date(selection.points[0].x);
    var x2 = x1;
    // var y1 = selection.points[0].y;
    // var y2 = y1;

    // console.log(x1,x2);

    this.setState({
      filteredData: this.filterUnderlyingData(x1,x2),
      visible: true,
    });

  }

  selectEvent = (d: object) => {

    var x1_tmp = new Date(d.range.x[0]);
    var x2_tmp = new Date(d.range.x[1]);

    var x1 = Math.min(x1_tmp, x2_tmp);
    var x2 = Math.max(x1_tmp, x2_tmp);

    // var y1 = d.range.y[0];
    // var y2 = d.range.y[1];
    // console.log(x1,x2);

    this.setState({
      filteredData: this.filterUnderlyingData(x1,x2),
      visible: true,
    });
  }

  castNumeric = (d: String) => {
    return isFinite(String(d).trim() || NaN);
  }

  formatData = (el: Object) => {
    let res = {};
    for (const [key, value] of Object.entries(el)) {
      if (this.castNumeric(value) === true){
        res[key] = (Math.round(parseFloat(value)*100) / 100).toLocaleString('en');
      }else{
        res[key] = value;
      }
    }

    return res;
  }

  formatUnderlyingData = (arr: array) =>{
    const formattedData = arr.map(x=>{
      let timestamp = x['__timestamp'].toString().slice(0,24);
      x = this.formatData(x);
      x[this.props.granularitySqla] = timestamp;
      return x;
    })

    return formattedData;
  }

  getErrorBarObj = (colName: str) => {
    return {
      type: 'data',
      array: this.props.data.map(x=>Math.round(x[`${this.props.errorMetric}(${colName})`],2)),
      visible: true,
      color: this.props.errorBarColor,
      thickness: this.props.errorBarWidth,
      dash: 'dotted'
    }
  }

  unique = (array, propertyName) => {
     return array.filter((e, i) => array.findIndex(a => a[propertyName] === e[propertyName]) === i);
  }

  createTraces = () => {

    let colNames = this.props.colNames;
    let colLabels = this.props.colLabels;
    let traces = [];
    let error_y = {};
    let xValues = [];

    for (var i = 0; i < colNames.length; i++) {

      if (this.props.categoricalTimestamp){
        xValues = this.props.data.map(x=>x.__timestamp.toString().slice(0,10))
      } else {
        xValues = this.props.data.map(x=>x.__timestamp)
      }

      if (this.props.showErrorBar){
        error_y = this.getErrorBarObj(colNames[i]);
      }else{
        error_y = {}
      }

      if (colNames.length > 1){

        delete error_y['color'];

        traces.push({
          x: xValues,
          y: this.props.data.map(x=>Math.round(x[colLabels[i]],2)),
          error_y: error_y,
          type: 'scatter',
          name: colNames[i],
          mode: this.props.chartMode,
          marker: {
            size: this.props.markerSize,
            opacity: 0.7
          },
        })
      } else {
        traces.push({
          x: xValues,
          y: this.props.data.map(x=>Math.round(x[colLabels[i]],2)),
          error_y: error_y,
          type: 'scatter',
          name: this.props.legendText,
          mode: this.props.chartMode,
          marker: {
            color: this.props.markerColor,
            size: this.props.markerSize,
            opacity: 0.7
          },
        })
      }

    }

    return traces;
  }

  componentDidMount() {
    const root = this.rootElem.current as HTMLElement;

    this.setState({
      filteredData: this.formatUnderlyingData(this.props.sourceData);
    })

  }

  render() {
    // height and width are the height and width of the DOM element as it exists in the dashboard.
    // There is also a `data` prop, which is, of course, your DATA 🎉

    // console.log('Approach 1 props', this.props);
    const { data, height, width } = this.props;

    // Create obj for Underlying Data Table
    const columns = Object.keys(this.props.sourceData[0]).map((x,i)=>{
      return {
        title: x,
        dataIndex: x,
        key: i,
      }
    }).filter(x=>{
      if (x.title !== '__timestamp'){
        return x
      }
    })

    const tracesData = this.createTraces();

    return (
      <>
        <Button type="dashed" onClick={this.showModal}>
          View Data Source
        </Button>
        <Modal
          title="Data Source"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={width}
        >
          <Table
            dataSource={this.state.filteredData}
            columns={columns}
            scroll={{ x: `calc(${width}px + 100%)`, y: height }}
            size="small"
          />
        </Modal>

        <Plot
          data={tracesData}
          layout={{
            width: this.props.width,
            height: this.props.height,
            dragmode: 'select',
            clickmode: 'select',
            showlegend: this.props.showLegend,
            margin: {
              l: 80,
              r: 20,
              t: 20,
              b: 20
            }
          }}
          onClick={this.clickEvent}
          onSelected={this.selectEvent}
        />
        </>
    );
  }
}
