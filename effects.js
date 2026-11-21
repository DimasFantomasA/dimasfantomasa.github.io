(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  const wideScreen = window.matchMedia("(min-width: 56rem)")

  function animateIn(element, offset) {
    if (reducedMotion.matches || typeof element.animate !== "function") return

    element.getAnimations?.().forEach(animation => animation.cancel())
    element.animate(
      [
        { opacity: 0, transform: offset },
        { opacity: 1, transform: "none" }
      ],
      { duration: 480, easing: "cubic-bezier(.22, 1, .36, 1)" }
    )
  }

    if (!reducedMotion.matches && typeof Element.prototype.animate === "function") {
    const revealLine = () => window.innerHeight * 0.65
    const headings = document.querySelectorAll(".section-heading, #contact h2")
    const pending = new Set(
      [...headings].filter(heading => heading.getBoundingClientRect().top > revealLine())
    )

    pending.forEach(heading => heading.classList.add("heading-pending"))

    let revealFrame = 0

    function revealHeadings() {
      revealFrame = 0
      const line = revealLine()
      const page = document.scrollingElement
      const atBottom = page.scrollHeight - page.scrollTop - page.clientHeight <= 2

      for (const heading of pending) {
        const { top, bottom } = heading.getBoundingClientRect()
        if (top > line && !atBottom) continue

        pending.delete(heading)
        heading.classList.remove("heading-pending")
        if (bottom > 0 && top < window.innerHeight) {
          animateIn(heading, "translateY(14px)")
        }
      }
    }

    function scheduleReveal() {
      if (!revealFrame && pending.size) {
        revealFrame = window.requestAnimationFrame(revealHeadings)
      }
    }

    window.addEventListener("scroll", scheduleReveal, { passive: true })
    window.addEventListener("resize", scheduleReveal)
    scheduleReveal()
  }

  const projectList = document.getElementById("project-list")
  const projectSection = projectList?.closest("#projects")
  if (!projectSection) return

  const cards = [...projectList.querySelectorAll(".project-card")]
  const titles = cards.map(card => card.querySelector("h3")?.textContent.trim())
  if (cards.length < 2 || titles.some(title => !title)) return

    const preview = document.createElement("div")
  preview.className = "portfolio-preview"

  const content = document.createElement("div")
  content.className = "portfolio-preview-content"

  const caption = document.createElement("p")
  caption.className = "portfolio-caption"
  caption.setAttribute("aria-hidden", "true")

  const previewLink = document.createElement("a")
  previewLink.className = "portfolio-repo-link"
  previewLink.target = "_blank"
  previewLink.rel = "noopener noreferrer"

  const codeIcon = document.createElement("span")
  codeIcon.className = "portfolio-repo-icon"
  codeIcon.setAttribute("aria-hidden", "true")
  codeIcon.textContent = "</>"
  previewLink.append(codeIcon, "Посмотреть на GitHub")

  content.append(caption, previewLink)
  preview.append(content)
  projectList.before(preview)
  projectSection.classList.add("has-portfolio-preview")

  function showProject(index, animated) {
    caption.textContent = titles[index]

    const link = cards[index].querySelector("a.project-link[href]")
    previewLink.hidden = !link

    if (link) {
      previewLink.href = link.href
      previewLink.setAttribute("aria-label", `Посмотреть на GitHub: ${titles[index]}`)
    } else {
      previewLink.removeAttribute("href")
    }

    if (animated) {
      animateIn(caption, "translateX(36px)")
      if (link) animateIn(previewLink, "translateY(8px)")
    }
  }

  showProject(0, false)
  previewLink.addEventListener("blur", () => scheduleUpdate())

  let current = 0
  let frame = 0

  function updatePreview() {
    frame = 0
    if (!wideScreen.matches) return

    const previewBox = preview.getBoundingClientRect()
    const readingLine = previewBox.top + previewBox.height * 0.52
    let nearest = current
    let nearestDistance = Infinity

    for (const [index, card] of cards.entries()) {
      const box = card.getBoundingClientRect()
      const distance = Math.abs(box.top + box.height / 2 - readingLine)
      if (distance < nearestDistance) {
        nearest = index
        nearestDistance = distance
      }
    }

    if (nearest === current || previewLink.matches(":focus-visible")) return

    current = nearest
    showProject(current, true)
    animateIn(caption, "translateX(36px)")
  }

  function scheduleUpdate() {
    if (wideScreen.matches && !frame) {
      frame = window.requestAnimationFrame(updatePreview)
    }
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true })
  window.addEventListener("resize", scheduleUpdate)
  updatePreview()

  preview.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || reducedMotion.matches) return

    const box = preview.getBoundingClientRect()
    preview.style.setProperty("--pointer-x", `${event.clientX - box.left}px`)
    preview.style.setProperty("--pointer-y", `${event.clientY - box.top}px`)
    preview.setAttribute("data-pointer", "")
  })

  preview.addEventListener("pointerleave", () => {
    preview.removeAttribute("data-pointer")
  })
})()