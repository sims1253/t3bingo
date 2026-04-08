/**
 * Utilities for html2canvas capture.
 *
 * html2canvas has its own CSS parser that cannot resolve CSS custom properties
 * (var(--*)). It reads stylesheet rules and fails on var() references, producing
 * black-on-black for elements styled with CSS variables.
 *
 * Solution: create an offscreen clone of the board with all CSS classes removed
 * and replaced by inline computed styles. html2canvas only sees resolved colors.
 *
 * Additionally, marked cells in the clone get an opaque accent-tinted background
 * so they remain readable in the captured PNG regardless of where it's placed.
 */

/** CSS properties to copy from computed styles to the clone */
const COPY_PROPS = [
  'background-color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-width',
  'border-style',
  'border-radius',
  'color',
  'font-size',
  'font-weight',
  'font-family',
  'line-height',
  'text-decoration-line',
  'opacity',
] as const

/**
 * Detect whether the current page is in dark mode.
 */
function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark')
}

/**
 * Create an offscreen clone of the board with resolved inline styles.
 * The clone is appended to the document body for html2canvas capture.
 */
export function createCaptureClone(boardEl: HTMLElement): HTMLElement {
  const clone = boardEl.cloneNode(true) as HTMLElement
  const dark = isDarkMode()

  // Match grid layout from computed styles
  const gridComputed = window.getComputedStyle(boardEl)
  clone.style.cssText = ''
  clone.style.display = 'grid'
  clone.style.gridTemplateColumns = 'repeat(5, 1fr)'
  clone.style.gap = gridComputed.gap
  clone.style.width = gridComputed.width
  clone.style.padding = '12px'
  clone.style.borderRadius = '12px'
  // Use an opaque page background so the PNG is self-contained
  clone.style.backgroundColor = dark ? '#111111' : '#f5f5f0'
  clone.style.position = 'fixed'
  clone.style.left = '-9999px'
  clone.style.top = '0'
  clone.removeAttribute('role')
  clone.removeAttribute('aria-label')

  // Walk original cells and apply resolved styles to clone cells
  const originalCells = boardEl.querySelectorAll('button')
  const clonedCells = clone.querySelectorAll('button')

  originalCells.forEach((orig, i) => {
    const cloned = clonedCells[i] as HTMLElement | undefined
    if (!cloned) return

    const computed = window.getComputedStyle(orig)
    const isMarked = orig.getAttribute('aria-pressed') === 'true'

    // Strip all classes — only inline styles, no CSS variable references
    cloned.className = ''

    // Copy all relevant computed properties as inline styles
    for (const prop of COPY_PROPS) {
      const val = computed.getPropertyValue(prop)
      if (val) {
        cloned.style.setProperty(prop, val)
      }
    }

    // Marked cells: override the subtle transparent background with an opaque
    // accent tint so the cell is clearly distinguishable in the PNG.
    if (isMarked) {
      cloned.style.backgroundColor = dark ? '#1a2e24' : '#dff5ea'
      cloned.style.borderColor = dark ? '#3dbd85' : '#2d9c6f'
      cloned.style.color = dark ? '#f0f0f0' : '#1a1a1a'
    } else {
      // Unmarked cells: ensure opaque card background
      cloned.style.backgroundColor = dark ? '#1a1a1a' : '#ffffff'
      cloned.style.color = dark ? '#aaaaaa' : '#555555'
    }

    // Ensure aspect ratio is maintained
    cloned.style.aspectRatio = '1 / 1'
    cloned.style.display = 'flex'
    cloned.style.flexDirection = 'column'
    cloned.style.alignItems = 'center'
    cloned.style.justifyContent = 'center'
    cloned.style.overflow = 'hidden'
    cloned.style.boxSizing = 'border-box'
    cloned.style.cursor = 'default'

    // Fix checkmark color (uses var(--accent))
    const checkmark = cloned.querySelector('[aria-hidden]') as HTMLElement | null
    if (checkmark) {
      const origCheckmark = orig.querySelector('[aria-hidden]') as HTMLElement | null
      if (origCheckmark) {
        const checkComputed = window.getComputedStyle(origCheckmark)
        checkmark.style.color = checkComputed.color
      }
    }

    // Fix the text span opacity. Skip line-through — html2canvas renders it
    // across the entire text block which places the line between wrapped lines
    // instead of through each line. Marked cells are already visually distinct
    // via background color and checkmark in the PNG.
    const textSpan = cloned.querySelector('span:last-child') as HTMLElement | undefined
    if (textSpan && textSpan !== checkmark) {
      const origTextSpan = orig.querySelector('span:last-child') as HTMLElement | null
      if (origTextSpan) {
        const spanComputed = window.getComputedStyle(origTextSpan)
        textSpan.style.textDecorationLine = 'none'
        textSpan.style.opacity = spanComputed.opacity
      }
    }
  })

  document.body.appendChild(clone)
  return clone
}

/**
 * Remove a previously created capture clone from the DOM.
 */
export function removeCaptureClone(clone: HTMLElement): void {
  clone.remove()
}
