export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const targetUrl = searchParams.get('url');

    const responseHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    };

    if (!targetUrl) return new Response(JSON.stringify({ error: "URL Missing" }), { status: 400, headers: responseHeaders });

    try {
        // --- DEEP DISGUISE HEADERS ---
        const ghostHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
            'Cache-Control': 'max-age=0',
            'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none', // Menyamar seolah-olah user ngetik langsung di URL bar
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Referer': 'https://www.google.com/', // Menyamar seolah dateng dari Google Search
        };

        const response = await fetch(targetUrl, {
            headers: ghostHeaders,
            method: 'GET',
            redirect: 'follow'
        });

        if (!response.ok) {
            throw new Error(`Vidoy Shield Active (Status: ${response.status})`);
        }

        const html = await response.text();

        // Regex yang lebih agresif untuk mencari link .mp4, .m3u8, atau redirect url
        const videoPatterns = [
            /(?:https?:)?\/\/[^"']+\.(?:mp4|m3u8|webm)[^"']*/gi,
            /file\s*:\s*["']([^"']+)["']/gi, // Mencari di dalam player script
            /source\s+src\s*=\s*["']([^"']+)["']/gi
        ];

        let videoUrl = null;
        for (let pattern of videoPatterns) {
            const match = pattern.exec(html);
            if (match) {
                videoUrl = match[1] || match[0];
                break;
            }
        }

        if (videoUrl) {
            // Bersihkan URL dari karakter escape
            videoUrl = videoUrl.replace(/\\/g, '');
            if (videoUrl.startsWith('//')) videoUrl = 'https:' + videoUrl;

            return new Response(JSON.stringify({ success: true, downloadUrl: videoUrl }), { headers: responseHeaders });
        } else {
            return new Response(JSON.stringify({ success: false, error: "Link tersembunyi atau diproteksi JavaScript tingkat tinggi." }), { headers: responseHeaders });
        }

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: "Protocol Failed: " + err.message }), { status: 500, headers: responseHeaders });
    }
}
