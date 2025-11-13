import Cryptr from "cryptr"

const cryptr = new Cryptr(process.env.ENCRYPTION_KEY!);

export const encrypt = (text: string): string => {
  return cryptr.encrypt(text);
};

export const decrypt = (text: string): string => {
  return cryptr.decrypt(text);
};