<template>
  <div class="steps-wrap" :class="[type]">
    <div class="step-header">
      <div class="step-item"
           v-for="(step, index) in steps"
           :class="{'is-active': currentIndex === index, 'is-done': index < currentIndex}"
           :style="{stepStyle}">
        <div class="step-left">
          <div class="step-icon">
            <span v-if="index >= currentIndex">{{ index + 1 }}</span>
            <span v-if="index < currentIndex"><i class="done"></i></span>
          </div>
        </div>
        <div class="step-desc">
          <span class="step-title">{{ step.title }}</span>
        </div>     
      </div>
    </div>
    <div class="step-content ">
      <slot></slot>
    </div>
    <div class="step-footer has-text-right" v-if="showFooter">
      <button class="button " @click="prev">{{ prevText }}</button>
      <button class="button " @click="next">{{ nextText }}</button>
    </div>
  </div>
</template>
<script>


export default {
  props: {
    type: {
      type: String,
      default: 'pills',
    },
    current: {
      type: Number,
      default: 0,
    },
    prevText: {
      type: String,
      default: 'Prev',
    },
    nextText: {
      type: String,
      default: 'Next',
    },
    onPrev: {
      type: Function,
      default() {},
    },
    onNext: {
      type: Function,
      default() {},
    },
    showFooter: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      steps: [],
      stepStyle: {},
      currentIndex: this.current,
    };
  },

  watch: {
    current(val) {
      this.currentIndex = val;
      this.setActiveIndex(this.currentIndex);
    },
  },

  methods: {
    setActiveIndex(index) {
      this.$children.forEach((item, i) => {
        if (i !== index) {
          item.active = false;
        } else {
          item.active = true;
        }
      });
    },
    next() {
      if (this.currentIndex < this.$children.length-1) {
        this.currentIndex += 1;
        this.setActiveIndex(this.currentIndex);
       
      }
    },
    prev() {
      if (this.currentIndex > 0) {
        this.currentIndex -= 1;
        this.setActiveIndex(this.currentIndex);
      }
    },
  },

  created() {
    if (this.type === 'pills') {
      const width = `${parseInt(100 / this.steps.length , 10)}%`;
      this.stepStyle['width'] = width;
    }
  },

    mounted() {
        this.setActiveIndex(this.currentIndex);
    },
   
};
</script>


