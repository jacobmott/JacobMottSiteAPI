const https = require('https');

exports.handler = async (event) => {
    let response;

    const options = {
        host: 'api.github.com',
        path: '/user/repos',
        method: 'GET',
        'headers': {
          'Authorization': 'Basic ',
          'User-Agent': 'request',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    };    
    const githubRequest = new Promise((resolve, reject) => {
    const req = https.request(options, res => {
    // I believe chunks can simply be joined into a string
    const chunks = [];
        
   res.on('data', chunk => chunks.push(chunk));
   res.on('error', reject);
   res.on('end', () => {
   const { statusCode, headers } = res;
   const validResponse = statusCode >= 200 && statusCode <= 299;
   const body = chunks.join('');

   if (validResponse) resolve({ statusCode, headers, body });
   else reject(new Error(`Request failed. status: ${statusCode}, body: ${body}`));
 });
});

req.on('error', error => {
  console.error(error);
});

req.end();
        
});
    
    
    try {
        const githubRequestResponse = await githubRequest;
            const { body } = githubRequestResponse;
            let json = JSON.parse(body);
            let response2 = [];
            json.forEach(element => {
              response2.push({ "name": element.name});
            });
            
        response = {
            statusCode: 200,
            body: JSON.stringify(response2)
        };
    } catch (error) {
            console.log("ERROR");
            console.log(error);
        response = {
            statusCode: 400,
            body: JSON.stringify({
                'error': 'request to github endpoint failed',
                'fullerror': JSON.stringify(error)
            })
        };
    }
    return response;
};