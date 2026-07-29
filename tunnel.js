import('localtunnel').then(async (lt) => {
  const tunnel = await lt.default({ port: 5000, subdomain: 'dehneshin' })
  console.log('✅ TUNNEL URL:', tunnel.url)
  console.log('Frontend + Backend accessible at:', tunnel.url)
}).catch(e => {
  console.error('Tunnel failed:', e.message)
})
