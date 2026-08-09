import { reactive } from 'vue'

type PrivacyDecision = 'exposureAuthorization' | 'agree' | 'disagree'
type WechatPrivacyResolver = (result: { event: PrivacyDecision; buttonId?: string }) => void

declare const wx: any

export const privacyDialogState = reactive({
  visible: false,
  checked: false,
  busy: false,
  contractName: '隐私保护指引',
})

export const privacyAgreeButtonId = 'privacy-agree-button'

let pendingWechatResolver: WechatPrivacyResolver | null = null
let activeRequest: Promise<void> | null = null
let handlerInstalled = false

function isWechatMiniProgram() {
  // #ifdef MP-WEIXIN
  return true
  // #endif
  // #ifndef MP-WEIXIN
  return false
  // #endif
}

function getPrivacySetting() {
  return new Promise<{ needAuthorization: boolean; privacyContractName?: string }>((resolve, reject) => {
    if (!isWechatMiniProgram() || typeof wx === 'undefined' || !wx.getPrivacySetting) {
      resolve({ needAuthorization: false })
      return
    }
    wx.getPrivacySetting({
      success: resolve,
      fail: (error: { errMsg?: string }) => reject(new Error(error.errMsg || '隐私授权状态获取失败')),
    })
  })
}

function requireWechatPrivacyAuthorization() {
  return new Promise<void>((resolve, reject) => {
    if (!isWechatMiniProgram() || typeof wx === 'undefined' || !wx.requirePrivacyAuthorize) {
      resolve()
      return
    }
    wx.requirePrivacyAuthorize({
      success: () => resolve(),
      fail: (error: { errMsg?: string }) => reject(new Error(error.errMsg || '需要同意隐私保护指引后才能保存数据')),
    })
  })
}

function showPrivacyDialog(contractName?: string) {
  privacyDialogState.contractName = contractName || privacyDialogState.contractName || '隐私保护指引'
  privacyDialogState.checked = false
  privacyDialogState.busy = false
  privacyDialogState.visible = true
}

export function installPrivacyAuthorizationHandler() {
  if (handlerInstalled || !isWechatMiniProgram() || typeof wx === 'undefined' || !wx.onNeedPrivacyAuthorization) return
  wx.onNeedPrivacyAuthorization((resolve: WechatPrivacyResolver) => {
    pendingWechatResolver = resolve
    showPrivacyDialog()
    resolve({ event: 'exposureAuthorization' })
    void getPrivacySetting().then((setting) => {
      privacyDialogState.contractName = setting.privacyContractName || '隐私保护指引'
    }).catch(() => { /* The authorization dialog remains usable with the default title. */ })
  })
  handlerInstalled = true
}

export function openPrivacyContract() {
  if (!isWechatMiniProgram() || typeof wx === 'undefined' || !wx.openPrivacyContract) {
    uni.showToast({ title: '请在微信小程序中查看隐私保护指引', icon: 'none' })
    return
  }
  wx.openPrivacyContract({
    fail: (error: { errMsg?: string }) => uni.showToast({ title: error.errMsg || '隐私保护指引打开失败', icon: 'none' }),
  })
}

export async function requestPrivacyConsent() {
  if (activeRequest) return activeRequest
  activeRequest = (async () => {
    const setting = await getPrivacySetting()
    if (!setting.needAuthorization) return
    installPrivacyAuthorizationHandler()
    privacyDialogState.contractName = setting.privacyContractName || '隐私保护指引'
    await requireWechatPrivacyAuthorization()
  })()
  try { await activeRequest } finally { activeRequest = null }
}

export async function confirmPrivacyConsent() {
  if (!pendingWechatResolver || privacyDialogState.busy) return
  if (!privacyDialogState.checked) {
    uni.showToast({ title: '请先勾选同意隐私保护指引', icon: 'none' })
    return
  }
  privacyDialogState.busy = true
  try {
    const resolver = pendingWechatResolver
    pendingWechatResolver = null
    privacyDialogState.visible = false
    resolver({ event: 'agree', buttonId: privacyAgreeButtonId })
  } finally {
    privacyDialogState.busy = false
    privacyDialogState.checked = false
  }
}

export function cancelPrivacyConsent() {
  if (!pendingWechatResolver) return
  const resolver = pendingWechatResolver
  pendingWechatResolver = null
  privacyDialogState.visible = false
  privacyDialogState.busy = false
  privacyDialogState.checked = false
  resolver({ event: 'disagree' })
}
