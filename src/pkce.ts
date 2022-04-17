import crypto from 'crypto';
import {Dropbox} from "dropbox";

// https://www.dropbox.com/developers/apps/info/a8d7xeudgtwwwwq
const appKey = 'a8d7xeudgtwwwwq';
const redirectUri = `http://localhost:3000`;

const base64Encode = (buffer: Buffer):string =>
  buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

export const getCodeVerifier = (): string|null => localStorage.getItem('codeVerifier')

export const createCodeVerifier = (): string => {
  const codeVerifier = base64Encode(crypto.randomBytes(32));
  console.log("created codeVerifier", codeVerifier);
  localStorage.setItem('codeVerifier', codeVerifier);
  return codeVerifier;
}

export const dropboxOauthUrl = (codeVerifier: string) => {
  const sha256 = (str: string) => crypto.createHash('sha256').update(str).digest()
  const codeChallenge = base64Encode(sha256(codeVerifier));

  return `https://www.dropbox.com/oauth2/authorize?client_id=${appKey}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256&redirect_uri=${redirectUri}`;
}

export const getAccessToken = async (authCode: string, codeVerifier: string):Promise<string> => {
  const formData = new FormData();
  formData.set('code', authCode);
  formData.set('grant_type', 'authorization_code');
  formData.set('client_id', appKey);
  formData.set('code_verifier', codeVerifier);
  formData.set('redirect_uri', redirectUri);

  return fetch('https://api.dropbox.com/oauth2/token', {
    method: 'POST',
    body: formData
  }).then(res => res.json()).then(json => json.access_token);
};

export const writeFile = async (accessToken: string) => {
  const contents = "hello world!"
  const dbx = new Dropbox({ accessToken });
  return dbx.filesUpload({ path: '/basic.js', contents })
    .then((response: any) => {
      console.log(response);
    })
}
