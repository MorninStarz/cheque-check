import bcrypt from 'bcrypt';

export async function cryptPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
  return hashedPassword;
}

export async function comparePassword(plainPass, hashword) {
  const comparedPassword = await new Promise((resolve, reject) => {
    bcrypt.compare(plainPass, hashword, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
  return comparedPassword;
}

export default {
  cryptPassword,
  comparePassword
};
