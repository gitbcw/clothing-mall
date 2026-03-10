import request from '@/utils/request'

export function listFlashSale(query) {
  return request({
    url: '/flashSale/list',
    method: 'get',
    params: query
  })
}

export function createFlashSale(data) {
  return request({
    url: '/flashSale/create',
    method: 'post',
    data
  })
}

export function readFlashSale(id) {
  return request({
    url: '/flashSale/read',
    method: 'get',
    params: { id }
  })
}

export function updateFlashSale(data) {
  return request({
    url: '/flashSale/update',
    method: 'post',
    data
  })
}

export function deleteFlashSale(data) {
  return request({
    url: '/flashSale/delete',
    method: 'post',
    data
  })
}
