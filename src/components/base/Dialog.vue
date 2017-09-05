<template>
  <mask-layer :show="showLayer">
    <div class="dialog-size">
      <div class="dialog dialog-size">
        <div class="dialog-title">提示</div>
        <div class="dialog-message">
          <span class="dialog-icon"></span>
          <span style="margin:auto;width:300px;">{{message}}</span>
        </div>
        <div class="dialog-toolbar">
          <button class="dialog_confirm" @click="confirm">确定</button>
          <button class="dialog_cancel" @click="cancel">取消</button>
        </div>
      </div>
    </div>
  </mask-layer>
</template>

<script>
  import MaskLayer from "./MaskLayer.vue"

  export default{
    props: {
      message: String
    },
    data(){
      return {
        showLayer: true,
        type: "alert"
      }
    },
    methods: {
      cancel(){
        this.showLayer = false;
        this.$emit("dialogCancel")
      },
      confirm(){
        this.showLayer = false;
        this.$emit("dialogConfirm")
      }
    },
    mounted(){
      $(function () {
        $(".dialog").easydrag();
        $(".dialog").setHandler("dialog-title");
      });
    },
    watch: {
      "show": function (newVal, oldVal) {
        this.showLayer = newVal;
      }
    },
    components: {
      MaskLayer: MaskLayer
    }
  }
</script>

<style scoped>
  .dialog {
    background-color: #ffffff;
    font-family: iconfont;
    box-shadow: 0px 0px 55px 4px #555;
    -webkit-box-shadow: 0px 0px 55px 4px #555;
  }

  .dialog-size {
    min-height: 150px;
    width: 400px;
    height: auto;
    overflow: hidden;
  }

  .dialog-title {
    background-color: #35baf6;
    color: #fff;
    height: 40px;
    font-size: 12pt;
    padding-top: 10px;
    padding-left: 20px;
    border-bottom: 1px solid #dddddd;
  }

  .dialog-icon:before {
    color: #f7ba2a;
    font-size: 32pt;
    content: "\ea07"
  }

  .dialog-message {
    padding: 15px 20px;
    color: #48576a;
  }

  .dialog-message span {
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
  }

  .dialog-toolbar {
    min-height: 47px;
    padding: 10px 0;
  }

  .dialog-toolbar button {
    height: 27px;
    padding: 0 10px;
    background: #20a0ff;
    color: #fff;
    border-radius: 4px;
    float: right;
    margin-right: 10px;
  }

  .dialog-toolbar .dialog_cancel {
    background: #e64242;
  }

  .dialog-toolbar button:hover {
    opacity: .75;
    filter: Alpha(opacity=75);
  }
</style>
