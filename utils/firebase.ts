import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import * as admin from "firebase-admin";


// Your web app's Firebase configuration (Client SDK)
const firebaseConfig = {
    apiKey: "AIzaSyBZgG3CLTl1CGSSiMBJVIemFGDL51FpUJU",
    authDomain: "booking-app-6a26a.firebaseapp.com",
    projectId: "booking-app-6a26a",
    storageBucket: "booking-app-6a26a.firebasestorage.app",
    messagingSenderId: "639231971358",
    appId: "1:639231971358:web:c131045504746b166fde0f"
};

// Initialize Firebase (Client SDK)
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: "booking-app-6a26a",
                clientEmail: "firebase-adminsdk-fbsvc@booking-app-6a26a.iam.gserviceaccount.com",
                privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC8Qena8OEfvbvp\nVGnibTBt87m1wZ6i4CKQgeIJnKvRJxzq/5WWXKKXDPbgVSdnzGIEXWfEAvC98m0m\nNaX0aEl12iHyherKmIJLt2+4ELwZHpg90U6l7Cg/3Mu77Zu8plkEugniiZxCxpaa\n/fxGuNim9XVcW5YcrSL3E4KCoByw9RZssq8Xz3RORLMCEGrRPSTZH6BFHnHxyZxT\nHw4+RJryhhWBQJT7/c4zJJZ4zAENvY5wnBDicHX3UigIHeeOHa2bo0i1TUmpdqAu\nVw2+ZdVqTOWc9EajoIujplIG+o6fRFcflp1f/Cj13Nwxs+yDFrE9WMgXH2wVecy5\naQAOVv1lAgMBAAECggEAM6U1fY3VhLqtYW55+dcQkSlqyhUK6w3oDZLEKvTjIebE\nBSgGppBVPnEdDR/vRoeIYEArpldUKhfmn7PaCjnN5VnpNDpO1jOOky0IpgtZPt7o\nzxSrqdMmm5Z8AdtGfTN5elV7Pr2Xs639RRnmapRtQyhVgPfTL5zD2dptVF6OYHDy\nrWsLQyxW/GlTbWwUaKPsc5LrsStShpxS0/UIhg+sPIG+74RL1Y+ovYJq9Bhuh6SI\n0fMr7miuLTwGXOnDFOdwiIs2FcvX4J/MeYPOcOeEBEKkNlZaw1ybrt80jKVwcCsH\nVox6bX+FdggUL0h7hg0nsA37jYZxQSENi3aF5V3VRQKBgQD6cbMatRwC8Ld5xhHn\nJqPf2lTk9zEis9ysxcFDvrukKAud7A8dOO5BfcMba8lheKR5cL05y89QNEtnd2Ja\ncxe5LfWPzGzwRZQlthBqEZEpcI6oId+isfJg6pBJ/EJpMc/HeWZJJCK06YzivqLG\npNop7rX65LFIu36ifoV8LryOawKBgQDAbwx/sYTAXbQu7dR70yVryf0wt2/Bfska\nxv4vQ9t1qAjvQaaTxZLw+dpj58jRrG88EF+W5Dcd5zf3pF2+7pc2kWv1WnmMqFXa\nsP/b1lLFoxrM0sxKnRisN+YRq2BR4wTLFozPg5I3jbxX1WQQO1H9fIvwh9IRwiXm\nfRHiyoT3bwKBgQDuHr0UX67KfOV2OwU6qlqVtJmTOhTV0f23qC8hom/2nLyu4otc\nVYzzaAfiQpGuw25eqPrBwS7UK2Smc7RoG5Yq06/vkYbizMUXNgxVTW6f4A1DfzGL\nF3ZE/8FBF0BtlJbiKmM+l8UIDieOT4OlK4ji5bzRWC/X362AApwYfrd5EQKBgCFP\n1/kO8O0gC34IO71HuvWi3MqfJqB3YzbYdc4W0BnZAdrxIXX5QMuoZO7gg/oQAJ2E\nNBf537S0fxLGiFfyE4kluWuawunfhiU6eMBEpMWDy7LjVuwfr9K4RoKOiTkDtKO3\nfp65pwko5w7JaO4KZtIbylnUGUBrvIXe5sa8yjHPAoGBALfkqWsms981PZfnE4JO\n2PtssY1b0jW+c84RoJb6Ik2LlFx9YQc/2gsrqoTtatHgwowDiOq3a5xsKDw2chPS\nnp3Bqq0tEKW7Uyi0tl7ku/ezhAYacMZ1bXkKifav5vyHjAe4LDzI+sf0vQcWDNBl\nKZFWmosY+HQVlG7sEJ6KqqPL\n-----END PRIVATE KEY-----\n"?.replace(/\\n/g, "\n"),
            }),
        });
        console.log("✅ Firebase Admin initialized");
    } catch (error) {
        console.error("❌ Firebase Admin initialization error:", error);
        console.log("⚠️ Please check your .env file and private key formatting");
    }
}

export const adminAuth = admin.auth();
