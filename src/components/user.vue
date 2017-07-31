<template>
  <div class="user">
    <div class="user-head manager-head">
      <div class="fl user-list-search" v-if="$permissionValid('user:search')">
        <span>帐号</span>
        <input v-model="gridConfigs.searchFields.loginName" placeholder="请输入帐号">
        <span>姓名</span>
        <input v-model="gridConfigs.searchFields.username" placeholder="请输入姓名">
        <button type="button" @click="search">查询</button>
        <button type="button" @click="reset">重置</button>
      </div>
      <div class="fr user-list-modify">
        <button type="button" @click="stopUser">停用</button>
        <button type="button" @click="startUser">启用</button>
        <button type="button" @click="addPerson" v-if="$permissionValid('user:add')">新增</button>
        <button type="button" @click="batchRemovePerson" v-if="$permissionValid('user:remove')">批量删除</button>
      </div>
    </div>

    <div class="content-main">
      <grid :config="gridConfigs" ref="grid"></grid>
    </div>

    <!-- 确认操作的提示框 -->
    <my-dialog v-if="showDialog" :message="dialogMessage"
               @dialogCancel="dialogCancel" @dialogConfirm="dialogConfirm"></my-dialog>
    <!--　用于显示信息的提示工具　-->
    <my-tooltip :show="showTooltip" :showType="tooltipType" :message="tooltipMessage"
                @tooltipClosed="tooltipClosed"></my-tooltip>
    <!--　用于编辑信息的窗口组件　-->
    <my-window v-if="userWindowConfig.show" :config="userWindowConfig">
      <!--弹框表单的样式为公用，-->
      <div class="content-body-form">
        <div>
            <label>所属机构：</label>
            <tree-select :selectStyle="treeSelectConfig.selectStyle" :readonly="userWindowConfig.readonly"
                         v-model="userWindowConfig.form.orgId" :api="treeSelectConfig.api"></tree-select>
        </div>
        <div>
          <label>直属主管：</label>
          <span class="form-field-direct">
            {{directUserWindowConfig.directName}}
            <button @click="directSupervisor" :disabled="this.userWindowConfig.type == 'view'" class="form-field-directBtn">请选择</button>
            </span>
          <input type="text" class="form-field" v-model="userWindowConfig.form.directManagerId" style="display:none">
        </div>
        <div v-if="userWindowConfig.type=='add'">
          <label>账&nbsp;&nbsp;&nbsp;&nbsp;号：</label>
          <input v-model="userWindowConfig.form.loginName" type="text"
                 @keyup="isExist('loginName',userWindowConfig.form.loginName)"
                 :readonly="userWindowConfig.readonly" class="form-field"/>
          <span v-if="userWindowConfig.userLoginNameFlag" class="red">&nbsp;已存在</span>
        </div>
        <div v-if="userWindowConfig.type !='add'">
          <label>账&nbsp;&nbsp;&nbsp;&nbsp;号：</label>
          <input v-model="userWindowConfig.form.loginName" type="text"
                 @keyup="nameExistModify()"
                 :readonly="userWindowConfig.readonly" class="form-field"/>
          <span v-if="userWindowConfig.userLoginNameFlag" class="red">&nbsp;已存在</span>
        </div>
        <div v-if="userWindowConfig.type=='add'">
          <label>密&nbsp;&nbsp;&nbsp;&nbsp;码：</label>
          <input v-model="userWindowConfig.form.password" type="password"
          :readonly="userWindowConfig.readonly" class="form-field"/>
        </div>
        <div>
          <label>姓&nbsp;&nbsp;&nbsp;&nbsp;名：</label>
          <input v-model="userWindowConfig.form.username" type="text"
          :readonly="userWindowConfig.readonly" class="form-field"/>
        </div>
        <div>
          <label>工&nbsp;&nbsp;&nbsp;&nbsp;号：</label>
          <input v-model="userWindowConfig.form.jobNum" type="text"
          :readonly="userWindowConfig.readonly" class="form-field"/>
          </div>
        <div>
          <label>电&nbsp;&nbsp;&nbsp;&nbsp;话：</label>
          <input v-model="userWindowConfig.form.phone" type="text"
          :readonly="userWindowConfig.readonly" class="form-field"/>
          </div>
        <div>
          <label>邮&nbsp;&nbsp;&nbsp;&nbsp;箱：</label>
          <input v-model="userWindowConfig.form.email" type="text"
          :readonly="userWindowConfig.readonly" class="form-field"/>
          </div>
      </div>
    </my-window>
    <!--用户对应下的角色-->
    <my-window v-if="userRoleWindowConfig.show" :config="userRoleWindowConfig">
      <div class="control-head manager-head" style="height:50px;width:100%;background-color:#eff1f5;padding: 12px 10px;border:1px solid #aaaaaa;border-bottom: 0px;">
        <div class="fl control-list-search">
          <span>角色名称:</span>
          <input type="text" v-model="userRoleWindowConfig.gridConfigs.searchFields.name"/>
          <span>状态:</span>
          <select>
            <option>有效</option>
            <option>无效</option>
          </select>
          <button type="button" @click="searchSec">查询</button>
          <button type="button" @click="resetSec">重置</button>
        </div>
        <div class="fr control-list-modify">
          <button type="button" @click="addUserRole">配置角色</button>
          <button type="button" @click="removeUserRoleBatch">批量删除</button>
        </div>
      </div>
      <div style="height:calc(100% - 50px);border:1px solid #aaaaaa;overflow: auto;">
        <grid :config="userRoleWindowConfig.gridConfigs" ref="gridSec" class="gridSec"></grid>
      </div>
    </my-window>
    <!--用户对应下的添加角色-->
    <my-window v-if="addUserRoleWindowConfig.show" :config="addUserRoleWindowConfig">
      <div class="control-head manager-head" style="height:50px;width:100%;background-color:#eff1f5;padding: 12px 10px;border:1px solid #aaaaaa;border-bottom: 0px;">
        <div class="fl control-list-search">
          <span>角色名称:</span>
          <input type="text" v-model="addUserRoleWindowConfig.gridConfigs.searchFields.name"/>
          <span>状态:</span>
          <select>
            <option>有效</option>
            <option>无效</option>
          </select>
          <button type="button" @click="searchThir">查询</button>
          <button type="button" @click="resetThir">重置</button>
        </div>
      </div>
      <div style="height:calc(100% - 50px);border:1px solid #aaaaaa;overflow: auto;">
        <grid :config="addUserRoleWindowConfig.gridConfigs" ref="gridThir" class="gridSec"></grid>
      </div>
    </my-window>

    <!--直属主管-->
    <my-window ref="roleUserWindow" v-if="directUserWindowConfig.show" :config="directUserWindowConfig">
      <ul style="width:100%;height:100%;">
        <li style="float:left;width:30%;height:100%;border: 1px solid #aaaaaa;">
          <tree :defaultSelectedId="defaultValue" :api="directUserWindowConfig.treeApi"
                :field="field" :expandLevel="1" @selected="selected"></tree>
        </li>
        <li style="width:70%;float:right;height:100%;padding-left:10px;">
          <div style="height:100%;border:1px solid #aaaaaa;overflow: auto;">
            <grid :config="directUserWindowConfig.gridConfigs" ref="gridFour" @selected="directSelected"></grid>
          </div>
        </li>
      </ul>
    </my-window>
      <!--重置密码-->
    <my-window v-if="setPasswordWindowConfig.show" :config="setPasswordWindowConfig">
      <div class="content-body-form">
        <div>
            <label>新密码：</label>
            <input type="password" class="form-field" v-model="setPasswordWindowConfig.form.password"/>
        </div>
      <div>
            <label>重复密码：</label>
            <input type="password" class="form-field" v-model="setPasswordWindowConfig.passwordRepeat"/>
      </div>
    </div>
    </my-window>
  </div>
</template>

<script>
  import grid from "./common/grid.vue"
  import MyDialog from "./common/Dialog.vue"
  import MyTooltip from "./common/OperationStatusTooltip.vue"
  import MyWindow from "./common/Window.vue"
  import TreeSelect from "./common/TreeSelect.vue"
  import Tree from "./common/Tree.vue"

  export default{
    name: "user",
    data(){
      return {
        userInfoApi: "./restful/user/getById?id=",
        userDeleteApi: "./restful/user/deleteById?id=",
        userValidApi: "./restful/user/getByWhere",
        userModifyApi: "./restful/user/checkByWhere",
        addFlag: false,
        showDialog: false,
        dialogMessage: "",
        showTooltip: false,
        tooltipType: "",
        tooltipMessage: "",
        defaultValue: "",
        field: "name",
        treeSelectConfig: {
          api: "./restful/caorg/getAll",
          field: "name",
          selectStyle: {
            width: "450px",
            height: "32px",
            float: "left"
          }
        },
        userWindowConfig: {
          type: "",
          readonly: false,
          parent: this,
          show: false,
          title: "",
          height: "480px",
          width: "800px",
          defaultParentOrgId: "",
          userLoginNameFlag: false,
          form: {
          	id:"",
            loginName: "",
            password: "",
            username: "",
            jobNum: "",
            phone: "",
            email: "",
            orgId: "",
            issuer: "",
            directManagerId:""
          },
          method: {
            close(){
              this.userWindowConfig.show = false;
            },
            confirm(){
              this.userWindowConfig.form.issuer = "机构管理员";
              if(this.userWindowConfig.userLoginNameFlag == true){
              	this.tooltipType = "failed";
              	this.tooltipMessage = "账号已存在!"
              	this.showTooltip = true;
              }
              else if (this.userWindowConfig.type == "add" ) {
                this.$http.post("./restful/user/save", this.userWindowConfig.form).then(
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
                      this.tooltipMessage = "新增用户成功!"
                      this.showTooltip = true;
                      this.userWindowConfig.show = false;
                    } else {
                      this.tooltipType = "failed";
                      this.tooltipMessage = res.body.message
                      this.showTooltip = true;
                    }
                  },
                  (res) => {
                    this.tooltipType = "failed";
                    this.tooltipMessage = "新增用户失败!"
                    this.showTooltip = true;
                  }
                )
              } else if (this.userWindowConfig.type == "modify") {
                this.$http.post("./restful/user/update", this.userWindowConfig.form).then(
                  (res) => {
                    this.userWindowConfig.show = false;
                    //新增完按创建时间降序排序，方便查看最新增加的信息
                    if (res.body.status == "success") {
                      for (var idx in this.gridConfigs.fields) {
                        var field = this.gridConfigs.fields[idx]
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

            },
            cancel(){
              this.userWindowConfig.show = false;
            }
          }
        },
        gridConfigs: {
          searchFields: {
            loginName: "",
            username: ""
          },
          operations: [{
            title: "删除",
            icon: "&#xe9ac;",
            permission: "user:remove",
            func: this.removeUser
          }, {
            title: "编辑",
            icon: "&#xe908",
            permission: "user:modify",
            func: this.modifyUser
          }, {
            title: "查看",
            icon: "&#xe9ce",
            func: this.viewUser
          },{
            title: "角色管理",
            icon: "&#xea1e",
            func: this.viewUserRole
          },{
            title: "重置密码",
            icon: "&#xebe0",
            func: this.resetPassword
          }
          ],
          operationType: "",
          operationItem: {},
          getSelectedNames: [],
          getSelectedIds: [],
          fields: [
            {
              title: "员工ID",
              field: "id",
              isSortField: true,
              orderBy: "id",
              style: {
                width: "80px",
                float: "left",
                textAlign: "center"
              }
            },
            {
              title: "帐号",
              field: "loginName",
              isSortField: true,
              sortType: "asc",
              style: {
                width: "80px",
                float: "left",
                textAlign: "center"
              }
            },
            {
              title: "状态",
              field: "isLock",
              isSortField: true,
              style: {
                width: "80px",
                textAlign: "center",
                float:"right"
              }
            },
            {
              title: "最后登陆时间",
              field: "lastLoginDate",
              isSortField: true,
              orderBy: "lastLoginDate",
              style: {
                float: "right",
                width: "160px",
                textAlign: "center"
              }
            },
            {
              title: "最近更新时间",
              field: "updateDate",
              isSortField: true,
              style: {
                float: "right",
                width: "160px",
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
                width: "160px",
                textAlign: "center"
              }
            },
            {
              title: "工号",
              field: "jobNum",
              style: {
                float: "right",
                width: "80px",
                textAlign: "center"
              }
            },
            {
              title: "电话",
              field: "phone",
              style: {
                float: "right",
                width: "120px",
                textAlign: "center"
              }
            },
            {
              title: "所属机构",
              field: "organization.name",
              style: {
                float: "right",
                width: "120px",
                textAlign: "center"
              }
            },
            {
              title: "姓名",
              field: "username",
              isSortField: true,
              orderBy: "username",
              style: {
                textAlign: "center"
              }
            }
          ],
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          api: "./restful/user/getPage",
          searchedCallback(rows){
            for (var i in rows) {
              var row = rows[i];

              if (row.isLock === 0) {
                row.isLock = "正常"
              } else if (row.isLock === 1) {
                row.isLock = "已停用";
              } else {
                row.isLock = "未定义状态";
              }
            }
          }
        },
        userRoleWindowConfig: {
          type: "",
          show: false,
          parent: this,
          title:"",
          height:"650px",
          width:"1000px",
          method:{
            close(){
              this.userRoleWindowConfig.show=false;
            },
            cancel(){
              this.userRoleWindowConfig.show=false;
            }
          },
          gridConfigs:{
            searchFields:{
              id:"",
              name:""
            },
            hasCheckbox:true,
            operations:[{
              title:"删除",
              icon:"&#xe9ac;",
              func:this.removeUserRole
            }],
            operationType:"",
            operationItem:{},
            getSelectedNames:[],
            getSelectedIds:[],
            fields:[{
              title:"角色名称",
              field:"name",
              style:{
                width:"100px",
                float:"left",
                textAlign:"center"
              }
            },{
              title:"角色描述",
              field:"description",
              style:{
                width:"400px",
                float:"left",
                textAlign:"center"
              }
            },{
              title:"创建人",
              field:"issuer",
              style:{
                width:"100px",
                float:"right",
                textAlign:"center"
              }
            }],
            currPageNum: 1,
            totalPageNum: 1,
            pageSize: 10,
            api: "./restful/role/getPageRoleByUserId",
            maskByParent: true
          }
        },
        addUserRoleWindowConfig:{
          type:"add",
          show:false,
          parent:this,
          title: "",
          height: "650px",
          width: "550px",
          form:{
            userId:"",
            roleId:[]
          },
          method:{
            close(){
              this.addUserRoleWindowConfig.show=false;
            },
            cancel(){
              this.addUserRoleWindowConfig.show=false;
            },
            confirm(){
              this.addUserRoleWindowConfig.form.roleId=[];
              var selectedMap=this.$refs.gridThir.selectedMap;
              for (var i in selectedMap) {
                if (selectedMap[i] != null) {
                  this.addUserRoleWindowConfig.form.roleId.push(selectedMap[i]);
                }
              }
              this.$http.post("./restful/role/saveUserRole",this.addUserRoleWindowConfig.form).then(
                (res) => {
                  if (res.body.status == "success") {
                    this.tooltipType = "success";
                    this.tooltipMessage = "设置成功!"
                    this.showTooltip = true;
                    this.searchSec();
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
              this.addUserRoleWindowConfig.show=false;
            }
          },
          gridConfigs:{
            selectedIds: [],
            searchFields:{
              name:""
            },
            hasCheckbox:true,
            operations: [],
            operationType: "",
            operationItem: {},
            getSelectedNames:[],
            getSelectedIds:[],
            fields: [
              {
                title: "角色名称",
                field: "name",
                style: {
                  width: "100px",
                  float: "left",
                  textAlign: "center"
                }
              }
            ],
            currPageNum: 1,
            totalPageNum: 1,
            pageSize: 10,
            api: "./restful/role/getPage",
            maskByParent: true
          },
        },
	      //直属主管
        directUserWindowConfig: {
          parent: this,
          type: "add",
          show: false,
          title: "用户列表",
          height: "600px",
          width: "1000px",
          treeApi: "./restful/caorg/getAll",
          directName:"",
          gridConfigs: {
            hasCheckbox:false,
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
              this.directUserWindowConfig.show = false;
            },
            cancel(){
              this.directUserWindowConfig.show = false;
            },
            close(){
              this.directUserWindowConfig.show = false;
            }
          }
        },
        //修改密码
        setPasswordWindowConfig: {
          type: "",
          readonly: false,
          parent: this,
          show: false,
          title: "",
          height: "200px",
          width: "800px",
          defaultParentOrgId: "",
          passwordRepeat:"",
          form: {
          	id:"",
            password: ""
          },
          method: {
            close(){
              this.setPasswordWindowConfig.show = false;
            },
            confirm(){
              if(this.setPasswordWindowConfig.form.password!=this.setPasswordWindowConfig.passwordRepeat){
                this.tooltipType = "failed";
                this.tooltipMessage = "两次输入的密码不同"
                this.showTooltip = true;
              }else if(this.setPasswordWindowConfig.form.password==""){
                this.tooltipType = "failed";
                this.tooltipMessage = "密码不能为空"
                this.showTooltip = true;
              }else{
                this.$http.post("./restful/user/update", this.setPasswordWindowConfig.form).then(
                  (res) => {
                    this.setPasswordWindowConfig.show = false;
                    if (res.body.status == "success") {
                      this.search();
                      this.tooltipType = "success";
                      this.tooltipMessage = "修改成功!"
                      this.showTooltip = true;
                      //执行完清空数据
                      this.setPasswordWindowConfig.form.password="";
                      this.setPasswordWindowConfig.passwordRepeat="";
                    } else {
                      this.tooltipType = "failed";
                      this.tooltipMessage = res.body.message
                      this.showTooltip = true;
                    }
                  }
                )
              }
            },
            cancel(){
              this.setPasswordWindowConfig.show = false;
            }
          }
        },
      }
    },
    mounted(){
    },
    methods: {

    	isExist(vkey,value) {
    		var param = new Object();
    		param[vkey] = value;

	    		if(value != ""){
	          this.$http.post(this.userValidApi , param).then(
	            (res) => {

	            	if (res.body.status == "success") {
	            			this.userWindowConfig.userLoginNameFlag = true;
	            	}else{
	            			this.userWindowConfig.userLoginNameFlag = false;
	            	}
	          })
	        }else{
	        		this.userWindowConfig.userLoginNameFlag = false;
	        }

      },
      nameExistModify(){
      	var modifyName={
    			'loginName': this.userWindowConfig.form.loginName,
    				'id': this.userWindowConfig.form.id
    		};
	      this.$http.post(this.userModifyApi , modifyName).then(
	            (res) => {
	            	if (res.body.status == "success") {
	            			this.userWindowConfig.userLoginNameFlag = true;
	            	}else{
	            			this.userWindowConfig.userLoginNameFlag = false;
	            	}
	            })
      },
      removeUser: function (item) {
        this.dialogMessage = "确认需要删除ID为" + item.id + "的用户吗?";
        this.operationType = "removeUser";
        this.operationItem = item;
        this.showDialog = true;
      },
      batchRemovePerson: function () {
        this.gridConfigs.getSelectedNames = [];
        this.gridConfigs.getSelectedIds = [];
        var selectItems = this.$refs.grid.getSelectedItems();
        if (selectItems.length == 0) {
          this.tooltipType = "failed";
          this.tooltipMessage = "请先选择用户!"
          this.showTooltip = true;
          return;
        } else {
          for (var i in selectItems) {
            this.gridConfigs.getSelectedIds.push(selectItems[i].id)
            this.gridConfigs.getSelectedNames.push(selectItems[i].username)
          }
          this.dialogMessage = "确认要批量删除姓名为：" + this.gridConfigs.getSelectedNames + " 的用户吗?";
          this.operationType = "removeUserBatch";
          this.showDialog = true;
        }
      },
      modifyUser: function (item) {
        this.$http.get(this.userInfoApi + item.id).then(
          (res) => {
            var userInfo = res.body.content;
            this.userWindowConfig.form = {
              loginName: userInfo.loginName,
              username: userInfo.username,
              jobNum: userInfo.jobNum,
              phone: userInfo.phone,
              email: userInfo.email,
              orgId: "" + userInfo.orgId,
              id: item.id
            }

            this.userWindowConfig.type = "modify";
            this.userWindowConfig.readonly = false;
            this.userWindowConfig.title = "用户修改"
            this.userWindowConfig.show = true;
            this.userWindowConfig.userLoginNameFlag = false;
          }
        )
      },
      viewUser: function (item) {
        this.$http.get(this.userInfoApi + item.id).then(
          (res) => {
            var userInfo = res.body.content;
            this.userWindowConfig.form = {
              loginName: userInfo.loginName,
              username: userInfo.username,
              jobNum: userInfo.jobNum,
              phone: userInfo.phone,
              email: userInfo.email,
              orgId: "" + userInfo.orgId
            }
            this.directUserWindowConfig.directName=userInfo.directManagerName
            this.userWindowConfig.type = "view";
            this.userWindowConfig.readonly = true;
            this.userWindowConfig.title = "用户查看（只读）"
            this.userWindowConfig.show = true;
            this.userWindowConfig.loginNameFlag = false;
            this.userWindowConfig.userLoginNameFlag = false;
          }
        )
      },
      viewUserRole(item){
        this.userRoleWindowConfig.show=true;
        this.userRoleWindowConfig.title = item.username+"-所配置的角色";
        this.userRoleWindowConfig.gridConfigs.searchFields.id=item.id;
      },
      addPerson(){
        //新增时清空数据
        this.userWindowConfig.form = {
          loginName: "",
          username: "",
          jobNum: "",
          phone: "",
          email: "",
          orgId: "",
        }
        this.directUserWindowConfig.directName="";
        this.userWindowConfig.show = true;
        this.userWindowConfig.title = "新增用户";
        this.userWindowConfig.readonly = false;
        this.userWindowConfig.type = "add";
        this.userWindowConfig.userLoginNameFlag = false;
      },
      directSupervisor(){
        this.directUserWindowConfig.show=true
      },
      search(){
        //条件查询时必须将当前页重置为1
        this.$refs.grid.resetCurrentPageNum();
        this.$refs.grid.search();
      },
      searchSec(){
        //条件查询时必须将当前页重置为1
        this.$refs.gridSec.resetCurrentPageNum();
        this.$refs.gridSec.search();
      },
      searchThir(){
        this.$refs.gridThir.resetCurrentPageNum();
        this.$refs.gridThir.search();
      },
      reset(){
        this.gridConfigs.searchFields.loginName = "";
        this.gridConfigs.searchFields.username = "";
        this.search();
      },
      resetSec(){
        this.userRoleWindowConfig.gridConfigs.searchFields.name=""
        this.searchSec();
      },
      resetThir(){
        this.addUserRoleWindowConfig.gridConfigs.searchFields.name=""
        this.searchThir();
      },
      dialogCancel(){
        //对值进行重置,不然不会触发change事件
        this.showDialog = false;
      },
      dialogConfirm(){
        this.showDialog = false;

        if (this.operationType == "removeUser") {
          this.$http.get(this.userDeleteApi + this.operationItem.id).then(
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
        } else if (this.operationType == "removeUserBatch") {
          this.$http.post("./restful/user/batchDelete", this.gridConfigs.getSelectedIds).then(
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
        }else if(this.operationType == "removeUserRoleAn"){
          var userRoleItemId={
            userId:this.userRoleWindowConfig.gridConfigs.searchFields.id,
            roleId:this.operationItem.id
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
        }else if(this.operationType == "removeUserRoleBatch"){
            this.addUserRoleWindowConfig.form.userId=this.userRoleWindowConfig.gridConfigs.searchFields.id;
            this.$http.post("./restful/role/batchDeleteUserRole",this.addUserRoleWindowConfig.form).then(
              (res) => {
              this.tooltipType = "success";
              this.tooltipMessage = "批量删除成功!"
              this.showTooltip = true;
              this.searchSec();
              this.addUserRoleWindowConfig.form.roleId = []
            },
            (res) => {
              this.tooltipType = "failed";
              this.tooltipMessage = "批量删除失败!"
              this.showTooltip = true;
              this.addUserRoleWindowConfig.form.roleId = []
            }
            )
        }else if(this.operationType=="stopUser"){
          var selectedMap=this.$refs.grid.selectedMap;
          var stopUserIds=new Array;
          for (var i in selectedMap) {
            if (selectedMap[i] != null) {
              stopUserIds.push(selectedMap[i]);
            }
          }
          this.$http.post("./restful/user/batchDisable",stopUserIds).then(
            (res)=>{
              console.log(res)
              if(res.body.status=="success"){
                this.tooltipType = "success";
                this.tooltipMessage = "停用成功!"
                this.showTooltip = true;
                this.search();
              }else{
                this.tooltipType = "failed";
                this.tooltipMessage = "停用失败!"
                this.showTooltip = true;
              }
            }
          )
        }else if(this.operationType == "startUser"){
          var selectedMap=this.$refs.grid.selectedMap;
          var startUserIds=new Array;
          for (var i in selectedMap) {
            if (selectedMap[i] != null) {
              startUserIds.push(selectedMap[i]);
            }
          }
          this.$http.post("./restful/user/batchEnable",startUserIds).then(
            (res)=>{
              if(res.body.status=="success"){
                this.tooltipType = "success";
                this.tooltipMessage = "启用成功!"
                this.showTooltip = true;
                this.search();
              }else{
                this.tooltipType = "failed";
                this.tooltipMessage = "启用失败!"
                this.showTooltip = true;
              }
            }
          )
        }
      },
      addUserRole(){
        //每次执行时从新赋值
        this.addUserRoleWindowConfig.gridConfigs.selectedIds=[];
        var userRoleItem=this.$refs.gridSec.rows
        for(var k in userRoleItem){
          this.addUserRoleWindowConfig.gridConfigs.selectedIds.push(userRoleItem[k].id);
        }
        this.addUserRoleWindowConfig.show=true;
        this.addUserRoleWindowConfig.form.userId=this.userRoleWindowConfig.gridConfigs.searchFields.id;
      },
      removeUserRole(item){
        this.dialogMessage = "确认需要移除" + item.name + "这个角色吗?";
        this.operationType = "removeUserRoleAn";
        this.operationItem = item;
        this.showDialog = true;
      },
      removeUserRoleBatch(){
        this.gridConfigs.getSelectedNames = [];
        this.addUserRoleWindowConfig.form.roleId = []
        var selectItems = this.$refs.gridSec.getSelectedItems();
        if (selectItems.length == 0) {
          this.tooltipType = "failed";
          this.tooltipMessage = "请先选择角色!"
          this.showTooltip = true;
          return;
        } else {
          for (var i in selectItems) {
            this.addUserRoleWindowConfig.form.roleId.push(selectItems[i].id)
            this.gridConfigs.getSelectedNames.push(selectItems[i].name)
          }
          this.dialogMessage = "确认要批量删除：" + this.gridConfigs.getSelectedNames + " 的角色吗?";
          this.operationType = "removeUserRoleBatch";
          this.showDialog = true;
        }
      },
      resetPassword(item){
        //重置密码
        this.setPasswordWindowConfig.show=true;
        this.setPasswordWindowConfig.title="重置密码-"+item.username;
        this.setPasswordWindowConfig.type="add"
        this.setPasswordWindowConfig.form.id=item.id;
      },
      //启用人员
      startUser(){
        var selectItems = this.$refs.grid.getSelectedItems();
        var startUserItem=new Array;
        if (selectItems.length == 0) {
          this.tooltipType = "failed";
          this.tooltipMessage = "请先选择用户!"
          this.showTooltip = true;
          return;
        } else {
          for (var i in selectItems) {
            startUserItem.push(selectItems[i].username)
          }
          this.dialogMessage = "确认要批量启用：" + startUserItem + " 的用户吗?";
          this.operationType = "startUser";
          this.showDialog = true;
        }
      },
      //禁用人员
      stopUser(){
        var selectItems = this.$refs.grid.getSelectedItems();
        var stopUserItem=new Array;
        if (selectItems.length == 0) {
          this.tooltipType = "failed";
          this.tooltipMessage = "请先选择用户!"
          this.showTooltip = true;
          return;
        } else {
          for (var i in selectItems) {
            stopUserItem.push(selectItems[i].username)
          }
          this.dialogMessage = "确认要批量停用：" + stopUserItem + " 的用户吗?";
          this.operationType = "stopUser";
          this.showDialog = true;
        }
      },
      tooltipClosed(){
        this.showTooltip = false;
      },
      selected(id, title){
        //点击请求机构下面存在的用户数据
        this.directUserWindowConfig.gridConfigs.searchFields.id = id;
        //将当前页重置为第一页
        this.$refs.gridFour.currPageNum = 1;
        this.$refs.gridFour.search();
      },
      directSelected(row){
        this.userWindowConfig.form.directManagerId=row.id;
        this.directUserWindowConfig.directName=row.username
      }
    },
    components: {
      grid: grid,
      MyDialog: MyDialog,
      MyTooltip: MyTooltip,
      MyWindow: MyWindow,
      TreeSelect: TreeSelect,
      Tree:Tree
    }
  }
</script>

<style scoped>
  .icon-account:before {
    font-family: 'iconfont';
    content: "\EBF6";
  }

  .form-field {
    width: 450px;
  }
  .form-field-direct{
    border-radius: 4px;
    height: 34px;
    width: 450px;
    padding-left: 6px;
    display: inline-block;
    border: 1px solid #a9a9a9;
  }
  .form-field-direct:hover{
    border: 1px solid #5cadff;
  }
  .form-field-directBtn{
    position: absolute;
    left: 594px;
    top: 103px;
    height: 34px;
    border-radius: 4px;
    background: #13CE66;
    color: #fff;
  }
</style>

