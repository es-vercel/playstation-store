import type { VFC } from 'react'
import { SEO } from '@components/common'

const Head: VFC = () => {
  return (
    <SEO>
      <meta
        key="viewport"
        name="viewport"
        // content="width=1.5 initial-scale=1"
        content="width=device-width, initial-scale=0.58"
      />
      <link rel="manifest" href="/site.webmanifest" key="site-manifest" />
    </SEO>
  )
}

export default Head
