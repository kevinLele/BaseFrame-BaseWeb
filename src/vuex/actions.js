//
//// 派发事件类型
//// action 是一种专门用来被 component 调用的函数。action 函数能够通过分发相应的 mutation 函数，
//// 来触发对 store 的更新。action 也可以先从 HTTP 后端或 store 中读取其他数据之后再分发更新事件。
//


export const increment=({commit})=>commit('increment')

export const decrement=({commit})=>commit('decrement')

export const getOrgAddName=({commit},ztreeVal)=>commit('getOrgAddName',{ztreeName:ztreeVal})

export const getOrgAddParentId=({commit},ztreeValId)=>commit('getOrgAddParentId',{ztreeId:ztreeValId})

export const getOppositeOrgs=({commit},orgVal)=>commit('getOppositeOrgs',{orgVals:orgVal})

export const getOppositeRoles=({commit},roleVal)=>commit('getOppositeRoles',{roleVals:roleVal})