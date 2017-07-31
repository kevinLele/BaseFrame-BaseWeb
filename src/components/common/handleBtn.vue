<template>
	<div class="handleBtn">
		<button class="btn_confirm" @click="ok">{{msg.ok}}</button>
        <button class="btn_cancel" @click="cel">{{msg.cel}}</button>
        <slot></slot>
    </div>
</template>
<script>
	 export default{
	 	props:{
	 		msg : Object
	 	},
	 	data(){
	 		return{
	 			
	 		}
	 	},
	 	methods:{
	 		ok(){
	 			this.$emit("confirm")
	 		},
	 		cel(){
	 			this.$emit("cancel")
	 		}
	 	}
	 }
	
	
</script>
<style>
	.handleBtn button {
    height: 27px;
    padding: 0 10px;
    background: #20a0ff;
    color: #fff;
    border-radius: 4px;
    float: right;
    margin-right: 10px;
  }

  .handleBtn .btn_cancel {
    background: #fff;
    border:1px solid #20a0ff;
    color: #20a0ff;
  }

  .handleBtn button:hover {
    opacity: .75;
    filter: Alpha(opacity=75);
  }
</style>