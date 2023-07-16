const https = require('https');



exports.handler = async (event) => {
  let response;
  
    
  if (!event.queryStringParameters?.repoName) {
    response = {
      statusCode: 400,
      body: JSON.stringify({
          error: 'incoming request did not have a repoName'
      })
    };
    return response;
  }  
  const repoName = event.queryStringParameters.repoName;
  
  const options = {
      host: 'api.github.com',
      path: '/repos/jacobmott/'+repoName+"/readme",
      method: 'GET',
      'headers': {
        'Authorization': 'Basic githubbase64password',
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
    const { content } = json;

    const buff = Buffer.from(content, 'base64');
    //// decode buffer as UTF-8
    const str = buff.toString('utf-8');
    console.log("buf: "+str);
    //const withoutLineBreaks = str.replace(/\n/gm, ' ');
    
    
    let responseFinal = {'list': [] };
    
    const regexp = /^(https:\/\/youtu\.be\/)(.*?)(\r\n|\r|\n)/gm;
    const array = [...str.matchAll(regexp)];
    for (const arr of array) {
      let id = arr[2];
      let myUrl = {'id': id};
      responseFinal['list'].push(myUrl);
    }
    
    
    
    response = {
      statusCode: 200,
      headers: {
              "Access-Control-Allow-Origin": "*"
          }, 
      body: JSON.stringify(responseFinal)
    };
  } 
  catch (error) {
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