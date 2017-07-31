<template>
  <div class="organization" style="padding:50px;background-color:white;border: 1px solid red;">
    <input id="testhello" type="input" v-model="message"/>
    <button class="normal-button" @click="mapview">地图预览</button>
    <button class="normal-button" @click="test">测试</button>
    <my-window v-if="windowConfig.show" :config="windowConfig">
      <iframe @load="load('iframe1')" name="iframe1" style="border: 1px solid #999999;width:100%;height:100%;" src="./map.html"></iframe>
    </my-window>

    <div style="width:800px;height:500px;padding-top:50px;">
      <iframe @load="load('iframe2')" name="iframe2" style="border: 1px solid #999999;width:100%;height:100%;" src="./map.html"></iframe>
    </div>
  </div>
</template>

<script>
  import Tree from "./common/Tree.vue"
  import TreeSelect from "./common/TreeSelect.vue"
  import Checkbox from "./common/Checkbox.vue"
  import Inputbox from "./common/Inputbox.vue"
  import Tooltip from "./common/Tooltip.vue"
  import MyWindow from "./common/Window.vue"

  export default {
    data() {
      return {
        message: "test message",
        windowConfig: {
          show: false,
          parent: this,
          title: "地图预览",
          height: "550px",
          width: "800px",
          hasMaxBtn: true,
          method: {
            close(){
              this.windowConfig.show = false;
            }
          }
        }
      }
    },
    methods: {
      load(name){
        window.frames[name].initFromParent(this);
      },
      testForFrame(){
        alert("该方法是vm中的方法");
        alert(this.message);
      },
      mapview(){
        this.windowConfig.show = true;
      },
      test(){
        window.frames["iframe2"].test();
      },
      show(){
        console.log(JSON.stringify(this.$refs.tree.rows))
      },
      showValue: function () {
        alert(this.selectValue + "---" + this.$refs.test.$data.title);
      },
      selected: function (id) {
        //alert(id);
      },
      getValue(){
        alert(this.checked);
      },
      handle(){

      },
    },
    mounted() {

    },
    watch: {
      message(newVal, oldVal){
        $(window.frames["iframe2"].document).find("#test").val(newVal)
      },
    },
    components: {
      Tree: Tree,
      TreeSelect: TreeSelect,
      Checkbox: Checkbox,
      Inputbox: Inputbox,
      MyWindow: MyWindow
    }
  }
</script>

<style scoped>

</style>
