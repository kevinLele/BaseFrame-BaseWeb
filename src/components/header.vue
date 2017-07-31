<template>
  <div class="header">
    <div class="wrap">
      <div class="iconArea">
        <div>
          <span>&#xea60;</span>
          <span style="margin-left:10px;">认证中心</span>
        </div>
      </div>
      <div class="headerBody">
        <span class="exit" title="退出" @click="exit()"></span>
        <span>&#xe90c</span>
        <span>&#xeca8;</span>
        <span>&#xebdf;</span>
        <span>&#xeb6e;</span>
        <span class="user-info" @click="showUser">{{userWindowConfig.form.username}}</span>
        <span class="header_zoomButton" @click="headerZoom()"></span>
      </div>
    </div>

    <my-dialog v-if="showDialog" :message="dialogMessage"
               @dialogCancel="dialogCancel" @dialogConfirm="dialogConfirm"></my-dialog>
    <my-window v-if="userWindowConfig.show" :config="userWindowConfig">
      <!--弹框表单的样式为公用，-->
      <div class="content-body-form">
        <div>
          <label>ID：</label>
          <input readonly v-model="userWindowConfig.form.id" type="text"/>
        </div>
        <div>
          <label>账号：</label>
          <input readonly v-model="userWindowConfig.form.loginName" type="text"/>
        </div>
        <div>
          <label>姓名：</label>
          <input readonly v-model="userWindowConfig.form.username" type="text"/>
        </div>
        <div>
          <label>工号：</label>
          <input readonly v-model="userWindowConfig.form.jobNum" type="text"/>
        </div>
        <div>
          <label>电话：</label>
          <input readonly v-model="userWindowConfig.form.phone" type="text"/>
        </div>
        <div>
          <label>邮箱：</label>
          <input readonly v-model="userWindowConfig.form.email" type="text"/>
        </div>
      </div>
    </my-window>
  </div>
</template>

<script>
  import MyDialog from "./common/Dialog.vue"
  import MyWindow from "./common/Window.vue"

  export default {
    data(){
      return {
        showDialog: false,
        dialogMessage: "",
        scaleFlag: false,
        userWindowConfig: {
          type: "view",
          parent: this,
          show: false,
          title: "用户信息",
          height: "400px",
          width: "560px",
          form: {
            loginName: "",
            id: "",
            username: "",
            jobNum: "",
            phone: "",
            email: ""
          },
          method: {
            close(){
              this.userWindowConfig.show = false;
            }
          }
        }
      }
    },
    components: {
      MyDialog: MyDialog,
      MyWindow: MyWindow
    },
    methods: {
      showUser(){
        this.userWindowConfig.show = true;
      },
      dialogConfirm(){
        this.$http.get("./restful/user/logout").then(
          (res) => {
            if ("success" == res.body.status) {
              window.location = "./login.html"
            }
          }
        )
      },
      dialogCancel(){
        this.showDialog = false;
      },
      headerZoom(){
        if (!this.scaleFlag) {
          $(".iconArea").animate({width: "50px"}, "fast");
          $(".menubar").animate({width: "50px"}, "fast");
        } else {
          $(".iconArea").animate({width: "14vw"}, "fast");
          $(".menubar").animate({width: "14vw"}, "fast");
        }
        this.scaleFlag = !this.scaleFlag;
      },
      exit(){
        this.showDialog = true;
        this.dialogMessage = "确定退出系统吗？";
      }
    },
    mounted(){
      this.$http.get("./restful/user/getCurrentUser").then(
        (res) => {
          var user = res.body.content;
          this.userWindowConfig.form.username = user.username;
          this.userWindowConfig.form.id = user.id;
          this.userWindowConfig.form.loginName = user.loginName;
          this.userWindowConfig.form.jobNum = user.jobNum;
          this.userWindowConfig.form.phone = user.phone;
          this.userWindowConfig.form.email = user.email;
        }
      )
    }
  }
</script>

<style scoped>
  .header {
    height: 60px;
    background-color: #dea726;
  }

  .wrap {
    display: table;
    table-layout: fixed;
    height: 100%;
    width: 100%;
  }

  .iconArea {
    width: 14vw;
    background-color: #ff6d6d;
    display: table-cell;
    height: 100%;
    background: #35baf6;
    font-size: 20px;
    color: #fff;
    padding-left: 15px;
    white-space: nowrap;
    overflow: hidden;
    vertical-align: middle;
  }

  .headerBody {
    background-color: #ffffff;
    display: table-cell;
    vertical-align: middle;
    color: #939393;
  }

  .headerBody span {
    font-size: 16pt;
    float: right;
    margin-right: 20px;
    cursor: pointer;
    padding: 5px;
  }

  span.header_zoomButton {
    float: left;
    margin-left: 10px;
    padding: 5px;
  }

  .header_zoomButton:before {
    content: '\e90d';
    font-size: 17pt;
  }

  .exit:before {
    content: "\e909";
  }

  span.user-info{
  	font-size: 10pt;
  	font-family: sans-serif;
    line-height: 14px;
  }

  .user-info:before{
    content: "\EA1D";
    font-family: 'iconfont';
    font-size: 16pt;
    position:relative;
    left: 0px;
    top:3px;
    
  }

  .headerBody span:hover{
    background-color: #f8f8f8;
  }
</style>
