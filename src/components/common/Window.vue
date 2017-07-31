<template>
  <div class="window-windowWrap">
    <div class="window-maskLayer"></div>
    <div class="window-maskLayerContent">
      <div class="window-container">
        <div class="window-content">
          <div :style="windowStyle">
            <div class="drag-window" :style="windowStyle">
              <div class="content-title">
                <span>{{config.title}}</span>
                <span class="close-btn" @click="close"></span>
                <span v-if="hasMaxBtn" :class="{'max-btn':!isMaxed,'nor-btn':isMaxed}" @click="max"></span>
              </div>
              <div class="content-body">
                <slot></slot>
              </div>
              <div class="content-toolbar">
                <button v-if="hasConfirm" class="toolbar_confirm" @click="confirm">提交</button>
                <button v-if="hasCancel" class="toolbar_cancel" @click="cancel">取消</button>
                <button v-if="hasClose" class="toolbar_confirm" @click="close">关闭</button>
                <button v-if="hasNext" @click="next" ref="nextBtn" :class="curr === 2 ? 'disabled':'toolbar_other'" >下一步</button>
                <button v-if="hasPrev" class="toolbar_other" @click="prev">上一步</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default{
    props: {
      config: Object
    },
    data(){
      if (typeof this.config == "undefined") {
        throw "组件的config属性未配置"
      }

      var hasConfirm = false;
      var hasCancel = false;
      var hasClose = false;
      var hasPrev = false;
      var hasNext = false;
      var hasMaxBtn = false;
      var curr = 0;

      if (typeof this.config.hasMaxBtn != "undefined") {
        hasMaxBtn = this.config.hasMaxBtn;
      }

      if (this.config.type == "add" || this.config.type == "modify") {
        hasConfirm = true;
        hasCancel = true;
      } else if (this.config.type == "rolePermission") {
        hasCancel = true;
        hasConfirm = true;
        hasPrev = true;
        hasNext = true;
      } else {
        hasClose = true;
      }

      return {
        hasConfirm: hasConfirm,
        hasCancel: hasCancel,
        hasClose: hasClose,
        hasPrev: hasPrev,
        hasNext: hasNext,
        curr: curr,
        hasMaxBtn: hasMaxBtn,
        isMaxed: false,
        windowStyle: {
          height: this.config.height,
          width: this.config.width
        }
      }
    },
    created(){
      this.$root.Bus.$on('toggleBtn', value => {
        this.$refs.nextBtn.disabled = true;
        this.addCls(value);
      })
    },
    methods: {
      addCls(value) {
        this.curr = value;
      },
      cancel(){
        this.$emit("windowCancel");

        if (this.config.method.cancel && this.config.parent) {
          this.config.method.cancel.call(this.config.parent);
        }
      },
      confirm(){
        this.$emit("windowConfirm");

        if (this.config.method.confirm && this.config.parent) {
          this.config.method.confirm.call(this.config.parent);
        }
      },
      close(){
        this.$emit("windowClose");

        if (this.config.method.close && this.config.parent) {
          this.config.method.close.call(this.config.parent);
        }
      },
      next(){
        if (this.curr < 3) {
          this.curr++;
        } else {
          this.curr = 2;
        }
        this.$emit("windowNext");
        if (this.config.method.next && this.config.parent) {
          this.config.method.next.call(this.config.parent);
        }
      },
      prev(){
        if (this.curr > 0) {
          this.curr--;
          this.$emit("windowPrev");
          if (this.config.method.prev && this.config.parent) {
            this.$refs.nextBtn.disabled = false;
            this.config.method.prev.call(this.config.parent);
          }
        }

      },
      max(){
        if (!this.isMaxed) {
          var position = $(this.$el).find(".drag-window").position();
          this.styleBak = this.windowStyle;
          this.styleBak.left = position.left + "px";
          this.styleBak.top = position.top + "px";

          this.windowStyle = {
            left: "0px",
            top: "0px",
            width: "100vw",
            height: "100vh"
          }

          this.isMaxed = true;
        } else {
          this.windowStyle = this.styleBak;
          this.isMaxed = false;
        }
      }
    },
    beforeDestroy() {
      this.$root.Bus.$off('toggleBtn');
    },
    mounted(){
      $(function () {
        $(".drag-window").easydrag();
        $(".drag-window").setHandler("content-title");
      });
    }
  }
</script>

<style scoped>
  .window-windowWrap {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    z-index: 999;
  }

  .window-maskLayer {
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0.8;
    -moz-opacity: 0.8;
    filter: alpha(opacity=80);
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .window-maskLayerContent {
    position: absolute;
    height: 100%;
    width: 100%;
    display: table;
  }

  .window-container {
    text-align: center;
    display: table-cell;
    vertical-align: middle;
  }

  .window-content {
    display: inline-block;
    text-align: left;
  }

  .drag-window {
    border: 1px solid #8c939d;
    background: #ffffff;
    border-top: 0px;
    border-radius: 5px;
    position: absolute;
    z-index: 999;
    box-shadow: 0px 0px 55px 4px #555;
    -webkit-box-shadow: 0px 0px 55px 4px #555;
  }

  .content-title {
    border-radius: 5px 5px 0px 0px;
    height: 35px;
    background: #35baf6;
    color: #fff;
    padding-top: 7px;
    padding-left: 10px;
    font-size: 15px;
    text-align: left;
  }

  .content-body {
    height: calc(100% - 80px);
    padding: 10px;
  }

  .content-toolbar {
    height: 47px;
    background: white;
    border-radius: 0px 0px 5px 5px;
    padding-top: 10px;
    border-top: 1px solid #dddddd;
  }

  .content-toolbar button {
    height: 27px;
    padding: 0 12px;
    background: #20a0ff;
    color: #fff;
    border-radius: 4px;
    float: right;
    margin-right: 12px;
    letter-spacing: 2px;
  }

  .content-toolbar button.toolbar_confirm:hover {
    opacity: .75;
    filter: Alpha(opacity=75);
  }

  .content-toolbar button.toolbar_cancel {
    background: #ffffff;
    border: 1px solid #aaaaaa;
    color: inherit;
  }

  .content-toolbar button.toolbar_cancel:hover {
    border: 1px solid #20a0ff;
    color: #20a0ff;
  }

  .content-toolbar button.toolbar_other {
    background: #ffffff;
    border: 1px solid #48a6b1;
    color: #48a6b1;
  }

  .content-toolbar button.toolbar_other:hover {
    color: #fff;
    background: #48a6b1;
  }

  .content-toolbar button.disabled {
    cursor: no-drop;
    background: #EEEEEE;
  }

  .content-toolbar button.disabled:hover {
    background: #EEEEEE;
    border-color: #ddd;
  }

  .close-btn, .max-btn, .nor-btn {
    font-family: "iconfont";
    cursor: pointer;
    float: right;
    color: #fff;
    padding: 0 5px;
    font-size: 22px;
  }

  .close-btn:before {
    content: "\e903";
    font-weight: bolder;
  }

  .max-btn:before {
    content: "\e90f";
    font-size: 18pt;
    background-color: transparent;
    color: #fff;
  }

  .nor-btn:before {
    content: "\e910";
    font-size: 13pt;
    position: relative;
    top: -2px;
  }

  .close-btn:hover {
    color: red;
    -webkit-animation: rotateIn 1s ease both;
    -moz-animation: rotateIn 1s ease both;
  }

  @-webkit-keyframes rotateIn {
    0% {
      -webkit-transform-origin: center center;
      -webkit-transform: rotate(-200deg);
    }
    100% {
      -webkit-transform-origin: center center;
      -webkit-transform: rotate(0);
    }
  }

  @-moz-keyframes rotateIn {
    0% {
      -moz-transform-origin: center center;
      -moz-transform: rotate(-200deg);
    }
    100% {
      -moz-transform-origin: center center;
      -moz-transform: rotate(0);
    }
  }


</style>
