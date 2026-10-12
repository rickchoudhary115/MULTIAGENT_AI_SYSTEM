// import {cert,initializeApp} from "firebase-admin";

// import serviceAccount from"../serviceAccountKey.json" with{type:"json"};

// export const app = initializeApp({
//   credential: cert(serviceAccount)
// });
import { cert, initializeApp } from "firebase-admin";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, "\n"),
};

export const app = initializeApp({
  credential: cert(serviceAccount),
});
