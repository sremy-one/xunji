<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { useCloudStore } from '@/stores/cloud'
import { installRouteGuards } from '@/router'
import { installPrivacyAuthorizationHandler } from '@/services/privacy-consent'

const authStore = useAuthStore()
const cloudStore = useCloudStore()

onLaunch((options) => {
  installRouteGuards()
  installPrivacyAuthorizationHandler()
  authStore.reload()
  // #ifdef MP-WEIXIN
  uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#f7f3ea' })
  // #endif

  authStore.clearLegacyPromptFlag()
  void cloudStore.resume()
})

onShow((options) => {
  void options
})
</script>

<style lang="scss" src="./styles/global.scss"></style>
