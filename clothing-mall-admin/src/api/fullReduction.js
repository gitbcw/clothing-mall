import request from '@/utils/request'

export function listFullReduction(query) {
  return request({
    url: '/fullReduction/list',
    method: 'get',
    params: query
  })
}

export function createFullReduction(data) {
  return request({
    url: '/fullReduction/create',
    method: 'post',
    data
  })
}

export function readFullReduction(id) {
  return request({
    url: '/fullReduction/read',
    method: 'get',
    params: { id }
  })
}

export function updateFullReduction(data) {
  return request({
    url: '/fullReduction/update',
    method: 'post',
    data
  })
}

export function deleteFullReduction(data) {
  return request({
    url: '/fullReduction/delete',
    method: 'post',
    data
  })
}
