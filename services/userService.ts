import { User } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// =================== REGISTER ===================
export const registerUser = async (
  username: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return { success: data.success, message: data.message };
  } catch (err) {
    console.error('registerUser error:', err);
    return { success: false, message: 'Cannot connect to server. Please try again.' };
  }
};

// =================== LOGIN ===================
export const loginUser = async (
  username: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      return { success: true, message: data.message, user: data.user };
    }
    return { success: false, message: data.message };
  } catch (err) {
    console.error('loginUser error:', err);
    return { success: false, message: 'Cannot connect to server. Please try again.' };
  }
};

// =================== GET USER ===================
export const getUserByUsername = async (username: string): Promise<User | undefined> => {
  try {
    const res = await fetch(`${API_BASE}/api/user/${username}`);
    const data = await res.json();
    if (data.success && data.user) {
      return data.user as User;
    }
    return undefined;
  } catch (err) {
    console.error('getUserByUsername error:', err);
    return undefined;
  }
};

// =================== UPDATE USER ===================
export const updateUser = async (updatedUser: User): Promise<void> => {
  try {
    await fetch(`${API_BASE}/api/user/${updatedUser.username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: updatedUser.profile,
        pathway: updatedUser.pathway,
        completedSteps: updatedUser.completedSteps,
        quizResult: updatedUser.quizResult,
      }),
    });
  } catch (err) {
    console.error('updateUser error:', err);
  }
};
