// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

//全局区
import Vue from 'vue';
import App from './App';
import router from './router';
import VueResource from "vue-resource";
import ElementUI from 'element-ui';

Vue.config.productionTip = false;  //用来关闭生产模式下给出的提示（关闭后控制台不会打印警告信息）

Vue.use(VueResource);
Vue.use(ElementUI);

Vue.http.interceptors.push((request, next) => {
  next((response) => {
    //用于判断响应结果为登陆页面，如果为登陆页面说明未进行登记或session超时
    if (response.bodyText.indexOf("<-LoginPage->") > 0) {
      //跳转到登陆页面
      window.location = "./login.html";
      return request.respondWith(response.body);
    }

    return response;
  });
});


/****自定义失去焦点时正则验证*******************************/
/*********用法如下****************************************/
/**<div v-focus zztype="phone">                    ******/
/**    <input type="text" v-model=aa >             ******/
/**    <span></span>                               ******/
/**</div>                                          ******/
/********************************************************/
Vue.directive('focus', {
  bind: function (el, binding) { // el是绑定指令的元素
    var value = binding.value; // 传递给指令的值
    el.wrong = function () { // 错误执行
      //value.methods.call(this, value);
      $(this).children("span").html("错误")
    };
    el.correct = function () { // 正确执行
      //value.methods.call(this, value);
      $(this).children("span").html("正确")
    };

    el.getElementsByTagName('input')[0].addEventListener('blur', function () {
      checkout(el.getElementsByTagName('input')[0].value);
    });
    el.getElementsByTagName('input')[0].addEventListener('focus', function () {
      el.getElementsByTagName('input')[0].value = "";
      $(this).next().html("")
    });
    var filter = /\w$/;//初始化为全字符
    if (el.attributes.zztype.nodeValue == "phone") {
      filter = /^1[358]\d{9}$/
    }
    if (el.attributes.zztype.nodeValue == "name") {
      filter = /^[\w|\d]{4,16}$/
    }
    if (el.attributes.zztype.nodeValue == "email") {
      filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
    }
    if (el.attributes.zztype.nodeValue == "password") {
      filter = /^[\w!@#$%^&*.]{6,16}$/
    }
    function checkout(value) {
      if (!filter.test(value)) {
        el.wrong()
      } else {
        el.correct()
      }
    }
  }
})

new Vue().$http.get("./restful/capermission/getCurrentUserPermissions").then(
  (res) => {
    var permissionList = res.body.content;
    var permissions = new Array();

    for (var i in permissionList) {
      permissions[permissionList[i]] = permissionList[i];
    }

    Vue.prototype.$permissionValid = function (code) {
      //不传入权限代码说明不需要验证，直接返回true
      if (code == null || code == "") {
        return true;
      }

      if (typeof permissions[code] != "undefined") {
        return true;
      } else {
        return false;
      }
    }

    new Vue({
      el: '#app',
      router,
      store,
      render: h => h(App),
      data: {
        Bus: new Vue()
      }
    })
  }
)
;


//样式区
import "./styles/base.css"
import "./styles/step.scss"
import "./styles/nav.scss"
import "./styles/header.scss"
import "./common/css/zTreeStyle/zTreeStyle.css"
import "./styles/organization.scss"
import "./styles/roleManager.scss"
import "./styles/user.scss"
import 'element-ui/lib/theme-default/index.css'

//js区
import "./common/js/jquery-layerDrag";
