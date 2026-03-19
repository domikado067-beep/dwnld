export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const targetUrl = searchParams.get('url');

    // Pastikan selalu kirim Header JSON
    const jsonHeader = { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
    };

    if (!targetUrl) {
        return new Response(JSON.stringify({ success: false, error: "URL kosong" }), { headers: jsonHeader });
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://vidoy.com/'
            },
            redirect: 'follow'
        });

        const html = await response.text();
        
        // Cek apakah HTML-nya dapet atau kosong
        if (!html) {
            return new Response(JSON.stringify({ success: false, error: "Gagal ambil HTML dari Vidoy" }), { headers: jsonHeader });
        }

        // Regex lebih luas: cari pola file mp4 atau m3u8
        const regex = /https?:\/\/[^"']+\.(?:mp4|m3u8|webm)[^"']*/g;
        const matches = html.match(regex);

        if (matches && matches.length > 0) {
            const cleanLink = matches[0].replace(/\\/g, '');
            return new Response(JSON.stringify({ success: true, downloadUrl: cleanLink }), { headers: jsonHeader });
        } else {
            // Kalau ga ketemu, jangan diem, kirim error JSON
            return new Response(JSON.stringify({ success: false, error: "Video tidak ditemukan di halaman Vidoy" }), { headers: jsonHeader });
        }
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: "Server Crash: " + err.message }), { headers: jsonHeader });
    }
}
