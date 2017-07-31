<template>
    <div class="app-control">
        <div class="control-head manager-head">
            <div class="fl control-list-search" v-if="$permissionValid('projectApp:search')">
                <span>项目名称:</span>
                <input type="text" v-model="gridConfigs.searchFields.projectName"/>
                <span>状态:</span>
                <select>
                <option>有效</option>
                <option>无效</option>
                </select>
                <button type="button" @click="search">查询</button>
                <button type="button" @click="reset">重置</button>
            </div>
            <div class="fr control-list-modify">
                <button type="button" @click="addProject" v-if="$permissionValid('projectApp:add')">注册项目</button>
                <button type="button" @click="batchRemovePro" v-if="$permissionValid('projectApp:remove')">批量删除</button>
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
        <my-window v-if="proWindowConfig.show" :config="proWindowConfig">
      <!--弹框表单的样式为公用，-->
            <div class="content-body-form">
                <div v-if='this.proWindowConfig.type=="add"'>
                <label>APPID：</label>
                <input type="text" class="form-field" v-model="proWindowConfig.form.appId"
                	@keyup="isExist('appId',proWindowConfig.form.appId)"
                    :readonly="proWindowConfig.readonly"/>
                    <span v-if="proWindowConfig.proAppIdFlag" class="red">&nbsp;已存在</span>
                </div>
                <div v-if='this.proWindowConfig.type=="add"'>
                <label>项目名称：</label>
                <input type="text" class="form-field" v-model="proWindowConfig.form.projectName"
                	@keyup="isExist('projectName',proWindowConfig.form.projectName)"
                    :readonly="proWindowConfig.readonly"/>
                    <span v-if="proWindowConfig.projectNameFlag" class="red">&nbsp;已存在</span>
                </div>
                <div v-if='this.proWindowConfig.type !="add"'>
                <label>APPID：</label>
                <input type="text" class="form-field" v-model="proWindowConfig.form.appId"
                	@keyup="appExistModify()"
                    :readonly="proWindowConfig.readonly"/>
                    <span v-if="proWindowConfig.proAppIdFlag" class="red">&nbsp;已存在</span>
                </div>
                <div v-if='this.proWindowConfig.type !="add"'>
                <label>项目名称：</label>
                <input type="text" class="form-field" v-model="proWindowConfig.form.projectName"
                	@keyup="proExistModify()"
                    :readonly="proWindowConfig.readonly"/>
                    <span v-if="proWindowConfig.projectNameFlag" class="red">&nbsp;已存在</span>
                </div>
                <div>
                <label>项目负责人：</label>
                <input type="text" class="form-field" v-model="proWindowConfig.form.projectManager"
                    :readonly="proWindowConfig.readonly"/>
                </div>
                <div>
                <label>联系电话：</label>
                <input type="text" class="form-field" v-model="proWindowConfig.form.contactNumber"
                    :readonly="proWindowConfig.readonly"/>
                </div>
                <div>
                <label>联系邮箱：</label>
                <input type="text" class="form-field" v-model="proWindowConfig.form.email"
                    :readonly="proWindowConfig.readonly"/>
                </div>
                <div>
                <label>项目说明：</label>
                    <textarea class="form-field" style="width: 450px;height: 150px;resize: none;"
                        v-model="proWindowConfig.form.projectDescription"
                        :readonly="proWindowConfig.readonly"></textarea>
                </div>
            </div>
        </my-window>
        <!--项目对应下的app-->
        <my-window v-if="proAppWindowConfig.show" :config="proAppWindowConfig">
            <div class="control-head manager-head" style="background:#eff1f5;border:1px solid #aaaaaa;border-bottom: 0px;">
                <div class="fl control-list-search">
                    <span>APP名称:</span>
                    <input type="text" v-model="proAppWindowConfig.gridConfigs.searchFields.appName"/>
                    <span>状态:</span>
                    <select>
                    <option>有效</option>
                    <option>无效</option>
                    </select>
                    <button type="button" @click="searchSec">查询</button>
                    <button type="button" @click="resetSec">重置</button>
                </div>
                <div class="fr control-list-modify">
                    <button type="button" @click="addProjectApp">注册App</button>
                </div>
            </div>
            <grid :config="proAppWindowConfig.gridConfigs" ref="gridSec" class="gridSec"></grid>
        </my-window>

        <!--新增app弹窗-->
        <my-window v-if="proAppWindowConfig.appWindowConfig.show" :config="proAppWindowConfig.appWindowConfig" class="appWindowUploader">
            <div class="content-body-form">
                <form method="post" enctype="multipart/form-data" class="appForm" name="appForm">
                <div>
                <label>选择文件：</label>
                    <input type="file"  class="form-field" @blur="appChange" name="appFile"/>
                </div>
                <div>
                <label>所属项目：</label>
                    <input type="text"class="form-field" v-model="proAppWindowConfig.appWindowConfig.form.projectId" name="projectId"
                    :readonly="proAppWindowConfig.appWindowConfig.readonly"/>
                </div>
                <div>
                <label>APP名称：</label>
                    <input type="text"class="form-field" v-model="proAppWindowConfig.appWindowConfig.form.appName" name="appName"
                    :readonly="proAppWindowConfig.appWindowConfig.readonly"/>
                </div>
                <div>
                <label>APP版本号：</label>
                    <input type="text"class="form-field" v-model="proAppWindowConfig.appWindowConfig.form.appVersion" name="appVersion"/>
                </div>
                <div>
                <label>APP大小：</label>
                    <input type="text"class="form-field" v-model="proAppWindowConfig.appWindowConfig.form.appSize" name="appSize"
                    :readonly="proAppWindowConfig.appWindowConfig.readonly"/>
                </div>
                <div>
                <label>下载地址：</label>
                    <input type="text"class="form-field" v-model="proAppWindowConfig.appWindowConfig.form.appUrl" name="appUrl"/>
                </div>
                <div>
                <label style="width:150px">是否需要强制更新：</label>
                    <select>
                        <option>是</option>
                        <option>否</option>
                    </select>
                </div>
                <div>
                <label>更新说明：</label>
                    <textarea class="form-field" style="width: 450px;height: 150px;resize: none;" v-model="proAppWindowConfig.appWindowConfig.form.appUpdateDescription" name="appUpdateDescription"></textarea>
                </div>
                <button @click="uploader" class="uploaderApp">注册</button>
                </form>
            </div>
        </my-window>
    </div>
</template>

<script>
  import grid from "./common/grid.vue"
  import MyWindow from "./common/Window.vue"
  import MyDialog from "./common/Dialog.vue"
  import MyTooltip from "./common/OperationStatusTooltip.vue"
    export default {
        data(){
            return{
            	proValidApi: "./restful/projectinformation/getByWhere",
            	proModifyApi: "./restful/projectinformation/checkByWhere",
                showDialog: false,
                dialogMessage: "",
                showTooltip: false,
                tooltipType: "",
                tooltipMessage: "",
                gridConfigs: {
                    searchFields: {
                       projectName:""
                    },
                    operations: [{
                        title: "删除",
                        icon: "&#xe9ac;",
                        permission: "projectApp:remove",
                        func: this.removeProject
                    }, {
                        title: "编辑",
                        icon: "&#xe908",
                        permission: "projectApp:modify",
                        func: this.modifyProject
                    },{
                        title:"查看项目",
                        icon:"&#xe9ce",
                        func:this.viewProject
                    }, {
                        title: "查看App",
                        icon: "&#xe92e",
                        func: this.viewProjectApp
                    }],
                    operationType: "",
                    operationItem: {},
                    getSelectedNames:[],
                    getSelectedIds:[],
                    fields: [
                        {
                        title: "项目名称",
                        field: "projectName",
                        style: {
                            width: "9%",
                            float: "left",
                            textAlign: "center"
                        }
                        },

                        {
                        title: "项目负责人",
                        field: "projectManager",
                        style: {
                            width: "9%",
                            float: "right",
                            textAlign: "center"
                        }
                        },
                        {
                        title: "邮箱",
                        field: "email",
                        style: {
                            width: "11%",
                            float: "right",
                            textAlign: "center"
                        }
                        },
                        {
                        title: "电话",
                        field: "contactNumber",
                        style: {
                            width: "11%",
                            float: "right",
                            textAlign: "center"
                        }
                        },
                        {
                        title: "项目创建日期",
                        field: "createDate",
                        isSortField: true,
                        orderBy:"createDate",
                        style: {
                            float: "right",
                            width: "14%",
                            textAlign: "center"
                        }
                        },
                        {
                        title: "项目描述",
                        field: "projectDescription",
                        style: {
                            textAlign: "center"
                        }
                        },
                    ],
                    currPageNum: 1,
                    totalPageNum: 1,
                    pageSize: 10,
                    api: "./restful/projectinformation/getPage"
                },
                proWindowConfig:{
                    type: "",
                    readonly: false,
                    parent: this,
                    show: false,
                    title: "",
                    height: "500px",
                    width: "800px",
                    defaultParentOrgId: "",
                    proAppIdFlag: false,
                    projectNameFlag: false,
                    form: {
                        appId: "",
                        projectName:"",
                        projectDescription:"",
                        id:"",
                        projectManager:"",
                        contactNumber:"",
                        email:"",
                    },
                    method: {
                        close(){
                        this.proWindowConfig.show = false;
                        },
                        confirm(){
                        if( this.proWindowConfig.proAppIdFlag == false && this.proWindowConfig.projectNameFlag == false){	
	                        if(this.proWindowConfig.type=="add"){
	                            this.$http.post("./restful/projectinformation/insertProjectInformation", this.proWindowConfig.form).then(
	                            (res) => {
	                                //新增完按创建时间降序排序，方便查看最新增加的信息
	                                if(res.body.status=="success"){
	                                for (var idx in this.gridConfigs.fields) {
	                                    var field = this.gridConfigs.fields[idx]
	
	                                    if (field.field == "createdate") {
	                                    field.sortType = "desc"
	                                    } else {
	                                    field.sortType = "";
	                                    }
	                                }
	                                this.search();
	                                this.tooltipType = "success";
	                                this.tooltipMessage = "新增项目成功!"
	                                this.showTooltip = true;
	                                this.proWindowConfig.show = false;
	                                }else{
	                                this.tooltipType = "failed";
	                                this.tooltipMessage = res.body.message
	                                this.showTooltip = true;
	                                }
	                            },
	                            (res)=>{
	                                this.tooltipType = "failed";
	                                this.tooltipMessage = "新增项目失败!"
	                                this.showTooltip = true;
	                            }
	                            )
	                        }else if(this.proWindowConfig.type == "modify"){
	                            this.$http.post("./restful/projectinformation/update", this.proWindowConfig.form).then(
	                            (res) => {
	                                this.proWindowConfig.show = false;
	                                //新增完按创建时间降序排序，方便查看最新增加的信息
	                                if(res.body.status=="success"){
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
	                                }else{
	                                this.tooltipType = "failed";
	                                this.tooltipMessage = res.body.message
	                                this.showTooltip = true;
	                                }
	                            },
	                            (res)=>{
	                                this.tooltipType = "failed";
	                                this.tooltipMessage = "修改失败!"
	                                this.showTooltip = true;
	                            }
	                            )
	                        }
                        }else if(this.proWindowConfig.proAppIdFlag == true || this.proWindowConfig.projectNameFlag == true){
                        	this.tooltipType = "failed";
	                        this.tooltipMessage = "请先修改已存在的字符!"
	                        this.showTooltip = true;
                        }
                        },
                        cancel(){
                        this.proWindowConfig.show = false;
                        }
                    }
                },
                proAppWindowConfig:{
                    type: "",
                    readonly: false,
                    parent: this,
                    show: false,
                    title: "",
                    height: "650px",
                    width: "1000px",
                    method:{
                        close(){
                            this.proAppWindowConfig.show=false;
                        }
                    },
                    gridConfigs:{
                        searchFields:{
                            appName:""
                        },
                        hasCheckbox:false,
                        operations: [{
                            title: "删除",
                            icon: "&#xe9ac;",
                            func: this.removeProjectApp
                        }],
                        operationType: "",
                        operationItem: {},
                        getSelectedNames:[],
                        getSelectedIds:[],
                        fields: [
                            {
                            title: "app名称",
                            field: "appName",
                            style: {
                                width: "100px",
                                float: "left",
                                textAlign: "center"
                            }
                            },
                            {
                            title: "app版本号",
                            field: "appVersion",
                            style: {
                                float: "left",
                                width: "180px",
                                textAlign: "center"
                            }
                            },
                            {
                            title: "更新时间",
                            field: "appCreateDate",
                            isSortField: true,
                            style: {
                                float: "right",
                                width: "180px",
                                textAlign: "center"
                            }
                            },
                            {
                            title: "更新说明",
                            field: "appUpdateDescription",
                            isSortField: true,
                            style: {
                                float: "right",
                                width: "300px",
                                textAlign: "center"
                            }
                            },
                        ],
                        currPageNum: 1,
                        totalPageNum: 1,
                        pageSize: 10,
                        api: "./restful/appinformation/getPageByProjectId",
                        maskByParent: true
                    },
                    appWindowConfig:{
                        type: "",
                        readonly: true,
                        parent: this,
                        show: false,
                        title: "",
                        height: "600px",
                        width: "800px",
                        form:{
                            appName:"",
                            projectId:"",
                            appVersion:"",
                            appSize:"",
                            appUrl:"",
                            forcedUpdate:0,
                            appUpdateDescription:""
                        },
                        method:{
                            close(){
                                this.proAppWindowConfig.appWindowConfig.show=false;
                            },
                            cancel(){
                                this.proAppWindowConfig.appWindowConfig.show = false;
                            },
                            confirm(){
                                    //传统form提交，但是无法控制页面跳转
                                    //$(".appForm").submit()
                            }
                        }
                    }
                }
            }
        },
        methods:{
 
	      isExist(vkey,value) {
	    		var param = new Object();
	    		param[vkey] = value;
		    		if(value != ""){
		          this.$http.post(this.proValidApi , param).then(
		            (res) => {	            	
		            	if (res.body.status == "success") {
		            		if( vkey == 'appId'){
		
		            			this.proWindowConfig.proAppIdFlag = true;
		            		}else if(vkey == 'projectName'){
		            			this.proWindowConfig.projectNameFlag = true;
		            		}
		            	}else{
		            		if( vkey == 'appId'){
		
		            			this.proWindowConfig.proAppIdFlag = false;
		            		}else if(vkey == 'projectName'){
		            			this.proWindowConfig.projectNameFlag = false;
		            		}
		            	}
		
		          })
		
		        }else if( vkey == 'appId' &&  value == ""){
		        	this.proWindowConfig.proAppIdFlag = false;
		        }else if( vkey == 'projectName' &&  value == "" ){
		        	this.proWindowConfig.projectNameFlag = false;
		        }
		    },
		    appExistModify(){
		      	var modifyApp={
		    		'appId': this.proWindowConfig.form.appId,
		    		'id': this.proWindowConfig.form.id
		    		};   		
			      this.$http.post(this.proModifyApi , modifyApp).then(
			            (res) => {
			            	if (res.body.status == "success") {	            		
			            			this.proWindowConfig.proAppIdFlag = true;
			            	}else{	            			
			            			this.proWindowConfig.proAppIdFlag = false;           
			            	}
			            })
		      },
		      proExistModify(){
		      	var modifyPro={
		    		'projectName': this.proWindowConfig.form.projectName,
		    		'id': this.proWindowConfig.form.id
		    		};
		    		this.$http.post(this.proModifyApi , modifyPro).then(
			            (res) => {
			            	if (res.body.status == "success") {
			            		this.proWindowConfig.projectNameFlag = true;
			            	}else{
			            		this.proWindowConfig.projectNameFlag = false;
			            	}
			      })
		      },
            dialogCancel(){
                //对值进行重置,不然不会触发change事件
                this.showDialog = false;
            },
            tooltipClosed(){
                this.showTooltip = false;
            },
            addProject(){
                //新增时清空数据
                this.proWindowConfig.form = {
                    appId: "",
                    projectName:"",
                    projectDescription:"",
                    id:"",
                    projectManager:"",
                    contactNumber:"",
                    email:""
                }
                this.proWindowConfig.show = true;
                this.proWindowConfig.title = "注册项目";
                this.proWindowConfig.readonly = false;
                this.proWindowConfig.type="add";
                this.proWindowConfig.proAppIdFlag = false;
                this.proWindowConfig.projectNameFlag = false;
            },
            modifyProject: function (item) {
                this.$http.get('restful/projectinformation/getById?id='+item.id).then(
                (res) => {
                    var proInfo = res.body.content;
                    this.proWindowConfig.form = {
                        appId: proInfo.appId,
                        projectName: proInfo.projectName,
                        projectDescription: proInfo.projectDescription,
                        id:proInfo.id,
                        projectManager:proInfo.projectManager,
                        contactNumber:proInfo.contactNumber,
                        email:proInfo.email
                    }
                    this.proWindowConfig.type = "modify";
                    this.proWindowConfig.readonly = false;
                    this.proWindowConfig.title = "项目修改"
                    this.proWindowConfig.show = true;
                }
                )
                this.proWindowConfig.proAppIdFlag = false;
                this.proWindowConfig.projectNameFlag = false;
            },
            viewProject(item){
                this.$http.get("./restful/projectinformation/getById?id=" + item.id).then(
                (res) => {
                    var proInfo = res.body.content;
                    this.proWindowConfig.form = {
                        appId: proInfo.appId,
                        projectName: proInfo.projectName,
                        projectDescription: proInfo.projectDescription,
                        id:proInfo.id,
                        projectManager:proInfo.projectManager,
                        contactNumber:proInfo.contactNumber,
                        email:proInfo.email
                    }

                    this.proWindowConfig.type = "view";
                    this.proWindowConfig.readonly = true;
                    this.proWindowConfig.title = "应用查看（只读）"
                    this.proWindowConfig.show = true;
                }
                )
                this.proWindowConfig.proAppIdFlag = false;
                this.proWindowConfig.projectNameFlag = false;
            },
            viewProjectApp(item){
                this.proAppWindowConfig.show="true";
                this.proAppWindowConfig.title = "查看项目-"+item.projectName;
                this.proAppWindowConfig.gridConfigs.searchFields.projectId=item.id;
            },
            search(){
                //条件查询时必须将当前页重置为1
                this.$refs.grid.resetCurrentPageNum();
                this.$refs.grid.search();
            },
            searchSec(){
                this.$refs.gridSec.resetCurrentPageNum();
                this.$refs.gridSec.search();
            },
            reset(){
                this.gridConfigs.searchFields.projectName = "";
                this.search();
            },
            resetSec(){
                this.proAppWindowConfig.gridConfigs.searchFields.appName="";
                this.searchSec();
            },
            removeProject: function (item) {
                this.dialogMessage = "确认需要删除ID为" + item.appId + "的项目吗?";
                this.operationType = "removeProject";
                this.operationItem = item;
                this.showDialog = true;
            },
            batchRemovePro: function () {
                this.gridConfigs.getSelectedNames = [];
                this.gridConfigs.getSelectedIds = [];
                var selectItems = this.$refs.grid.getSelectedItems();
                if (selectItems.length == 0) {
                this.tooltipType = "failed";
                this.tooltipMessage = "请先选择应用!"
                this.showTooltip = true;
                return;
                } else {
                for (var i in selectItems) {
                    this.gridConfigs.getSelectedIds.push(selectItems[i].appId)
                    this.gridConfigs.getSelectedNames.push(selectItems[i].projectName)
                }
                this.dialogMessage = "确认要批量删除：" + this.gridConfigs.getSelectedNames + " 的应用吗?";
                this.operationType = "removeProBatch";
                this.showDialog = true;
                }
            },
            dialogConfirm(){
                this.showDialog = false;
                if (this.operationType == "removeProject") {
                this.$http.get("./restful/projectinformation/deleteProjectinformationById?appId="+this.operationItem.appId).then(
                    (res)=>{
                    this.tooltipType = "success";
                    this.tooltipMessage = "删除成功!"
                    this.showTooltip = true;
                    this.search();
                    },
                    (res)=>{
                    this.tooltipType = "failed";
                    this.tooltipMessage = "删除失败!"
                    this.showTooltip = true;
                    }
                )
            }else if(this.operationType == "removeProBatch"){
                this.$http.post("./restful/projectinformation/batchDelete",this.gridConfigs.getSelectedIds).then(
                    (res)=>{
                    this.tooltipType = "success";
                    this.tooltipMessage = "批量删除成功!"
                    this.showTooltip = true;
                    this.search();
                    this.gridConfigs.getSelectedIds=[]
                    },
                    (res)=>{
                    this.tooltipType = "failed";
                    this.tooltipMessage = "批量删除失败!"
                    this.showTooltip = true;
                    //失败清空记录
                    this.gridConfigs.getSelectedIds=[]
                    }
                )
                }else if(this.operationType == "removeProjectApp"){
                    this.$http.get("./restful/appinformation/deleteAppinformationById?id="+this.operationItem.id).then(
                        (res)=>{
                        this.tooltipType = "success";
                        this.tooltipMessage = "删除成功!"
                        this.showTooltip = true;
                        this.searchSec();
                        },
                        (res)=>{
                        this.tooltipType = "failed";
                        this.tooltipMessage = "删除失败!"
                        this.showTooltip = true;
                        }
                    )
                }
            },
            addProjectApp(){
                this.proAppWindowConfig.appWindowConfig.show="true"
                this.proAppWindowConfig.appWindowConfig.type="uploader"
                this.proAppWindowConfig.appWindowConfig.form.projectId=this.proAppWindowConfig.gridConfigs.searchFields.projectId;
                $(".appWindowUploader").css({"display":"block"});
            },
            appChange(e){
                //console.log(e)
                var that=e.target.files[0]
                if(e.target.files.length < 1){
                    this.proAppWindowConfig.appWindowConfig.form.appName="";
                    this.proAppWindowConfig.appWindowConfig.form.appSize="";
                }else{
                    this.proAppWindowConfig.appWindowConfig.form.appName=that.name;
                    this.proAppWindowConfig.appWindowConfig.form.appSize=that.size;
                }
            },
            removeProjectApp(item){
                this.dialogMessage = "确认需要删除名为" + item.appName + "的APP吗?";
                this.operationType = "removeProjectApp";
                this.operationItem = item;
                this.showDialog = true;
            },
            uploader(){
                var that=this;
                this.proAppWindowConfig.appWindowConfig.show="false";
                var form = document.forms.namedItem("appForm");
                form.addEventListener('submit', function(ev) {
                    var data = new FormData(form);
                    var req = new XMLHttpRequest();
                    req.open("POST", "./restful/appinformation/fileUploader", true);
                    req.onload = function(oEvent) {
                        if (req.status == 200&&req.readyState==4) {
                        // console.log(that)
                        // console.log(req)
                        if(JSON.parse(req.responseText).status=="success"){
                            that.tooltipType = "success";
                            that.tooltipMessage = "上传成功!"
                            that.showTooltip = true;
                            that.searchSec();
                        }else{
                            that.tooltipType = "failed";
                            that.tooltipMessage = "上传失败!"
                            that.showTooltip = true;
                        }
                        } else {
                            console.log("请求失败")
                        }
                    };
                    ev.preventDefault();
                    req.send(data);
                    //this.proAppWindowConfig.appWindowConfig.show="false";无法控制盒子显隐，
                    //不得不调用jq
                    $(".appWindowUploader").hide();

                }, false);
                this.searchSec();

            }
        },
        components:{
            grid: grid,
            MyWindow: MyWindow,
            MyDialog: MyDialog,
            MyTooltip: MyTooltip,
        }
    }
</script>

<style scoped>

  .icon-account:before {
    font-family: 'iconfont';
    content: "\EBF6";
  }
  .form-field{
    width: 450px;
  }
  /*.form-field-st{
    width: 450px;
    border-radius: 4px;
    border: 1px solid;
    border-color: #a9a9a9;
    position: absolute;
    left: 106px;
    top: 46px;
  }*/
  .uploaderApp{
    width: 60px;
    /* height: 31px; */
    height: 27px;
    padding: 0 12px;
    background: #13CE66;
    color: #fff;
    border-radius: 4px;
    float: right;
    margin-right: 12px;
    letter-spacing: 2px;
    position: absolute;
    left: 650px;
    top: 565px;
  }
  /*input[type="file"]{
    opacity:0;
  } */
  .gridSec {
    background: #fcfcfc;
    min-height: 490px;
    border: 1px solid #aaaaaa;
  }
</style>
