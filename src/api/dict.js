import {getRequest} from '@/utils/request'

// 根据字典类型获取字段数据
export function getDicts (dictType) {
  return getRequest('/sys/dict/type/'+dictType)
}

