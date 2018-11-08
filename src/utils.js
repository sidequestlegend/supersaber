const BASE_URL = 'https://saber.supermedium.com';

function getS3FileUrl (id, name) {
  return `${BASE_URL}/${id}-${name}`;
}
module.exports.getS3FileUrl = getS3FileUrl;
