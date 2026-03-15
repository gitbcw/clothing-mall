import request from '@/utils/request'

export function statUser(query) {
  return request({
    url: '/stat/user',
    method: 'get',
    params: query
  })
}

export function statOrder(query) {
  return request({
    url: '/stat/order',
    method: 'get',
    params: query
  })
}

export function statGoods(query) {
  return request({
    url: '/stat/goods',
    method: 'get',
    params: query
  })
}

// 增长统计
export function statGrowth(query) {
  return request({
    url: '/stat/growth',
    method: 'get',
    params: query
  })
}

// 留存统计
export function statRetention(query) {
  return request({
    url: '/stat/retention',
    method: 'get',
    params: query
  })
}
