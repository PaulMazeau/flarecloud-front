export interface User {
  id: string;
  email: string;
  name: string;
}

export const authService = {
  isAuthenticated: false,
  currentUser: null as User | null,

  login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simuler une requête API
      setTimeout(() => {
        if (email === "test@example.com" && password === "password") {
          const user = {
            id: "1",
            email: "test@example.com",
            name: "Utilisateur Test"
          };
          this.isAuthenticated = true;
          this.currentUser = user;
          localStorage.setItem('user', JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Identifiants invalides"));
        }
      }, 500);
    });
  },

  logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('user');
        resolve();
      }, 300);
    });
  },

  checkAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      const user = localStorage.getItem('user');
      if (user) {
        this.isAuthenticated = true;
        this.currentUser = JSON.parse(user);
      }
      resolve(this.isAuthenticated);
    });
  }
}; 