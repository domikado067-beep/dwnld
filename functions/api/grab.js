export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return new Response(JSON.stringify({ error: "URL wajib diisi bos!" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // Cloudflare fetch itu sakti, ga perlu axios
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://vidoy.com/'
            }
        });

        const html = await response.text();

        // Regex sakti buat nyari link .mp4 di Vidoy
        const regex = /https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*/g;
        const matches = html.match(regex);

        if (matches && matches.length > 0) {
            const cleanLink = matches[0].replace(/\\/g, '');
            return new Response(JSON.stringify({ success: true, downloadUrl: cleanLink }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*" 
                }
            });
        } else {
            return new Response(JSON.stringify({ success: false, error: "Link video ga ketemu di HTML Vidoy" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
