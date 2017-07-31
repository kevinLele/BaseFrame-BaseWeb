var CpUser = {};

CpUser.login = function () {
  var _username = $(".loginName").val().replace(/\s/g, '');
  var _pwd = $(".loginPsw").val().replace(/\s/g, '');

  CpUser.userName = _username;
  CpUser.password = _pwd;

  if (CpUser.loginValidate()) {
    var params = {};
    params.loginName = CpUser.userName.replace(/\s/g, '');
    params.password = CpUser.password.replace(/\s/g, '');

    $.ajax({
      type: "post",
      url: "./restful/user/login",
      contentType: 'application/json',
      dataType: "json",
      //	data:params,
      data: JSON.stringify(params),
      success: function (data) {
        if ("success" == data.status) {
          window.location.href="index.html";
        } else if ("fail" == data.status) {
          $(".errorMsg").text(data.message);
        }
      },
      error: function (err) {
        console.error(err);
      }
    });
  }
  return false;
};

CpUser.loginValidate = function () {
  if (this.userName == "" || this.password == "") {
    $(".loginName").focus();
    $(".errorMsg").text("请输入用户名或密码");
    return false;
  }

  return true;
};

/*登陆时监测enter按键实现Tab按键效果*/
function enterKey() {
  if (event.keyCode == 13) {
    if ("" == $(".loginName").val()) {
      $(".loginName").focus()
    } else {
      if ("" == $(".loginPsw").val()) {
        $(".loginPsw").focus()
      } else {
        $(".loginBtn").click();
      }
    }
  }
}

function checkUser(username) {  //用户名验证

  $(".loginName").focus(function () {
    $(this).val("");
    $(".errorMsg").text("");
  });
  $(".loginName").blur(function () {
    var _username = $(".loginName").val();
    var reg = /^[a-zA-Z]+[a-zA-Z0-9]+$/;  //用户名只能由英文字母或数字组成(不支持中文、不能以数字开头)
    if (_username == "") {
      $(".errorMsg").text("请输入用户名");
    } else if (!reg.test(_username)) {
      $(".errorMsg").text("您输入的用户名格式不正确");
    }
    return false;
  });
};

function checkPsw() {           //密码验证
  $(".loginPsw").focus(function () {
    $(this).val("");
  });
  $(".loginPsw").blur(function () {
    var _pwd = $(".loginPsw").val();
    var reg = /^[0-9a-zA-Z]{6,20}$/;  //长度在6-20之间，由字母和数字组成
    if (_pwd == "") {
      $(".errorMsg").text("请输入密码");
    } else if (!reg.test(_pwd)) {
      $(".errorMsg").text("您输入的密码格式不正确");

    }else{
       $(".errorMsg").text("");
    }
    return false;
  });

}

$(function () {

  checkUser();
  checkPsw();

  $(".loginBtn").on("click", CpUser.login);

  $(".form").keydown(function () {
    enterKey();
  });
})



