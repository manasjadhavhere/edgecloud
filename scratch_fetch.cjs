const https = require('https');
https.get('https://et-edge.com/conferences/btb/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const fonts = data.match(/href=[\"'][^\"']*fonts.googleapis.com[^\"']*[\"']/gi);
    console.log("Google Fonts:", fonts ? fonts.join('\n') : 'none');
    
    const inlineFonts = data.match(/font-family:[^;\"']+/gi);
    console.log("Inline fonts:", inlineFonts ? [...new Set(inlineFonts)].join('\n') : 'none');
  });
});
