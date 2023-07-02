import { Input, Select, Spin } from 'antd';
import { Chart, Interval, Tooltip } from "bizcharts";
import React, { Component } from "react";
import { fetch } from '../../config/Util';

class AccountDayTrendChart extends Component {

  state = {
    loading: false,
    dayAmountData: [],
    type: 'day',
    accountPrefix: 'Expenses'
  }

  componentDidMount() {
    this.queryAccountDayTrend(this.props.selectedMonth)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedMonth !== this.props.selectedMonth) {
      this.queryAccountDayTrend(nextProps.selectedMonth)
    }
  }

  queryAccountDayTrend = (selectedMonth) => {
    this.setState({ loading: true })
    let year, month;
    const { accountPrefix, type } = this.state;
    if (selectedMonth) {
      const yearAndMonth = selectedMonth.split('-').filter(a => a)
      if (yearAndMonth.length === 1) {
        year = yearAndMonth[0]
      } else if (yearAndMonth.length === 2) {
        year = yearAndMonth[0]
        month = yearAndMonth[1]
      }
    }
    fetch(`/api/auth/stats/account/trend?prefix=${accountPrefix}&year=${year || ''}&month=${month || ''}&type=${type}`)
      .then(dayAmountData => {
        this.setState({ dayAmountData })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleEnter = (e) => {
    if (e.key === 'Enter') {
      const accountPrefix = this.accountInput.input.value.trim()
      this.setState({ accountPrefix }, () => {
        this.queryAccountDayTrend(this.props.selectedMonth)
      })
    }
  }

  handleChangeStatsType = (type) => {
    this.setState({ type }, () => {
      this.queryAccountDayTrend(this.props.selectedMonth)
    })
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
          addonAfter={
            <Select value={this.state.type} onChange={this.handleChangeStatsType}>
              <Select.Option value="day">按天</Select.Option>
              <Select.Option value="month">按月</Select.Option>
              <Select.Option value="year">按年</Select.Option>
              <Select.Option value="sum">累计</Select.Option>
            </Select>
          }
        />
        <Spin spinning={this.state.loading}>
          <Chart height={480} autoFit data={this.state.dayAmountData} interactions={['active-region']} padding={[30, 30, 30, 50]} >
            <Interval position="date*amount" />
            <Tooltip>
              {(title, items) => {
                return <div style={{ padding: '.8rem 1rem' }}>{title}: {items[0].data.amount}元</div>
              }}
            </Tooltip>
          </Chart>
        </Spin>
      </div>
    )
  }
}

export default AccountDayTrendChart
