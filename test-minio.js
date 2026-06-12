import * as Minio from 'minio';

const client = new Minio.Client({
      endPoint: '10.255.20.254',
      port: 9000,
      useSSL: false,
      accessKey: 'root',
      secretKey: 'rootpass123',
});

const buckets = await client.listBuckets();
console.log(buckets);