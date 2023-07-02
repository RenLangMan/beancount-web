import { Input, Spin } from 'antd';
import { Chart, Line, Point, Tooltip } from "bizcharts";
import moment from 'moment';
import React, { Component } from "react";
import { fetch, getCurrentMonth } from '../../config/Util';
import MonthSelector from '../MonthSelector';

class AccountBalanceChart extends Component {

  state = {
    loading: false,
    balanceData: [],
    accountPrefix: 'Assets'
  }

  componentDidMount() {
    this.queryAccountBalance(this.props.selectedMonth)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedMonth !== this.props.selectedMonth) {
      this.queryAccountBalance(nextProps.selectedMonth)
    }
  }

  queryAccountBalance = (selectedMonth) => {
    this.setState({ loading: true })
    let year, month;
    const { accountPrefix } = this.state;
    if (selectedMonth) {
      const yearAndMonth = selectedMonth.split('-').filter(a => a)
      if (yearAndMonth.length === 1) {
        year = yearAndMonth[0]
      } else if (yearAndMonth.length === 2) {
        year = yearAndMonth[0]
        month = yearAndMonth[1]
      }
    }
    let startDate, endDate
    if (year && month) {
      startDate = moment(year + "-" + month).startOf("month")
      endDate = moment(year + "-" + month).endOf("month")
    } else if (year) {
      startDate = moment(year).startOf("year")
      endDate = moment(year).endOf("year")
    }
    fetch(`/api/auth/stats/account/balance?prefix=${accountPrefix}&year=${year}&month=${month}`)
      .then(balanceData => {
        let data = balanceData
        if (startDate && endDate) {
          data = balanceData.filter(d => {
            const date = moment(d.date)
            return date.isAfter(startDate) && date.isBefore(endDate)
          })
        }
        this.setState({ balanceData: data })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleEnter = (e) => {
    if (e.key === 'Enter') {
      const accountPrefix = this.accountInput.input.value.trim()
      this.setState({ accountPrefix }, () => {
        console.log(this.props.selectedMonth)
        this.queryAccountBalance(this.props.selectedMonth)
      })
    }
  }

  render() {
    if (this.props.chartLoading) {
      return <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
    }
    return (
      <div>
        <Input
          ref={input => this.accountInput = input}
          defaultValue={this.state.accountPrefix}
          placeholder="输入账户"
          style={{ width: '240px' }}
          onKeyPress={this.handleEnter}
        />
        <Spin spinning={this.state.loading}>
          <Chart
            appendPadding={[10, 0, 0, 10]}
            autoFit
            height={500}
            data={this.state.balanceData}
            scale={{ amount: { alias: '合计', type: 'linear-strict' }, year: { range: [0, 1] } }}
          >

            <Line position="date*amount" />
            <Point position="date*amount" />
            <Tooltip showCrosshairs follow={false} />
          </Chart>
        </Spin>
      </div>
    )
  }
}

export default AccountBalanceChart
