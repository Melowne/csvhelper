<script lang="ts">
import {defineComponent, type PropType} from 'vue';
type ColorStrings = 'primary' | 'secondary' | 'reset';
export default defineComponent({
    name: 'CstmBtn',
    props: {
        color: {
            type: String as PropType<ColorStrings>,
            default: 'primary',
            required: false,
        },
    },
});
</script>
<template>
    <button class="cstm__button regular" :class="color">
        <div class="cstm__button_content">
            <slot></slot>
        </div>
    </button>
</template>

<style scoped lang="scss">
@import '../assets/colors.scss';
.cstm {
    &__button {
        height: 38px;
        padding: 0;
        border: none;
        font: inherit;
        color: inherit;
        background-color: transparent;
        cursor: pointer;
        width: fit-content;
        white-space: nowrap;
        &.regular {
            border-radius: 5px;
            padding: 8px 10px;
            &:hover {
                cursor: pointer;
            }
        }
        &.primary {
            background-color: $color-primary;
            color: $textcolor-on-primary !important;
            * {
                color: $textcolor-on-primary !important;
            }
            &:hover {
                cursor: pointer;
                background-color: $color-primary-hover;
            }
        }
        &.secondary {
            background-color: $color-secondary;
            color: $textcolor-on-secondary !important;
            * {
                color: $textcolor-on-secondary !important;
            }
            &:hover {
                cursor: pointer;
                background-color: $color-secondary-hover;
            }
        }
        &.reset {
            background-color: $color-reset;
            color: $textcolor-on-reset !important;
            * {
                color: $textcolor-on-reset !important;
            }
            &:hover {
                cursor: pointer;
                background-color: $color-reset-hover;
            }
        }
    }
}
</style>
