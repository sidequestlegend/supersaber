var BASE_URL = 'https://s3-us-west-2.amazonaws.com/supersaber';

function getS3FileUrl (id, name) {
  return `${BASE_URL}/${id}-${name}`;
}
module.exports.getS3FileUrl = getS3FileUrl;
