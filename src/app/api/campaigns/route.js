export const runtime = 'edge'

export async function GET() {
  const token = process.env.META_ACCESS_TOKEN
  const accountId = process.env.META_AD_ACCOUNT_ID || '2150508882419648'

  if (!token) {
    return Response.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 })
  }

  const fields = 'id,name,status,objective,spend,impressions,clicks,ctr,cpc,reach'
  const url = `https://graph.facebook.com/v19.0/act_${accountId}/campaigns?fields=${fields}&date_preset=last_30d&access_token=${token}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 400 })
    }

    return Response.json({ campaigns: data.data || [] })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
