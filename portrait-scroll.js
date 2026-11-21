(() => {
  const hero = document.querySelector(".hero")
  const header = document.querySelector(".header")

  if (!header || !hero?.querySelector(".hero-portrait img")) return

  const motion = window.matchMedia(
    "(min-width: 56rem) and (prefers-reduced-motion: no-preference)"
  )
  const scene = document.createElement("div")
  scene.className = "hero-scroll"
  hero.before(scene)
  scene.append(hero)

  let headerHeight = 0
  let distance = 0
  let frame = 0

  function updatePortrait() {
    if (!distance) return

    const scrolled = headerHeight - scene.getBoundingClientRect().top
    const progress = Math.min(1, Math.max(0, scrolled / distance))
    scene.style.setProperty("--portrait-visible", `${(progress * 100).toFixed(2)}%`)
  }

  function updateLayout() {
    distance = 0
    if (!motion.matches) {
      scene.classList.remove("is-portrait-revealing")
      return
    }

    headerHeight = header.getBoundingClientRect().height
    const space = window.innerHeight - headerHeight
    scene.style.setProperty("--header-height", `${headerHeight}px`)
    scene.style.setProperty("--hero-space", `${space}px`)
    scene.classList.add("is-portrait-revealing")

    const heroHeight = hero.getBoundingClientRect().height
    if (heroHeight > space + 1) {
      scene.classList.remove("is-portrait-revealing")
      return
    }

    distance = scene.getBoundingClientRect().height - heroHeight
    updatePortrait()
  }

  window.addEventListener("scroll", () => {
    if (!distance || frame) return

    frame = window.requestAnimationFrame(() => {
      frame = 0
      updatePortrait()
    })
  }, { passive: true })

  window.addEventListener("resize", updateLayout)
  window.addEventListener("pageshow", updateLayout)
  motion.addEventListener("change", updateLayout)
  document.fonts?.ready.then(updateLayout)
  updateLayout()
})()