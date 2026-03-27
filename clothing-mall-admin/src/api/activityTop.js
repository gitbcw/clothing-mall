import request from '@/utils/request'

export function listActivityTop() {
  return request({
    url: '/activity/top/list',
    method: 'get'
  })
}

export function addActivityTop(data) {
  return request({
    url: '/activity/top/add',
    method: 'post',
    data
  })
}

export function deleteActivityTop(data) {
  return request({
    url: '/activity/top/delete',
    method: 'post',
    data
  })
}

export function updateActivityTop(data) {
  return request({
    url: '/activity/top/update',
    method: 'post',
    data
  })
}
