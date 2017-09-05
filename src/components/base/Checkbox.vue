<template>
  <span class="checkbox checkbox-normal" :class="{'checkbox-checked':checked, 'half-selected':halfSelected}" @click.stop="click"></span>
</template>

<script>
  export default{
    props: {
      value: {
        type: Boolean,
        default: false
      },
      halfSelected: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        checked: this.value
      }
    },
    methods: {
      click(event){
        this.checked = !this.checked;
        this.$emit('input', this.checked);
        this.$emit('change', this.checked);
      }
    },
    mounted(){
    },
    watch: {
      "value": function (newValue) {
        this.checked = newValue;
      }
    },
    components: {}
  }
</script>

<style scoped>
  .checkbox {
    font-family: iconfont;
    display: inline-block;
    font-size: 12pt;
    color: #999999;
  }

  .checkbox:hover {
    color: #0374d0
  }

  .checkbox-normal:before {
    content: "\eaff"
  }

  .checkbox-checked:before {
    content: "\eafe"
  }

  .half-selected:before{
    color:#cccccc;
  }
</style>
