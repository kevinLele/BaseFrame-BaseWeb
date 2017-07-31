<template>
  <div class="organization">
    <div class="manager-head">
      <div class="fl" >
        
      </div>
      <div class="fr org-list-modify">
      	<button type="button" @click="viewOrgManager">机构管理员</button>
        <button type="button" @click="addOrg" v-if="$permissionValid('org:add')">新增</button>
        <button type="button" @click="viewOrgUser">查看</button>
      </div>
    </div>
    <tree-grid ref="grid" @clickBtn="clickBtn" @selected="selectedOrg" :config="gridConfigs"></tree-grid>

    <!-- 用于编辑机构信息的window -->
    <my-window v-if="orgWindowConfig.show" :config="orgWindowConfig">
      <!--弹框表单的样式为公用，-->
      <div class="content-body-form">
        <div>
          <label>父机构：</label>
          <div>
            <tree-select :selectStyle="treeSelectConfig.selectStyle" :readonly="orgWindowConfig.readonly"
                         v-model="orgWindowConfig.form.parentId" :api="treeSelectConfig.api"></tree-select>
          </div>
        </div>
        <div v-if="orgWindowConfig.type=='add'">
          <label>机构名称：</label>
          <input :readonly="orgWindowConfig.readonly" class="form-field" v-model="orgWindowConfig.form.name"
                @blur="isExist('name',orgWindowConfig.form.name)" 
                type="text" /><span v-if="orgWindowConfig.orgNameFlag" class="red">&nbsp;已存在</span>
        </div>
        <div v-if="orgWindowConfig.type=='add'">
          <label>机构编码：</label>
          <input :readonly="orgWindowConfig.readonly" class="form-field"
                 v-model="orgWindowConfig.form.code" 
                 @blur="isExist('code',orgWindowConfig.form.code)" type="text"/>
                 <span v-if="orgWindowConfig.orgCodeFlag" class="red">&nbsp;已存在</span>
        </div>
        <div v-if="orgWindowConfig.type !='add'">
          <label>机构名称：</label>
          <input :readonly="orgWindowConfig.readonly" class="form-field" v-model="orgWindowConfig.form.name"
                @blur="nameExistModify()" 
                type="text" /><span v-if="orgWindowConfig.orgNameFlag" class="red">&nbsp;已存在</span>
        </div>
        <div v-if="orgWindowConfig.type !='add'">
          <label>机构编码：</label>
          <input :readonly="orgWindowConfig.readonly" class="form-field"
                 v-model="orgWindowConfig.form.code" 
                 @blur="codeExistModify()" type="text"/>
                 <span v-if="orgWindowConfig.orgCodeFlag" class="red">&nbsp;已存在</span>
        </div>
        <div>
          <label>联系人：</label>
          <input :readonly="orgWindowConfig.readonly" class="form-field"
                 v-model="orgWindowConfig.form.linkMan" type="text"/>
        </div>
        <div>
          <label>电话：</label>
          <input :readonly="orgWindowConfig.readonly" class="form-field"
                 v-model="orgWindowConfig.form.phone" type="text"/>
        </div>
        <div>
          <label>邮箱：</label>
          <input :readonly="orgWindowConfig.readonly" class="form-field"
                 v-model="orgWindowConfig.form.email" type="text"/>
        </div>
        <div>
          <label>通讯地址：</label>
          <input :readonly="orgWindowConfig.readonly" class="form-field"
                 v-model="orgWindowConfig.form.address" type="text"/>
        </div>
        <div>
          <label>机构描述：</label>
          <textarea :readonly="orgWindowConfig.readonly" class="form-field"
                    v-model="orgWindowConfig.form.description" style="width: 450px;height: 150px;resize: none;"></textarea>
        </div>
      </div>
    </my-window>

    <!-- 确认操作的提示框 -->
    <my-dialog v-if="dialogConfig.showDialog" :message="dialogConfig.dialogMessage"
               @dialogCancel="dialogCancel" @dialogConfirm="dialogConfirm"></my-dialog>

    <!--　用于显示信息的提示工具　-->
    <my-tooltip :show="tooltipConfig.showTooltip" :showType="tooltipConfig.tooltipType"
                :message="tooltipConfig.tooltipMessage"
                @tooltipClosed="tooltipClosed"></my-tooltip>

    <!--查看机构下面的用户-->
    <my-window v-if="orgUserWindowConfig.show" :config="orgUserWindowConfig">
      <div class="control-head manager-head" style="height:50px;width:100%;background-color:#eff1f5;padding: 12px 10px;border:1px solid #aaaaaa;border-bottom: 0px;">
        <div class="fl control-list-search">
          <span>用户名称:</span>
          <input type="text" v-model="orgUserWindowConfig.gridConfigs.searchFields.username" />
          <span>状态:</span>
          <select>
            <option>有效</option>
            <option>无效</option>
          </select>
          <button type="button" @click="searchUser">查询</button>
          <button type="button" @click="resetUser">重置</button>
        </div>
      </div>
      <div style="height:calc(100% - 50px);border:1px solid #aaaaaa;overflow: auto;">
        <grid :config="orgUserWindowConfig.gridConfigs" ref="gridThir" class="gridSec"></grid>
      </div> 
    </my-window>
    <!--查看机构下面的机构管理员-->
    <my-window v-if="orgManagerWindowConfig.show" :config="orgManagerWindowConfig">
      <div class="control-head manager-head" style="height:50px;width:100%;background-color:#eff1f5;padding: 12px 10px;border:1px solid #aaaaaa;border-bottom: 0px;">
        <div class="fl control-list-search">
          <span>用户名称:</span>
          <input type="text" v-model="orgManagerWindowConfig.gridConfigs.searchFields.username"/>
          <span>状态:</span>
          <select>
            <option>有效</option>
            <option>无效</option>
          </select>
          <button type="button" @click="searchOrg">查询</button>
          <button type="button" @click="resetOrg">重置</button>
        </div>
        <div class="fr org-list-modify">
        	<button type="button" @click="disableOrgManr">停用</button>
        <button type="button" @click="enableOrgManr">启用</button>
	        <button type="button" @click="addOrgManager">新增</button>
	        <button type="button" @click="batchRemoveOrg">批量删除</button>
	      </div>
      </div>
      <div style="height:calc(100% - 50px);border:1px solid #aaaaaa;overflow: auto;">
        <grid :config="orgManagerWindowConfig.gridConfigs" ref="gridManager" ></grid>
      </div> 
    </my-window>
    <!--角色成员-机构管理员下的 新增 弹框-->
    <my-window v-if="orgUserListWindowConfig.show" :config="orgUserListWindowConfig">
      <ul style="width:100%;height:100%;">
        <li style="float:left;width:30%;height:100%;border: 1px solid #aaaaaa;">
          <tree :api="orgUserListWindowConfig.treeApi"
                :field="field" :expandLevel="1" @selected="selectedManr"></tree>
        </li>
        <li style="width:70%;float:right;height:100%;padding-left:10px;">
          <div style="height:100%;border:1px solid #aaaaaa;overflow: auto;">
            <grid :config="orgUserListWindowConfig.gridConfigs" ref="gridSect"></grid>
          </div>
        </li>
      </ul>
    </my-window>
  </div>
</template>

<script>
  import TreeGrid from "./common/TreeGrid.vue"
  import MyDialog from "./common/Dialog.vue"
  import MyTooltip from "./common/OperationStatusTooltip.vue"
  import MyWindow from "./common/Window.vue"
  import Tree from "./common/Tree.vue"
  import TreeSelect from "./common/TreeSelect.vue"
  import grid from "./common/grid.vue"

  export default {
    data() {
      return {
        orgInfoApi: "./restful/caorg/getById?id=",
        orgValidApi:"./restful/caorg/getByWhere",
        orgModifyApi: "./restful/caorg/checkByWhere",
        field: "name",
        operationType: "",
        dialogConfig: {
          dialogMessage: "",
          showDialog: false
        },
        tooltipConfig: {
          tooltipType: "",
          tooltipMessage: "",
          showTooltip: false
        },
        treeSelectConfig: {
          api: "./restful/caorg/getAll",
          field: "name",
          selectStyle: {
            width: "450px",
            height: "32px",
            float: "left"
          }
        },
        gridConfigs: {
          api: "./restful/caorg/getAll",
          treeField: "name",
          treeFileTitle: "机构",
          hasCheckboxColumn: false,
          fieldColumnWidth: "900px",
          hasDeleteBtn: true,
          hasEditBtn: true,
          hasViewBtn: true,
          expandLevel: 1,
          searchFields:{
          	id:""
          },
          dataFields: [{
            field: "id",
            title: "ID",
            fieldStyle: {
              float: "left",
              width: "50px",
              textAlign: "center"
            }
          }, {
            field: "code",
            title: "编码",
            fieldStyle: {
              float: "left",
              width: "100px",
              textAlign: "center"
            }
          }, {
            field: "linkMan",
            title: "联系人",
            fieldStyle: {
              float: "left",
              width: "100px",
              textAlign: "center"
            }
          }, {
            field: "phone",
            title: "电话",
            fieldStyle: {
              float: "left",
              width: "100px",
              textAlign: "center"
            }
          }, {
            field: "email",
            title: "邮箱",
            fieldStyle: {
              float: "left",
              width: "150px",
              textAlign: "center"
            }
          }, {
            field: "issuer",
            title: "创建人",
            fieldStyle: {
              float: "left",
              width: "100px",
              textAlign: "center"
            }
          }, {
            field: "createDate",
            title: "创建时间",
            fieldStyle: {
              textAlign: "center"
            }
          }]
        },
        orgWindowConfig: {
          type: "", //add modify view 分别表示新增，修改以及查看
          readonly: false,
          parent: this,
          show: false,
          title: "",
          height: "600px",
          width: "800px",
          defaultParentOrgId: "",
          orgNameFlag:false,
          orgCodeFlag:false,
          form: {
          	
            parentId: "",
            name: "",
            code: "",
            linkMan: "",
            phone: "",
            email: "",
            address: "",
            description: "",
            issuer: "系统管理员"
          },
          method: {
            close(){
              this.orgWindowConfig.show = false;
            },           
            confirm(){
              var form = this.orgWindowConfig.form;
							if( this.orgWindowConfig.orgCodeFlag == false && this.orgWindowConfig.orgNameFlag == false){
	              if (this.orgWindowConfig.type == "add") {
	                //新增操作
	                this.$http.post("./restful/caorg/save", this.orgWindowConfig.form).then(
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
	                      this.tooltipConfig.tooltipType = "success";
	                      this.tooltipConfig.tooltipMessage = "新增机构成功!"
	                      this.tooltipConfig.showTooltip = true;
	                      this.orgWindowConfig.show = false;
	                      //将数据添加treegrid组件中实现刷新
	                      var org = {
	                        code: form.code,
	                        createDate: new Date(),
	                        email: form.email,
	                        id: res.body.content,
	                        issuer: "系统管理员",
	                        linkMan: form.linkMan,
	                        name: form.name,
	                        parentId: form.parentId,
	                        phone: form.phone,
	                        children: [],
	                        showChildren: false,
	                      }
	                      this.$refs.grid.addNode(org);
	                      this.orgWindowConfig.show = false;
	                    } else {
	                      this.tooltipConfig.tooltipType = "failed";
	                      this.tooltipConfig.tooltipMessage = res.body.message
	                      this.tooltipConfig.showTooltip = true;
	                    }
	                  },
	                  (res) => {
	                    this.tooltipConfig.tooltipType = "failed";
	                    this.tooltipConfig.tooltipMessage = "新增机构失败!";
	                    this.tooltipConfig.showTooltip = true;
	                  }
	                )
	              } else if (this.orgWindowConfig.type == "modify") {
	                //修改操作
	                var id = this.orgWindowConfig.defaultParentOrgId;
	                this.orgWindowConfig.form.id = this.orgWindowConfig.defaultParentOrgId;
	                this.$http.post("./restful/caorg/update", this.orgWindowConfig.form).then(
	                  (res) => {
	                    this.orgWindowConfig.show = false;
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
	                      this.tooltipConfig.tooltipType = "success";
	                      this.tooltipConfig.tooltipMessage = "修改机构成功!"
	                      this.tooltipConfig.showTooltip = true;
	                      //将数据修改treegrid组件中实现刷新
	                      this.$refs.grid.redactNode(form, id)
	                    } else {
	                      this.tooltipConfig.tooltipType = "failed";
	                      this.tooltipConfig.tooltipMessage = res.body.message
	                      this.tooltipConfig.showTooltip = true;
	                    }
	                  },
	                  (res) => {
	                    this.tooltipConfig.tooltipType = "failed";
	                    this.tooltipConfig.tooltipMessage = "修改机构失败!"
	                    this.tooltipConfig.showTooltip = true;
	                  }
	                )
	              }
              }else if(this.orgWindowConfig.orgCodeFlag == true || this.orgWindowConfig.orgNameFlag == true){
              		this.tooltipConfig.tooltipType = "failed";
                  this.tooltipConfig.tooltipMessage  = "请先修改已存在的字符!"
                  this.tooltipConfig.showTooltip = true;
              }
              //关闭编辑框
              //this.orgWindowConfig.show = false;
            },
            cancel(){
              this.orgWindowConfig.show = false;
            }
          }
        },
        orgUserWindowConfig:{
          show:false,
          type: "",
          readonly: false,
          parent: this,
          title: "",
          height: "600px",
          width: "1000px",
          method: {
            close(){
              this.orgUserWindowConfig.show = false;
            },
            cancel(){
              this.orgUserWindowConfig.show = false;
            }
          },
          gridConfigs: {
            hasCheckbox:false,
            searchFields: {
              loginName: "",
              username: "",
              id:null
            },
            operations: [],
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
                  width: "60px",
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
                  width: "100px",
                  float: "left",
                  textAlign: "center"
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
                title: "工号",
                field: "jobNum",
                style: {
                  float: "right",
                  width: "100px",
                  textAlign: "center"
                }
              },
              {
                title: "邮箱",
                field: "email",
                style: {
                  float: "right",
                  width: "180px",
                  textAlign: "center"
                }
              },
              {
                title: "电话",
                field: "phone",
                style: {
                  float: "right",
                  width: "100px",
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
              }, {
                title: "姓名",
                field: "username",
                isSortField: true,
                orderBy: "username",
                style: {
                  textAlign: "center",
                }
              }
            ],
            currPageNum: 1,
            totalPageNum: 1,
            pageSize: 10,
            api: "./restful/user/findUserByOrgId"
          },
        },
        orgManagerWindowConfig:{
          show:false,
					type: "",
          readonly: false,
          parent: this,
          title: "",
          height: "650px",
          width: "1160px",
          method: {
            close(){
              this.orgManagerWindowConfig.show = false;
            },
            cancel(){
              this.orgManagerWindowConfig.show = false;
            }
          },
          form:{
            userId:[],
            orgId:""
          },
          gridConfigs: {
            hasCheckbox:true,
            searchFields: {
              loginName: "",
              username: "",
              orgId:null
            },
						operations:[{
              title:"删除",
              icon:"&#xe9ac;",
              func:this.removeOrgManager
            }],
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
                  width: "50px",
                  float: "left",
                  textAlign: "center"
                }
              },
              {
	              title: "状态",
	              field: "caOrgManager.isLock",
	              isSortField: true,
	              style: {
	                width: "60px",
	                textAlign: "center",
	                float:"left"
	              }
	            },
              {
                title: "帐号",
                field: "loginName",
                style: {
                  width: "100px",
                  float: "left",
                  textAlign: "center"
                }
              },
              {
                title: "最后登陆时间",
                field: "lastLoginDate",
                isSortField: true,
                orderBy: "lastLoginDate",
                style: {
                  float: "right",
                  width: "100px",
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
                title: "邮箱",
                field: "email",
                style: {
                  float: "right",
                  width: "150px",
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
                  width: "150px",
                  textAlign: "center"
                }
              }, {
                title: "姓名",
                field: "username",
                sortType: "asc",
                isSortField: true,
                style: {
                  textAlign: "center",
                }
              }
              
            ],
            currPageNum: 1,
            totalPageNum: 1,
            pageSize: 10,
            api: "./restful/user/getPageOrgManager",
            searchedCallback(rows){
            for (var i in rows) {
              var row = rows[i];

              if (row.caOrgManager.isLock === 0) {
                row.caOrgManager.isLock = "正常"
              } else if (row.caOrgManager.isLock === 1) {
                row.caOrgManager.isLock = "已停用";
              } else {
                row.caOrgManager.isLock = "未定义状态";
              }
            }
          }
        },
       },
       orgUserListWindowConfig: {
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
              var orgId = this.orgManagerWindowConfig.gridConfigs.searchFields.orgId;
              var selectedMap = this.$refs.gridSect.selectedMap;
              var selectedIds = new Array();

              for (var i in selectedMap) {
                if (selectedMap[i] != null) {
                  selectedIds.push(selectedMap[i]);
                }
              }

              this.$http.post("./restful/caorg/saveOrgManager", {
                type: "byOrg",
                orgId: orgId,
                userId: selectedIds
              }).then(
                (res) => {
                  var datas = res.body.content;
                  if(datas == "true"){                  	
                    this.tooltipConfig.tooltipType = "success";
                    this.tooltipConfig.tooltipMessage = "添加成功!"
                    this.tooltipConfig.showTooltip = true;
										this.orgUserListWindowConfig.show = false;
                    this.$refs.gridManager.search();
                  } else {
                    this.tooltipConfig.tooltipType = "failed";
                    this.tooltipConfig.tooltipMessage = "添加失败!"
                    this.tooltipConfig.showTooltip = true;
                  }
                }
              )
            },
            cancel(){
              this.orgUserListWindowConfig.show = false;
            },
            close(){
              this.orgUserListWindowConfig.show = false;
            }
          }
        }
      }
    },
    methods: {
    	isExist(vkey,value) {
    		var param = new Object();
    		param[vkey] = value;
	    		if(value != ""){
	          this.$http.post(this.orgValidApi , param).then(
	            (res) => {	            	
	            	if (res.body.status == "success") {
	            		if( vkey == 'name'){
	
	            			this.orgWindowConfig.orgNameFlag = true;
	            		}else if(vkey == 'code'){
	            			this.orgWindowConfig.orgCodeFlag = true;
	            		}
	            	}else{
	            		if( vkey == 'name'){
	
	            			this.orgWindowConfig.orgNameFlag = false;
	            		}else if(vkey == 'code'){
	            			this.orgWindowConfig.orgCodeFlag = false;
	            		}
	            	}
	
	          })
	
	        }else if( vkey == 'name' &&  value == ""){
	        		this.orgWindowConfig.orgNameFlag = false;
	        }else if( vkey == 'code' &&  value == "" ){
	        		this.orgWindowConfig.orgCodeFlag = false;
	        }
	    },
      nameExistModify(){
      	var modifyName={
    			'name': this.orgWindowConfig.form.name,
    				'id': this.orgWindowConfig.defaultParentOrgId
    		};   		
	      this.$http.post(this.orgModifyApi , modifyName).then(
	            (res) => {
	            	if (res.body.status == "success") {	            		
	            			this.orgWindowConfig.orgNameFlag = true;
	            	}else{	            			
	            			this.orgWindowConfig.orgNameFlag = false;	            
	            	}
	            })
      },
      codeExistModify(){
      	var modifyCode={
    			'code': this.orgWindowConfig.form.code,
    				'id': this.orgWindowConfig.defaultParentOrgId
    		};
    		this.$http.post(this.orgModifyApi , modifyCode).then(
	            (res) => {
	            	if (res.body.status == "success") {
	            		this.orgWindowConfig.orgCodeFlag = true;
	            	}else{
	            		this.orgWindowConfig.orgCodeFlag = false;
	            	}
	      })
      },
      clickBtn: function (id, btnType) {
        this.selectedOrg(id);
        if (btnType == "remove") {
          this.$http.get("./restful/caorg/getAll").then(
            (res) => {
              let caOrg = res.body.content
              for (var i in caOrg) {
                if (caOrg[i].parentId == id) {
                  this.dialogConfig.showDialog = true;
                  this.dialogConfig.dialogMessage = "请删除其子机构后再删除该机构";
                  this.operationType = "removeChildOrg";
                  return;
                } else {
                  this.dialogConfig.dialogMessage = "确认需要删除ID为" + id + "的机构吗?";
                  this.dialogConfig.showDialog = true;
                  this.operationType = "removeOrg";
                  this.removeId = id;
                }
              }
            }
          )
        } else if (btnType == "edit") {
          this.$http.get(this.orgInfoApi + id).then(
            (res) => {
              var orgInfo = res.body.content;
              this.orgWindowConfig.form = {
                parentId: "" + orgInfo.parentId,
                name: orgInfo.name,
                code: orgInfo.code,
                linkMan: orgInfo.linkMan,
                phone: orgInfo.phone,
                email: orgInfo.email,
                address: orgInfo.address,
                description: orgInfo.description,
                issuer: orgInfo.issuer
              }

              this.orgWindowConfig.type = "modify";
              this.orgWindowConfig.readonly = false
              this.orgWindowConfig.title = "编辑机构"
              this.orgWindowConfig.show = true;
            }
          )
        } else if (btnType == "view") {
          this.$http.get(this.orgInfoApi + id).then(
            (res) => {
              var orgInfo = res.body.content;
              this.orgWindowConfig.form = {
                parentId: "" + orgInfo.parentId,
                name: orgInfo.name,
                code: orgInfo.code,
                linkMan: orgInfo.linkMan,
                phone: orgInfo.phone,
                email: orgInfo.email,
                address: orgInfo.address,
                description: orgInfo.description
              }

              this.orgWindowConfig.type = "view";
              this.orgWindowConfig.readonly = true;
              this.orgWindowConfig.title = "机构查看（只读）"
              this.orgWindowConfig.show = true;
            }
          )
        }
        this.orgWindowConfig.orgNameFlag = false;
        this.orgWindowConfig.orgCodeFlag = false;
      },
      dialogCancel(){
        //对值进行重置,不然不会触发change事件
        this.dialogConfig.showDialog = false;
      },
      dialogConfirm(){
        //对值进行重置,不然不会触发change事件
        this.dialogConfig.showDialog = false;

        if (this.operationType == "removeOrg") {
          this.$http.get("./restful/caorg/deleteById?id=" + this.removeId).then(
            (res) => {
              this.$refs.grid.removeNode(this.removeId);
              this.tooltipConfig.tooltipType = "success";
              this.tooltipConfig.tooltipMessage = "机构删除成功!"
              this.tooltipConfig.showTooltip = true;
            },
            (res) => {
              this.tooltipConfig.tooltipType = "failed";
              this.tooltipConfig.tooltipMessage = "机构删除失败!"
              this.tooltipConfig.showTooltip = true;
            }
          )
        } else if (this.operationType == "removeChildOrg") {
          this.dialogConfig.showDialog = false;
        } else if (this.operationType == "removeOrgManagerAn"){
        	var OrgManrItemId={
            orgId:this.orgManagerWindowConfig.gridConfigs.searchFields.orgId,
            userId:this.operationItem.id
          };
          this.$http.post("restful/caorg/deleteOrgManager",OrgManrItemId).then(
            (res) => {
              this.tooltipConfig.tooltipType = "success";
              this.tooltipConfig.tooltipMessage = "删除成功!"
              this.tooltipConfig.showTooltip = true;
              this.searchOrg();
            },
            (res) => {
              this.tooltipConfig.tooltipType = "failed";
              this.tooltipConfig.tooltipMessage = "删除失败!"
              this.tooltipConfig.showTooltip = true;
            }
          )
        }else if(this.operationType == "batchRemoveOrg"){
        	  this.orgManagerWindowConfig.form.orgId=this.orgManagerWindowConfig.gridConfigs.searchFields.orgId;
            this.$http.post("restful/caorg/batchDeleteOrgManager",this.orgManagerWindowConfig.form).then(
              (res) => {
              this.tooltipConfig.tooltipType = "success";
              this.tooltipConfig.tooltipMessage = "批量删除成功!"
              this.tooltipConfig.showTooltip = true;
              this.searchOrg();
              this.orgManagerWindowConfig.form.userId = []
            },
            (res) => {
              this.tooltipConfig.tooltipType = "failed";
              this.tooltipConfig.tooltipMessage = "批量删除失败!"
              this.tooltipConfig.showTooltip = true;
              this.orgManagerWindowConfig.form.userId = []
            }
            )
        }else if(this.operationType=="disableOrgManr"){
          var selectedMap=this.$refs.gridManager.selectedMap;
          var stopUserIds=[];    			
          var disableOrgManrItem={
            orgId:this.orgManagerWindowConfig.gridConfigs.searchFields.orgId,
            userId:stopUserIds
          };
          for (var i in selectedMap) {
            if (selectedMap[i] != null) {
              stopUserIds.push(selectedMap[i]);
            }
          }
          this.$http.post("./restful/caorg/batchDisableOrgManager",disableOrgManrItem).then(
            (res)=>{
              if(res.body.status=="success"){
                this.tooltipConfig.tooltipType = "success";
                this.tooltipConfig.tooltipMessage = "停用成功!"
                this.tooltipConfig.showTooltip = true;
								this.searchOrg();
              }else{
                this.tooltipConfig.tooltipType = "failed";
                this.tooltipConfig.tooltipMessage = "停用失败!"
                this.showTooltip = true;
              }
            }
          )
        }else if(this.operationType == "enableOrgManr"){
          var selectedMap=this.$refs.gridManager.selectedMap;
          var startUserIds=[];
          var enableOrgManrItem={
            orgId:this.orgManagerWindowConfig.gridConfigs.searchFields.orgId,
            userId:startUserIds
          };
          for (var i in selectedMap) {
            if (selectedMap[i] != null) {
              startUserIds.push(selectedMap[i]);
            }
          }
          this.$http.post("./restful/caorg/batchEnableOrgManager",enableOrgManrItem).then(
            (res)=>{
              if(res.body.status=="success"){
                this.tooltipConfig.tooltipType = "success";
                this.tooltipConfig.tooltipMessage = "启用成功!"
                this.tooltipConfig.showTooltip = true;
                this.searchOrg();
              }else{
                this.tooltipConfig.tooltipType = "failed";
                this.tooltipConfig.tooltipMessage = "启用失败!"
                this.tooltipConfig.showTooltip = true;
              }
            }
          )
        }
      },      
      searchUser(){
        //条件查询时必须将当前页重置为1
        this.$refs.gridThir.resetCurrentPageNum();
        this.$refs.gridThir.search();
      },
      searchOrg(){
        //条件查询时必须将当前页重置为1
        this.$refs.gridManager.resetCurrentPageNum();
        this.$refs.gridManager.search();
      }, 
      resetUser(){
      	this.orgUserWindowConfig.gridConfigs.searchFields.username=""
        this.searchUser();
      },
      resetOrg(){
      	this.orgManagerWindowConfig.gridConfigs.searchFields.username=""
        this.searchOrg();
      },
      selectedOrg: function (id) {
        this.orgWindowConfig.defaultParentOrgId = id;
      },
      removeOrgManager(item){
      	this.dialogConfig.dialogMessage = "确认需要移除" + item.username + "这个用户吗?";
        this.operationType = "removeOrgManagerAn";
        this.operationItem = item;
        this.dialogConfig.showDialog = true;
      },
      addOrg: function () {
        //新增时对各字段的值进行重置
        this.orgWindowConfig.form = {
          parentId: "",
          name: "",
          code: "",
          linkMan: "",
          phone: "",
          email: "",
          address: "",
          description: ""
        };

        this.orgWindowConfig.form.parentId = this.orgWindowConfig.defaultParentOrgId;
        this.orgWindowConfig.type = "add";
        this.orgWindowConfig.readonly = false;
        this.orgWindowConfig.show = true;
        this.orgWindowConfig.title = "新增机构";
        this.orgWindowConfig.orgNameFlag = false;
        this.orgWindowConfig.orgCodeFlag = false;
      },
      viewOrgUser(){ 
        this.orgUserWindowConfig.gridConfigs.searchFields.id=this.orgWindowConfig.defaultParentOrgId;
        if(this.orgUserWindowConfig.gridConfigs.searchFields.id==""){
          this.tooltipConfig.tooltipType = "failed";
          this.tooltipConfig.tooltipMessage = "请先选择机构!"
          this.tooltipConfig.showTooltip = true;
        }else{
          this.orgUserWindowConfig.show=true
        }
      },
      viewOrgManager(){
      	this.orgManagerWindowConfig.gridConfigs.searchFields.orgId=this.orgWindowConfig.defaultParentOrgId;
        if(this.orgManagerWindowConfig.gridConfigs.searchFields.orgId==""){
          this.tooltipConfig.tooltipType = "failed";
          this.tooltipConfig.tooltipMessage = "请先选择机构!"
          this.tooltipConfig.showTooltip = true;
        }else{
          this.orgManagerWindowConfig.show=true
        }
      },
      addOrgManager(){
      	this.$http.post("./restful/user/getAllOrgManagerByOrgId", {"orgId":this.orgManagerWindowConfig.gridConfigs.searchFields.orgId}).then(
          (res) => {
          	
            var datas = res.body.content;
            var sectArr = new Array();
            for (var i in datas) {
              var data = datas[i];
              sectArr.push(data.id);
            }
            this.orgUserListWindowConfig.gridConfigs.selectedIds = sectArr;
            this.orgUserListWindowConfig.show = true;
          }
        )
      },      
      batchRemoveOrg(){
        this.gridConfigs.getSelectedNames = [];
        this.orgManagerWindowConfig.form.userId = []
        var selectItems = this.$refs.gridManager.getSelectedItems();
        if (selectItems.length == 0) {
          this.tooltipConfig.tooltipType = "failed";
          this.tooltipConfig.tooltipMessage = "请先选择角色!"
          this.tooltipConfig.showTooltip = true;
          return;
        } else {
          for (var i in selectItems) {
            this.orgManagerWindowConfig.form.userId.push(selectItems[i].id)
            this.gridConfigs.getSelectedNames.push(selectItems[i].username)
          }
          this.dialogConfig.dialogMessage = "确认要批量删除：" + this.gridConfigs.getSelectedNames + " 的用户吗?";
          this.operationType = "batchRemoveOrg";
          this.dialogConfig.showDialog = true;
        }
      },
      disableOrgManr(){
      	var selectItems = this.$refs.gridManager.getSelectedItems();
        var disableOrgManrItem=new Array;
        if (selectItems.length == 0) {
          this.tooltipConfig.tooltipType = "failed";
          this.tooltipConfig.tooltipMessage = "请先选择用户!"
          this.tooltipConfig.showTooltip = true;
          return;
        } else {
          for (var i in selectItems) {
            disableOrgManrItem.push(selectItems[i].username)
          }
          this.dialogConfig.dialogMessage = "确认要批量停用：" + disableOrgManrItem + " 的用户吗?";
          this.operationType = "disableOrgManr";
          this.dialogConfig.showDialog = true;
        }
      },
      enableOrgManr(){
      	var selectItems = this.$refs.gridManager.getSelectedItems();
        var enableOrgManrItem=new Array;
        if (selectItems.length == 0) {
          this.tooltipConfig.tooltipType = "failed";
          this.tooltipConfig.tooltipMessage = "请先选择用户!"
          this.tooltipConfig.showTooltip = true;
          return;
        } else {
          for (var i in selectItems) {
            enableOrgManrItem.push(selectItems[i].username)
          }
          this.dialogConfig.dialogMessage = "确认要批量启用：" + enableOrgManrItem + " 的用户吗?";
          this.operationType = "enableOrgManr";
          this.dialogConfig.showDialog = true;
        }
      },
      selectedManr(id, title){
        //点击请求机构下面存在的用户数据
        this.orgManagerWindowConfig.gridConfigs.searchFields.id = id;
        //将当前页重置为第一页
        this.$refs.gridSect.currPageNum = 1;
        this.$refs.gridSect.search();
      },
      tooltipClosed: function () {
        this.tooltipConfig.showTooltip = false;
      }
    },
    mounted() {

    },
    components: {
      TreeGrid: TreeGrid,
      MyDialog: MyDialog,
      MyTooltip: MyTooltip,
      MyWindow: MyWindow,
      TreeSelect: TreeSelect,
      Tree: Tree,
      grid:grid
    }
  }
</script>

<style scoped>
  .form-field {
    width: 450px;
  }
</style>
