'use strict';

var WIT_TOKEN = process.env.WIT_TOKEN || '';
if (!WIT_TOKEN) {
    throw new Error('Missing WIT_TOKEN. Go to https://wit.ai/docs/quickstart to get one.')
}

var FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN || '';
if (!FB_PAGE_TOKEN) {
    throw new Error('Missing FB_PAGE_TOKEN. Go to https://developers.facebook.com/docs/pages/access-tokens to get one.')
}

var FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || ''

module.exports = {
    WIT_TOKEN: WIT_TOKEN,
    FB_PAGE_TOKEN: FB_PAGE_TOKEN,
    FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
}
