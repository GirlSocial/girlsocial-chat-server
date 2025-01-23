import * as argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
    try {
        // Configuration options for Argon2
        const hashOptions = {
            type: argon2.argon2id, // Most recommended type
            memoryCost: 2 ** 16, // 64 MB of memory
            timeCost: 3, // Number of iterations
            parallelism: 1 // Number of threads
        };

        // Hash the password
        return await argon2.hash(password, hashOptions);
    } catch (error) {
        console.error('Password hashing failed:', error);
        throw error;
    }
}

export function generateToken() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < 32; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}
