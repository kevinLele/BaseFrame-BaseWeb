<template>
  <div class="role">
    <div class="role-head manager-head">
      <div class="fl role-list-search" v-if="$permissionValid('role:search')">
        <span>角色名称:</span>
        <input v-model="gridConfigs.searchFields.name" placeholder="请输入角色名称"/>
        <span>状态:</span>
        <select>
          <option>有效</option>
          <option>无效</option>
        </select>
        <button type="button" @click="search">查询</button>
        <button type="button" @click="reset">重置</button>
      </div>
      <div class="fr role-list-modify">
        <button type="button" @click="rolePrivilege">角色权限</button>
        <button type="button" @click="showRoleUserListWin">角色成员</button>
        <button type="button" @click="addRole" v-if="$permissionValid('role:add')">新增</button>
        <button type="button" @click="batchRemoveRole" v-if="$permissionValid('role:remove')">批量删除</button>
      </div>
    </div>

    <div class="content-main">
      <!--角色数据表格-->
      <grid :config="gridConfigs" ref="grid"></grid>
    </div>

    <!--是否确认消息提示框，需点击-->
    <my-dialog v-if="showDialog" :message="dialogMessage"
               @dialogCancel="dialogCancel" @dialogConfirm="dialogConfirm"></my-dialog>
    <!--是否成功操作提示框，无需点击-->
    <my-tooltip :show="showTooltip" :showType="tooltipType" :message="tooltipMessage"
                @tooltipClosed="tooltipClosed"></my-tooltip>
    <!--点击新增之后的弹框表单，content-body-form为公用样式-->
    <my-window v-if="roleWindowConfig.show" :config="roleWindowConfig">
      <div class="content-body-form">
        <div>
          <label>所属机构：</label>
          <div>
            <tree-select :selectStyle="treeSelectConfig.selectStyle" :readonly="roleWindowConfig.readonly"
                         v-model="roleWindowConfig.form.orgId" :api="treeSelectConfig.api"></tree-select>
          </div>
        </div>
        <div v-if="roleWindowConfig.type=='add'">
          <label>角色名称：</label>
          <input :readonly="roleWindowConfig.readonly" class="form-field" v-model="roleWindowConfig.form.name"
          	     @keyup="isExist('name',roleWindowConfig.form.name)"
                 type="text"/><span v-if="roleWindowConfig.roleNameFlag" class="red">&nbsp;已存在</span>
        </div>
        <div v-if="roleWindowConfig.type!='add'">
          <label>角色名称：</label>
          <input :readonly="roleWindowConfig.readonly" class="form-field" v-model="roleWindowConfig.form.name"
          	     @keyup="nameExistModify()"
                 type="text"/><span v-if="roleWindowConfig.roleNameFlag" class="red">&nbsp;已存在</span>
        </div>
        <div v-if="roleWindowConfig.type=='add'">
          <label>角色编码：</label>
          <input :readonly="roleWindowConfig.readonly" class="form-field" v-model="roleWindowConfig.form.code"          	   
          	     @keyup="isExist('code',roleWindowConfig.form.code)"
          	     type="text"/><span v-if="roleWindowConfig.roleCodeFlag" class="red">&nbsp;已存在</span>
        </div>
       <div v-if="roleWindowConfig.type!='add'">
          <label>角色编码：</label>
          <input :readonly="roleWindowConfig.readonly" class="form-field" v-model="roleWindowConfig.form.code"
          	     @keyup="codeExistModify()"
          	     type="text"/><span v-if="roleWindowConfig.roleCodeFlag" class="red">&nbsp;已存在</span>
        </div>
        <div>
          <label>应用编码：</label>
          <input :readonly="roleWindowConfig.readonly" class="form-field"         				
                 v-model="roleWindowConfig.form.appcode" type="text"/>
        </div>
        <div>
          <label>角色描述：</label>
          <textarea :readonly="roleWindowConfig.readonly" class="form-field"
                    v-model="roleWindowConfig.form.description" style="width: 450px;height: 150px;resize: none;"></textarea>
        </div>
      </div>
    </my-window>
    <!--角色授权-->
    <my-window v-if="roleWindowPrivilege.show" :config="roleWindowPrivilege">
      <handle-privilege :roleId="roleWindowPrivilege.form.roleId" ref="handlePrivilege"></handle-privilege>
    </my-window>

    <!--角色成员列表-->
    <my-window v-if="roleUserListWindowConfig.show" :config="roleUserListWindowConfig">
      <div style="height:50px;width:100%;background-color:#eff1f5;padding: 12px 10px;border:1px solid #aaaaaa;border-bottom: 0px;">
        <!--批量删除位置-->
        <button class="normal-button" style="float:right;" type="button" @click="removeRoleUserBatch">批量删除</button>
        <button class="normal-button" style="float:right;" type="button" @click="addUser">添加</button>
      </div>
      <div style="height:calc(100% - 50px);border:1px solid #aaaaaa;overflow: auto;">
        <grid :config="roleUserListWindowConfig.gridConfigs" ref="selectedUserGrid"></grid>
      </div>
    </my-window>
    <!--角色成员-->
    <my-window ref="roleUserWindow" v-if="roleUserWindowConfig.show" :config="roleUserWindowConfig">
      <ul style="width:100%;height:100%;">
        <li style="float:left;width:30%;height:100%;border: 1px solid #aaaaaa;">
          <tree :defaultSelectedId="defaultValue" :api="roleUserWindowConfig.treeApi"
                :field="field" :expandLevel="1" @selected="selected"></tree>
        </li>
        <li style="width:70%;float:right;height:100%;padding-left:10px;">
          <div style="height:100%;border:1px solid #aaaaaa;overflow: auto;">
            <grid :config="roleUserWindowConfig.gridConfigs" ref="gridSec"></grid>
          </div>
        </li>
      </ul>
    </my-window>

  </div>
</template>

<script>
  import grid from "./common/grid.vue"
  import MaskLayer from "./common/MaskLayer.vue"
  import MyDialog from "./common/Dialog.vue"
  import MyTooltip from "./common/OperationStatusTooltip.vue"
  import MyWindow from "./common/Window.vue"
  import handlePrivilege from "./handlePrivilege.vue"
  import Tree from "./common/Tree.vue"
  import TreeSelect from "./common/TreeSelect.vue"
  import {mapGetters, mapActions} from "vuex"
  export default{
    data(){
      return {
        roleInfoApi: "./restful/role/getById?id=",
        roleDeleteApi: "./restful/role/deleteById?id=",
        roleValidApi: "./restful/role/getByWhere",
        roleModifyApi: "./restful/role/checkByWhere",
        defaultValue: "",
        field: "name",
        api: "./restful/user/getAll",
        showDialog: false,
        dialogMessage: "",
        showTooltip: false,
        tooltipType: "",
        tooltipMessage: "",

        treeSelectConfig: {
          api: "./restful/caorg/getAll",
          field: "name",
          selectStyle: {
            width: "450px",
            height: "32px",
            float: "left"
          }
        },
        roleWindowConfig: {
          type: "", //add modify view 分别表示新增，修改以及查看
          readonly: false,
          parent: this,
          show: false,
          title: "",
          height: "500px",
          width: "800px",
          defaultParentOrgId: "",
          roleNameFlag:false,
          roleCodeFlag:false,
          form: {
          	id:"",
            orgId: "",
            name: "",
            code: "",
            appcode: "",
            description: "",
            issuer: "机构管理员"
          },
          method: {
            close(){
              this.roleWindowConfig.show = false;
            },
            confirm(){
              var form = this.roleWindowConfig.form;
              this.roleWindowConfig.form.issuer = "机构管理员";
              if( this.roleWindowConfig.roleCodeFlag == false && this.roleWindowConfig.roleNameFlag == false){
	              if (this.roleWindowConfig.type == "add") {
	                this.$http.post("./restful/role/save", this.roleWindowConfig.form).then(
	                  (res) => {
	                    //新增完按创建时间降序排序，方便查看最新增加的信息
	                    if (res.body.status == "success") {
	                      for (var idx in this.gridConfigs.fields) {
	                        var field = this.gridConfigs.fields[idx]
	
	                        if (field.field == "createDate") {
	                          field.sortType = "desc"
	                        } else {
	                          field.sortType = "";
	                        }
	                      }
	                      this.search();
	                      this.tooltipType = "success";
	                      this.tooltipMessage = "新增成功!"
	                      this.showTooltip = true;
	                      this.roleWindowConfig.show = false;
	                    } else {
	                      this.tooltipType = "failed";
	                      this.tooltipMessage = res.body.message
	                      this.showTooltip = true;
	                    }
	                  },
	                  (res) => {
	                    this.tooltipType = "failed";
	                    this.tooltipMessage = "新增失败!"
	                    this.showTooltip = true;
	                  }
	                )
	              } else if (this.roleWindowConfig.type == "modify") {
	                this.$http.post("./restful/role/update", this.roleWindowConfig.form).then(
	                  (res) => {
	                    this.roleWindowConfig.show = false;
	                    //新增完按创建时间降序排序，方便查看最新增加的信息
	                    if (res.body.status == "success") {
	                      for (var idx in this.gridConfigs.fields) {
	                        var field = this.gridConfigs.fields[idx]
	
	                        if (field.field == "createDate") {
	                          field.sortType = "desc"
	                        } else {
	                          field.sortType = "";
	                        }
	                      }
	                      this.search();
	                      this.tooltipType = "success";
	                      this.tooltipMessage = "修改成功!"
	                      this.showTooltip = true;
	                    } else {
	                      this.tooltipType = "failed";
	                      this.tooltipMessage = res.body.message
	                      this.showTooltip = true;
	                    }
	                  },
	                  (res) => {
	                    this.tooltipType = "failed";
	                    this.tooltipMessage = "修改失败!"
	                    this.showTooltip = true;
	                  }
	                )
	              }              
              }else if(this.roleWindowConfig.roleCodeFlag == true || this.roleWindowConfig.roleNameFlag == true){
               			this.tooltipType = "failed";
                    this.tooltipMessage = "请先修改已存在的字符!"
                    this.showTooltip = true;
              }
            },
            cancel(){
              this.roleWindowConfig.show = false;
            }
          }
        },
        gridConfigs: {
          searchFields: {
            name: ""
          },
          operations: [{
            title: "删除",
            icon: "&#xe9ac;",
            permission: "role:remove",
            func: this.removeRole
          }, {
            title: "编辑",
            icon: "&#xe908",
            permission: "role:modify",
            func: this.modifyRole
          }, {
            title: "查看",
            icon: "&#xe9ce",
            func: this.viewRole
          }],
          operationType: "",
          operationItem: {},
          getSelectedNames: [],
          getSelectedIds: [],
          fields: [
            {
              title: "角色名称",
              field: "name",
              isSortField: true,
              orderBy: "name",
              style: {
                float: "left",
                width: "100px",
                textAlign: "center"
              }
            },
            {
              title: "创建时间",
              field: "createDate",
              isSortField: true,
              orderBy: "createDate",
              style: {
                float: "right",
                width: "180px",
                textAlign: "center"
              }
            },
            {
              title: "所属机构",
              field: "caOrganization.name",
              isSortField: true,
              orderBy: "orgName",
              style: {
                float: "right",
                width: "200px",
                textAlign: "center"
              }
            },
            {
              title: "角色描述",
              field: "description",
              style: {
                textAlign: "center"
              }
            }
          ],
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          api: "./restful/role/getPage"
        },
        roleWindowPrivilege: {
          parent: this,
          type: "rolePermission",
          show: false,
          height: "600px",
          width: "800px",
          title: "",
          getSelectedIds: [],
          getSelectedNames: [],
          form: {
            roleId: "",
            permissionId: []
          },
          method: {
            cancel(){
              this.roleWindowPrivilege.show = false;
            },
            close(){
              this.roleWindowPrivilege.show = false;
            },
            next(){
              this.$refs.handlePrivilege.next()
            },
            prev(){
              this.$refs.handlePrivilege.prev()
            },
            confirm(){
              this.roleWindowPrivilege.form.permissionId = this.$refs.handlePrivilege.getSubmitIds();
              this.roleWindowPrivilege.show = false;
              this.$http.post("./restful/capermission/saveRolePermission", this.roleWindowPrivilege.form).then(
                (res) => {
                  if (res.body.status == "success") {
                    this.tooltipType = "success";
                    this.tooltipMessage = "设置成功!"
                    this.showTooltip = true;
                  } else {
                    this.tooltipType = "failed";
                    this.tooltipMessage = res.body.message
                    this.showTooltip = true;
                  }
                },
                (res) => {
                  this.tooltipType = "failed";
                  this.tooltipMessage = res.body.message
                  this.showTooltip = true;
                }
              )
            }
          }
        },
        roleUserListWindowConfig: {
          parent: this,
          type: "view",
          show: false,
          title: "角色成员",
          height: "650px",
          width: "1100px",
          form:{
            userId:[],
            roleId:""
          },
          gridConfigs: {
            searchFields: {
              roleId: ""
            },
            operations:[{
              title:"删除",
              icon:"&#xe9ac;",
              func:this.removeRoleUser
            }],
            fields: [
              {
                title: "员工ID",
                field: "id",
                isSortField: true,
                style: {
                  width: "50px",
                  float: "left",
                  textAlign: "center"
                }
              }, {
                title: "帐号",
                field: "loginName",
                isSortField: true,
                style: {
                  width: "100px",
                  float: "left",
                  textAlign: "center"
                }
              }, {
                title: "最后登陆时间",
                field: "lastLoginDate",
                style: {
                  float: "right",
                  width: "100px",
                  textAlign: "center"
                }
              }, {
                title: "工号",
                field: "jobNum",
                style: {
                  float: "right",
                  width: "80px",
                  textAlign: "center"
                }
              }, {
                title: "电话",
                field: "phone",
                style: {
                  float: "right",
                  width: "120px",
                  textAlign: "center"
                }
              }, {
                title: "邮箱",
                field: "email",
                style: {
                  float: "right",
                  width: "150px",
                  textAlign: "center"
                }
              }, {
                title: "所属机构",
                field: "organization.name",
                style: {
                  float: "right",
                  width: "150px",
                  textAlign: "center"
                }
              }, {
                title: "姓名",
                field: "username",
                sortType: "asc",
                isSortField: true,
                style: {
                  textAlign: "center"
                }
              }
            ],
            currPageNum: 1,
            totalPageNum: 1,
            pageSize: 10,
            api: "./restful/user/getPageWithRoleId",
            maskByParent: true
          },
          method: {
            cancel(){
              this.roleUserListWindowConfig.show = false;
            },
            close(){
              this.roleUserListWindowConfig.show = false;
            }
          }
        },
        roleUserWindowConfig: {
          parent: this,
          type: "add",
          show: false,
          title: "用户列表",
          height: "600px",
          width: "1000px",
          treeApi: "./restful/caorg/getAll",
          gridConfigs: {
            selectedIds: [],
            searchFields: {
              id: 0
            },
            fields: [
              {
                title: "员工ID",
                field: "id",
                isSortField: true,
                style: {
                  width: "80px",
                  float: "left",
                  textAlign: "center"
                }
              }, {
                title: "帐号",
                field: "loginName",
                isSortField: true,
                style: {
                  width: "100px",
                  float: "left",
                  textAlign: "center"
                }
              }, {
                title: "工号",
                field: "jobNum",
                style: {
                  float: "right",
                  width: "80px",
                  textAlign: "center"
                }
              }, {
                title: "电话",
                field: "phone",
                style: {
                  float: "right",
                  width: "100px",
                  textAlign: "center"
                }
              }, {
                title: "所属机构",
                field: "organization.name",
                style: {
                  float: "right",
                  width: "100px",
                  textAlign: "center"
                }
              }, {
                title: "姓名",
                field: "username",
                sortType: "asc",
                isSortField: true,
                style: {
                  textAlign: "center"
                }
              }
            ],
            currPageNum: 1,
            totalPageNum: 1,
            pageSize: 10,
            api: "./restful/user/findUserByOrgId",
            maskByParent: true
          },
          method: {
            confirm(){
              var roleId = this.roleUserListWindowConfig.gridConfigs.searchFields.roleId;
              var selectedMap = this.$refs.gridSec.selectedMap;
              var selectedIds = new Array();

              for (var i in selectedMap) {
                if (selectedMap[i] != null) {
                  selectedIds.push(selectedMap[i]);
                }
              }

              this.$http.post("./restful/role/saveUserRole", {
                type: "byRole",
                roleId: roleId,
                userId: selectedIds
              }).then(
                (res) => {
                  var datas = res.body.content;

                  if(datas == "true"){
                    this.tooltipType = "success";
                    this.tooltipMessage = "添加成功!"
                    this.showTooltip = true;

                    this.$refs.selectedUserGrid.search();
                    this.roleUserWindowConfig.show = false;
                  } else {
                    this.tooltipType = "failed";
                    this.tooltipMessage = "添加失败!"
                    this.showTooltip = true;
                  }
                }
              )
            },
            cancel(){
              this.roleUserWindowConfig.show = false;
            },
            close(){
              this.roleUserWindowConfig.show = false;
            }
          }
        }
      }
    },
    mounted(){

    },
    methods: {
    	isExist(vkey,value) {
    		var param = new Object();
    		param[vkey] = value;
	    		if(value != ""){
	          this.$http.post(this.roleValidApi , param).then(
	            (res) => {	            	
	            	if (res.body.status == "success") {
	            		if( vkey == 'name'){
	
	            			this.roleWindowConfig.roleNameFlag = true;
	            		}else if(vkey == 'code'){
	            			this.roleWindowConfig.roleCodeFlag = true;
	            		}
	            	}else{
	            		if( vkey == 'name'){
	
	            			this.roleWindowConfig.roleNameFlag = false;
	            		}else if(vkey == 'code'){
	            			this.roleWindowConfig.roleCodeFlag = false;
	            		}
	            	}
	
	          })
	
	        }else if( vkey == 'name' &&  value == ""){
	        		this.roleWindowConfig.roleNameFlag = false;
	        }else if( vkey == 'code' &&  value == "" ){
	        		this.roleWindowConfig.roleCodeFlag = false;
	        }
	    },
    	nameExistModify(){
      	var modifyName={
    			'name': this.roleWindowConfig.form.name,
    				'id': this.roleWindowConfig.form.id
    		};   		
	      this.$http.post(this.roleModifyApi , modifyName).then(
	            (res) => {
	            	if (res.body.status == "success") {	            		
	            			this.roleWindowConfig.roleNameFlag = true;
	            	}else{	            			
	            			this.roleWindowConfig.roleNameFlag = false;	            
	            	}
	            })
      },
      codeExistModify(){
      	var modifyCode={
    			'code': this.roleWindowConfig.form.code,
    				'id': this.roleWindowConfig.form.id
    		};
    		this.$http.post(this.roleModifyApi , modifyCode).then(
	            (res) => {
	            	if (res.body.status == "success") {
	            		this.roleWindowConfig.roleCodeFlag = true;
	            	}else{
	            		this.roleWindowConfig.roleCodeFlag = false;
	            	}
	      })
      },
      addUser(){
        this.$http.post("./restful/user/getAllWithRoleId", this.roleUserListWindowConfig.gridConfigs.searchFields).then(
          (res) => {
            var datas = res.body.content;
            var idArr = new Array();

            for (var i in datas) {
              var data = datas[i];
              idArr.push(data.id);
            }
            this.roleUserWindowConfig.gridConfigs.selectedIds = idArr;
            this.roleUserWindowConfig.show = true;
          }
        )
      },
      viewRole(item){
        this.$http.get(this.roleInfoApi + item.id).then(
          (res) => {
            var roleInfo = res.body.content;
            this.roleWindowConfig.form = {
              orgId: "" + roleInfo.orgId,
              name: roleInfo.name,
              code: roleInfo.code,
              appcode: roleInfo.appcode,
              description: roleInfo.description
            }

            this.roleWindowConfig.type = "view";
            this.roleWindowConfig.readonly = true;
            this.roleWindowConfig.title = "角色查看（只读）"
            this.roleWindowConfig.show = true;
            this.roleWindowConfig.roleNameFlag = false;
        		this.roleWindowConfig.roleCodeFlag = false;
          }
        )
      },
      modifyRole(item){
      	this.roleWindowConfig.form.id=item.id
        this.$http.get(this.roleInfoApi + item.id).then(
          (res) => {
            var roleInfo = res.body.content;
            this.roleWindowConfig.form = {
              orgId: "" + roleInfo.orgId,
              name: roleInfo.name,
              code: roleInfo.code,
              appcode: roleInfo.appcode,
              description: roleInfo.description,
              id: item.id
            }

            this.roleWindowConfig.type = "modify";
            this.roleWindowConfig.readonly = false;
            this.roleWindowConfig.title = "角色修改"
            this.roleWindowConfig.show = true;
            this.roleWindowConfig.roleNameFlag = false;
        		this.roleWindowConfig.roleCodeFlag = false;
          }
        )
      },
      removeRole(item) {
        this.dialogMessage = "确认需要删除角色名称为" + item.name + "的角色吗?";
        this.operationType = "removeRole";
        this.operationItem = item;
        this.showDialog = true;
      },
      batchRemoveRole: function () {
        this.gridConfigs.getSelectedNames = [];
        this.gridConfigs.getSelectedIds = [];
        var selectItems = this.$refs.grid.getSelectedItems();
        if (selectItems.length == 0) {
          this.tooltipType = "failed";
          this.tooltipMessage = "请先选择角色!"
          this.showTooltip = true;
          return;
        } else {
          for (var i in selectItems) {
            this.gridConfigs.getSelectedIds.push(selectItems[i].id)
            this.gridConfigs.getSelectedNames.push(selectItems[i].name)
          }
          this.dialogMessage = "确认要批量删除：" + this.gridConfigs.getSelectedNames + " 的角色吗?";
          this.operationType = "removeRoleBatch";
          this.showDialog = true;
        }
      },
      addRole(){
        //新增时对各字段的值进行重置
        this.roleWindowConfig.form = {
          orgId: "",
          name: "",
          code: "",
          appcode: "",
          description: ""
        };
        this.roleWindowConfig.type = "add";
        this.roleWindowConfig.show = true;
        this.roleWindowConfig.title = "新增角色";
        this.roleWindowConfig.readonly = false;
        this.roleWindowConfig.roleNameFlag = false;
        this.roleWindowConfig.roleCodeFlag = false;
      },
      search(){
        //条件查询时必须将当前页重置为1
        this.$refs.grid.resetCurrentPageNum();
        this.$refs.grid.search();
      },
      searchSec(){
        //条件查询时必须将当前页重置为1
        this.$refs.selectedUserGrid.resetCurrentPageNum();
        this.$refs.selectedUserGrid.search();
      },
      reset(){
        this.gridConfigs.searchFields.name = "";
        this.search();
      },
      dialogCancel(){
        //对值进行重置,不然不会触发change事件
        this.showDialog = false;
      },
      dialogConfirm(){
        this.showDialog = false;

        if (this.operationType == "removeRole") {
          this.$http.get(this.roleDeleteApi + this.operationItem.id).then(
            (res) => {
              this.tooltipType = "success";
              this.tooltipMessage = "删除成功!"
              this.showTooltip = true;
              this.search();
            },
            (res) => {
              this.tooltipType = "failed";
              this.tooltipMessage = "删除失败!"
              this.showTooltip = true;
            }
          )
        } else if (this.operationType == "removeRoleBatch") {
          this.$http.post("./restful/role/batchDelete", this.gridConfigs.getSelectedIds).then(
            (res) => {
              this.tooltipType = "success";
              this.tooltipMessage = "批量删除成功!"
              this.showTooltip = true;
              this.search();
              this.gridConfigs.getSelectedIds = []
            },
            (res) => {
              this.tooltipType = "failed";
              this.tooltipMessage = "批量删除失败!"
              this.showTooltip = true;
              this.gridConfigs.getSelectedIds = []
            }
          )
        }else if(this.operationType == "removeRoleUserAn"){
          var userRoleItemId={
            roleId:this.roleUserListWindowConfig.gridConfigs.searchFields.roleId,
            userId:this.operationItem.id
          };
          this.$http.post("restful/role/deleteUserRole",userRoleItemId).then(
            (res) => {
              this.tooltipType = "success";
              this.tooltipMessage = "删除成功!"
              this.showTooltip = true;
              this.searchSec();
            },
            (res) => {
              this.tooltipType = "failed";
              this.tooltipMessage = "删除失败!"
              this.showTooltip = true;
            }
          )
        }else if(this.operationType == "removeRoleUserBatch"){
            this.roleUserListWindowConfig.form.roleId=this.roleUserListWindowConfig.gridConfigs.searchFields.roleId;
            this.$http.post("./restful/role/batchDeleteRoleUser",this.roleUserListWindowConfig.form).then(
              (res) => {
              this.tooltipType = "success";
              this.tooltipMessage = "批量删除成功!"
              this.showTooltip = true;
              this.searchSec();
              this.roleUserListWindowConfig.form.userId = []
            },
            (res) => {
              this.tooltipType = "failed";
              this.tooltipMessage = "批量删除失败!"
              this.showTooltip = true;
              this.roleUserListWindowConfig.form.userId = []
            }
            )
        }
      },
      tooltipClosed(){
        this.showTooltip = false;
      },
      rolePrivilege(){
        var selectItems = this.$refs.grid.getSelectedItems();

        if (selectItems.length > 1) {
          this.tooltipType = "failed";
          this.tooltipMessage = "一次只能对一个角色进行该操作!"
          this.showTooltip = true;
          return;
        } else if (selectItems.length == 0) {
          this.tooltipType = "failed";
          this.tooltipMessage = "请先选择需要操作的角色!"
          this.showTooltip = true;
          return;
        } else {
          var id = selectItems[0].id;
          var title = selectItems[0].name;
          this.roleWindowPrivilege.form.roleId = id;
          this.roleWindowPrivilege.title = "角色授权-" + title;
          this.roleWindowPrivilege.show = true;
        }
      },
      showRoleUserListWin(){
        var selectItems = this.$refs.grid.getSelectedItems();

        if (selectItems.length > 1) {
          this.tooltipType = "failed";
          this.tooltipMessage = "一次只能对一个角色进行该操作!"
          this.showTooltip = true;
          return;
        } else if (selectItems.length == 0) {
          this.tooltipType = "failed";
          this.tooltipMessage = "请先选择需要操作的角色!"
          this.showTooltip = true;
          return;
        } else {
          var id = selectItems[0].id;
          var title = selectItems[0].name;
          this.roleUserListWindowConfig.gridConfigs.searchFields.roleId = id;
          this.roleUserListWindowConfig.title = "角色成员-" + title;
          this.roleUserListWindowConfig.show = true;
        }
      },
      selected(id, title){
        //点击请求机构下面存在的用户数据
        this.roleUserWindowConfig.gridConfigs.searchFields.id = id;
        //将当前页重置为第一页
        this.$refs.gridSec.currPageNum = 1;
        this.$refs.gridSec.search();
      },
      removeRoleUser(item){
        console.log(item)
        this.dialogMessage = "确认需要移除" + item.username + "这个用户吗吗?";
        this.operationType = "removeRoleUserAn";
        this.operationItem = item;
        this.showDialog = true;
      },
      removeRoleUserBatch(){
        this.gridConfigs.getSelectedNames = [];
        this.roleUserListWindowConfig.form.userId = []
        var selectItems = this.$refs.selectedUserGrid.getSelectedItems();
        if (selectItems.length == 0) {
          this.tooltipType = "failed";
          this.tooltipMessage = "请先选择角色!"
          this.showTooltip = true;
          return;
        } else {
          for (var i in selectItems) {
            this.roleUserListWindowConfig.form.userId.push(selectItems[i].id)
            this.gridConfigs.getSelectedNames.push(selectItems[i].username)
          }
          this.dialogMessage = "确认要批量删除：" + this.gridConfigs.getSelectedNames + " 的用户吗?";
          this.operationType = "removeRoleUserBatch";
          this.showDialog = true;
        }
      }
    },
    components: {
      grid: grid,
      MaskLayer: MaskLayer,
      MyDialog: MyDialog,
      MyTooltip: MyTooltip,
      MyWindow: MyWindow,
      handlePrivilege: handlePrivilege,
      Tree: Tree,
      TreeSelect: TreeSelect
    }
  }
</script>

<style scoped>
  .icon-del:before {
    font-family: 'iconfont';
    content: '\ebf7';
    color: #20a0ff;
  }

  .form-field {
    width: 450px;
  }
</style>

