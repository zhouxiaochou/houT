// 默认暴露
export { default as trademark } from './product/trademark'
export { default as attr } from './product/attr'
export { default as spu } from './product/spu'
export { default as sku } from './product/sku'
export { default as category } from './product/category'
/* import { default as trademark } from './product/trademark'
export {
  trademark
} */

// 引入权限相关的接口文件 部分暴露
export * as user from './acl/user'

export {default as role} from './acl/role'
export {default as permission} from './acl/permission'

