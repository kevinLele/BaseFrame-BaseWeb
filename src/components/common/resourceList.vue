<template>
  <div class="organization" style="background-color:white;">
    <div style="border: 1px solid #ccc;height:430px;width:740px;">
      <tree ref="tree" :api="config.api"
            apiType="config.apiType" :hideRoot="true" :requestBody="{type:config.type}" :hasCheckbox="true"
            @selected="selected" @unselected="unselected" :expandLevel="5"
            :showNodes="showNodes" :hideNodes="hideNodes" :selectedNodes="selectedNodes"></tree>
    </div>
  </div>
</template>

<script>
  import Tree from "./Tree.vue"
  import TreeSelect from "./TreeSelect.vue"
  import Checkbox from "./Checkbox.vue"
  import Inputbox from "./Inputbox.vue"
  import Tooltip from "./Tooltip.vue"

  export default {
    props: {
      config: Object
    },
    data() {
      var showNodes = this.config.showNodes;
      var hideNodes = this.config.hideNodes;
      var selectedNodes = this.config.selectedNodes;

      if (typeof showNodes == "undefined") {
        showNodes = [];
      }

      if (typeof hideNodes == "undefined") {
        hideNodes = [];
      }

      if (typeof selectedNodes == "undefined") {
        selectedNodes = [];
      }

      return {
        selectValue: "2",
        api: "./restful/caorg/getAll",
        field: "name",
        checked: true,
        showNodes: showNodes,
        hideNodes: hideNodes,
        selectedNodes: selectedNodes
      }
    },
    methods: {
      show(){
      },
      showValue: function () {
      },
      selected: function (id, title) {
        this.$emit("selected", id)
      },
      unselected: function (id, title) {
      },
      getValue(){
        alert(this.checked);
      },
    },
    mounted() {

    },
    components: {
      Tree: Tree,
      TreeSelect: TreeSelect,
      Checkbox: Checkbox,
      Inputbox: Inputbox
    }
  }
</script>

<style scoped>

</style>
