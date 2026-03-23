import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/constants/api';
import { saveToken, getToken, removeToken } from '@/utils/storage';
import { jwtDecode } from 'jwt-decode'; 

export interface JwtPayload {
    sub: string;
    email: string;
}

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}


interface AuthContextType{
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>; 
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children} : {children: React.ReactNode})
{
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await getToken('jwt_token');
                if(token){
                    const decoded = jwtDecode<JwtPayload>(token);

                    const resposne = await apiClient.get(`/users/${decoded.sub}`);
                    setUser(resposne.data);
                }
            } catch (error)
            {
                console.error('Problem with session: ', error);
                await removeToken('jwt_token');
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, [])


    const login = async(email: string, password: string) => {
        const response = await apiClient.post('/auth/sigin', {email: email, password: password});
        const {accessToken, user: userData} = response.data;

        await saveToken('jwt_token', accessToken);
        setUser(userData);
    }

    const register = async(email: string, password: string, username: string) => {
        const reponse = await apiClient.post('auth/signup',
            {
                email,
                password,
                firstName: username
            }
        );
        await login(email, password);
    }

    const logout = async () => {
        await removeToken('jwt_token');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{user, isLoading, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );


}


export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}