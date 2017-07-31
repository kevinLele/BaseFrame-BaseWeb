//import getJson from "../utils/getjson.js"
//// 导出是对象
//// 定义变更类型 
//// 类似执行对应的事件

import Vue from 'vue'

export default{
	increment (state){
		state.count++
	},
	decrement (state){
		state.count--
	},
	getOrgAddName(state,ztreeVal){
		state.orgAddName=ztreeVal;
	},
	getOrgAddParentId(state,ztreeValId){
		state.orgAddParentId=ztreeValId;
	},
	getOppositeOrgs(state,orgVal){
		state.oppositeOrgs=orgVal;
	},
	getOppositeRoles(state,roleVal){
		state.oppositeRoles=roleVal;
	}
}
