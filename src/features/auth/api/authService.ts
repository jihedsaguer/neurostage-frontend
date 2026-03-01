export const loginRequest = async (data: {
    email: string,
    password: string
}) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
   if(!response.ok) {
        throw new Error('Login failed');
   }
   return response.json();
}