export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const targetUrl = searchParams.get('url');

    const responseHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
    };

    if (!targetUrl) {
        return new Response(JSON.stringify({ success: false, error: "Masukkan URL Vidoy dulu!" }), { 
            status: 400, 
            headers: responseHeaders 
        });
    }

    try {
        // Nyamar jadi browser asli
        const vidoyRes = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Referer': 'https://vidoy.com/',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            redirect: 'follow'
        });

        if (!vidoyRes.ok) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: `Vidoy nolak akses (Status: ${vidoyRes.status})` 
            }), { headers: responseHeaders });
        }

        const html = await vidoyRes.text();

        // Cari link video (pola mp4, m3u8, atau source src)
        const videoRegex = /(?:https?:)?\/\/[^"']+\.(?:mp4|m3u8|webm)[^"']*/gi;
        const matches = html.match(videoRegex);

        if (matches && matches.length > 0) {
            // Ambil link pertama, bersihkan backslash
            const cleanUrl = matches[0].replace(/\\/g, '');
            // Pastikan pakai https
            const finalUrl = cleanUrl.startsWith('//') ? `https:${cleanUrl}` : cleanUrl;

            return new Response(JSON.stringify({ 
                success: true, 
                downloadUrl: finalUrl 
            }), { headers: responseHeaders });
        } else {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Link video ga ketemu di kodingan Vidoy. Mungkin video diproteksi." 
            }), { headers: responseHeaders });
        }

    } catch (err) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Server Crash: " + err.message 
        }), { status: 500, headers: responseHeaders });
    }
}
