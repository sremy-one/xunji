let installed = false

export function guardNavigation(_url: string) {
  return true
}

export function installRouteGuards() {
  if (installed) return
  installed = true
}
