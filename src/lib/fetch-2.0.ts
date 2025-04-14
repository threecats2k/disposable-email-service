import http2, { OutgoingHttpHeaders } from 'http2';

const fetchV2 = async (url: string, options: OutgoingHttpHeaders): Promise<Record<string, any>> => {
  return new Promise((resolve, reject) => {
    const client = http2.connect(url + options[':path']);
    console.log(url);
    console.log(options[':path']);
    const req = client.request({
      ':method': options[':method'],
      ':path': options[':path'],
      ':scheme': 'https',
      'accept': options.accept ?? 'application/json, text/plain, */*',
      'content-type': options['content-type'] ?? 'application/json',
    });

    // Collect response data
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });

    // Handle the end of the response
    req.on('end', () => {
      console.log(data);
      resolve(JSON.parse(data));
      client.close(); // Close the client session
    });

    // Handle errors
    req.on('error', (err) => {
      reject(err);
      client.close();
    });
    req.end();
  })
}

export default fetchV2;