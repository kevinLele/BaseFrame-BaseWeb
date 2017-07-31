<template>
  <div class="waitMask"
       :class="{show:isShow}"
       :style="{left:left + 'px',top:top + 'px',height:height + 'px',width:width + 'px'}">
    <div class="waitMask-content">
      <span class="img">
        <img src="../../common/img/waiting.gif"/>
      </span>
    </div>
  </div>
</template>

<script>
  export default{
    props: {
      isShow: Boolean,
      maskByParent: Boolean
    },
    data(){
      return {
        left: 0,
        top: 0,
        height: 0,
        width: 0
      }
    },
    methods: {},
    mounted(){
      if (this.maskByParent) {
        this.left = $(this.$parent.$el).parent().position().left;
        this.top = $(this.$parent.$el).parent().position().top;
        this.height = $(this.$parent.$el).parent().height();
        this.width = $(this.$parent.$el).parent().width();
      } else {
        this.left = $(".content").position().left;
        this.top = $(".header").height();
        this.height = $("body").height() - $(".header").height();
        this.width = $(".content").width();
      }

    },
    components: {},
    watch: {
      "isShow": function () {
        if (this.maskByParent) {
          this.left = $(this.$parent.$el).position().left;
          this.top = $(this.$parent.$el).position().top;
          this.height = $(this.$parent.$el).height();
          this.width = $(this.$parent.$el).width();
        } else {
          this.left = $(".content").position().left;
          this.top = $(".header").height();
          this.height = $("body").height() - $(".header").height();
          this.width = $(".content").width();
        }
      }
    }
  }
</script>

<style scoped>
  .waitMask {
    position: absolute;
    /*background-color: #aaaaaa;*/
    opacity: 0.6;
    -moz-opacity: 0.6;
    filter: alpha(opacity=60);
    display: none;
  }

  .waitMask-content {
    text-align: center;
    display: table-cell;
    vertical-align: middle;
  }

  .content img {
    display: inline-block;
    height: 40px;
    width: 40px;
  }

  .img {
    display: inline-block;
    padding: 10px;
    border: 1px solid #aaaaaa;
    /*box-shadow: 0px 0px 60px 10px #cccccc;*/
    border-radius: 10px;
  }

  .show {
    display: table;
  }
</style>
