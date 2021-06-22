***
# **Setup**

**Install**
- `npm install`

**Deploy**
- `npm run build-lambda`
- Upload created .zip file to Amazon Lambda Function
- Please allocate at least 1536 MB of RAM for your Lambda function
- Set at least 30 sec execution time for your Lambda function
- Check lambda layer should be something like: `arn:aws:lambda:eu-west-2:764866452798:layer:libreoffice-brotli:1`
- Upload new lambda layer to fix some strange bug - reported solution here https://github.com/shelfio/libreoffice-lambda-layer/issues/33#issuecomment-843177459
- Created layer in folder `lambda-layer`
- It works only in Amazon Linux 2, so it won't work locally on Linux or macOS. However, you could run it in Docker using lambci/lambda:nodejs12.x image
- If some file fails to be converted to PDF, try converting it to PDF on your computer first. This might be an issue with LibreOffice itself

***
**Info**
- https://github.com/shelfio/aws-lambda-libreoffice
- https://github.com/shelfio/libreoffice-lambda-layer
- https://github.com/shelfio/libreoffice-lambda-layer/issues/33#issuecomment-843177459