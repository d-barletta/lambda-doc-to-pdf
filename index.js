const {writeFileSync, readFileSync, unlinkSync} = require('fs');
const {parse} = require('path');
const {S3} = require('aws-sdk');
const {convertTo, canBeConvertedToPDF} = require('@shelf/aws-lambda-libreoffice');
const DEFAULT_S3 = new S3({params: {Bucket: 'nsi-lambda-libreoffice'}});

exports.handler = async event => {
  const RESPONSE = {
    body: '',
    headers: {
      'Content-Type': 'text/plain',
    },
    statusCode: 200,
  };

  try {
    if (!event.body) {
      RESPONSE.statusCode = 404;
      RESPONSE.body = 'Missing required body';
      return RESPONSE;
    }

    const CONFIGURATION = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    let filename = CONFIGURATION.filename;

    if (!filename) {
      RESPONSE.statusCode = 404;
      RESPONSE.body = 'Missing file name parameter';
      return RESPONSE;
    }

    const CONVERT_TO = CONFIGURATION.convertTo || 'pdf';
    let inputFileBuffer;

    if (CONFIGURATION.otherBucket) {
      const OTHER_S3 = new S3({params: {Bucket: CONFIGURATION.otherBucket}});
      inputFileBuffer = (await OTHER_S3.getObject({Key: filename}).promise()).Body;
    } else {
      inputFileBuffer = (await DEFAULT_S3.getObject({Key: filename}).promise()).Body;
    }

    if (parse(filename).base) filename = parse(filename).base;
    writeFileSync(`/tmp/${filename}`, inputFileBuffer);

    if (!canBeConvertedToPDF(filename)) {
      RESPONSE.statusCode = 422;
      RESPONSE.body = 'Sorry, unable to covert this file';
      return RESPONSE;
    }

    const outputFilename = await convertTo(filename, CONVERT_TO);
    const outputFileBuffer = readFileSync(outputFilename);
    RESPONSE.body = outputFileBuffer.toString('base64');
    RESPONSE.statusCode = 200;
  } catch (e) {
    RESPONSE.statusCode = 500;
    RESPONSE.body = JSON.stringify(e);
  }

  //try to delete temp file
  try {
    unlinkSync(outputFilename);
  } catch (e) {
    console.log('Unable to delete temp file');
  }

  return RESPONSE;
};
