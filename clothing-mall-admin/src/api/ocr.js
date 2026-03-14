import request from '@/utils/request'

export function recognizeImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/admin/ocr/recognize',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function batchUpdateStock(data) {
  return request({
    url: '/admin/ocr/updateStock',
    method: 'post',
    data
  })
}
