import { defineComponent, inject, ref, h, reactive, SetupContext, computed, ComputedRef } from 'vue'

import { defaultConfigs } from '@/partials/defaults'
import { CarouselConfig } from '@/types'

function runningMod(a: number, b: number) {
  return (a % b + b) % b;
}

export default defineComponent({
  name: 'CarouselSlide',
  props: {
    index: {
      type: Number,
      default: 1,
    },
    isClone: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }: SetupContext) {
    const config: CarouselConfig = inject('config', reactive({ ...defaultConfigs }))
    const currentSlide = inject('currentSlide', ref(0))
    const previewSlide = inject('previewSlide', ref(0))
    const slidesToScroll = inject('slidesToScroll', ref(0))
    const slidesCount = inject('slidesCount', ref(0))
    const isSliding = inject('isSliding', ref(false))
    const isDragging = inject('isDragging', ref(false))
    const animationOverride = inject('animationOverride', ref(false))

    const isActive: ComputedRef<boolean> = computed(
      () => runningMod(props.index, slidesCount.value) === runningMod(isDragging.value ? previewSlide.value : currentSlide.value, slidesCount.value)
    )
    const isPrev: ComputedRef<boolean> = computed(
      () => runningMod(props.index, slidesCount.value) === runningMod(isDragging.value ? previewSlide.value : currentSlide.value, slidesCount.value) - 1
    )
    const isNext: ComputedRef<boolean> = computed(
      () => runningMod(props.index, slidesCount.value) === runningMod(isDragging.value ? previewSlide.value : currentSlide.value, slidesCount.value) + 1
    )
    const isVisible: ComputedRef<boolean> = computed(() => {
      const min = Math.floor(slidesToScroll.value)
      const max = Math.ceil(slidesToScroll.value + config.itemsToShow - 1)

      return props.index >= min && props.index <= max
    })

    return () =>
      h(
        'li',
        {
          style: {width: `${100 / config.itemsToShow}%`},
          class: {
            carousel__slide: true,
            'carousel__slide--clone': props.isClone,
            'carousel__slide--visible': isVisible.value,
            'carousel__slide--active': isActive.value,
            'carousel__slide--prev': isPrev.value,
            'carousel__slide--next': isNext.value,
            'carousel__slide--sliding': isSliding.value || isDragging.value,
            'carousel__slide--animation__override': animationOverride.value,
          },
          'aria-hidden': !isVisible.value,
        },
        slots.default?.({
          isActive: isActive.value,
          isClone: props.isClone,
          isPrev: isPrev.value,
          isNext: isNext.value,
          isSliding: isSliding.value,
          isVisible: isVisible.value
        })
      )
  },
})
