
//第一步：state
//第二部：getter
//第三部：写mutation事件
//第四部：action派发

import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getter'
import * as actions from './actions'
import mutations from './mutation'

Vue.use(Vuex)
export const state = {
	count:0,
	orgAddName:"",
	oppositeOrgs:{},
//	zNodes:[],
	orgAddParentId:"",
	oppositeRoles:{},
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})


