const API_URL = 'http://localhost:8080';

export const fileService = {
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      throw error;
    }
  },

  async deleteFile(fileName: string) {
    try {
      const response = await fetch(`${API_URL}/delete?file=${fileName}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  },

  async listFiles() {
    try {
      const response = await fetch(`${API_URL}/list`);
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Réponse du serveur:', errorText);
        throw new Error(`Erreur serveur: ${errorText}`);
      }
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data;
      }
      
      if (data.success === false) {
        throw new Error(data.error || 'Erreur inconnue');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Erreur détaillée:', error);
      throw error;
    }
  },

  downloadFile(fileName: string) {
    window.open(`${API_URL}/download?file=${fileName}`, '_blank');
  }
}; 