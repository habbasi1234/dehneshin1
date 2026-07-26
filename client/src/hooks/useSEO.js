export default function useSEO(opts = {}) {
  const {
    title = 'ده نشین | محصولات ارگانیک',
    description = 'ده نشین، فروشگاه آنلاین محصولات ارگانیک و طبیعی. تازه‌ترین میوه‌ها، سبزیجات، لبنیات و محصولات سالم از مزرعه تا سفره.',
    ogTitle,
    ogDescription,
    ogImage = '/og-default.jpg',
    ogUrl,
    canonical,
    keywords,
  } = !opts ? {} : typeof opts === 'string' ? { title: opts } : opts

  const fullTitle = title.includes('ده نشین') ? title : `${title} | ده نشین`
  const siteUrl = 'https://dehneshin.com'

  const setMeta = (name, content) => {
    if (!content) return
    let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      if (name.startsWith('og:') || name.startsWith('twitter:')) el.setAttribute('property', name)
      else el.setAttribute('name', name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  document.title = fullTitle
  setMeta('description', description)
  setMeta('keywords', keywords)
  setMeta('og:title', ogTitle || fullTitle)
  setMeta('og:description', ogDescription || description)
  setMeta('og:image', ogImage.startsWith('http') ? ogImage : siteUrl + ogImage)
  setMeta('og:url', ogUrl || siteUrl + (canonical || window.location.pathname))
  setMeta('og:type', 'website')
  setMeta('og:site_name', 'ده نشین')
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', ogTitle || fullTitle)
  setMeta('twitter:description', ogDescription || description)
  setMeta('twitter:image', ogImage.startsWith('http') ? ogImage : siteUrl + ogImage)

  let canonEl = document.querySelector('link[rel="canonical"]')
  if (!canonEl) {
    canonEl = document.createElement('link')
    canonEl.setAttribute('rel', 'canonical')
    document.head.appendChild(canonEl)
  }
  canonEl.setAttribute('href', siteUrl + (canonical || window.location.pathname))
}
