const API_URL = 'http://localhost:8080';

export const fileService = {
  async uploadFile(file: File, parentId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) {
      formData.append('parentId', parentId);
    }

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

  async createFolder(folderName: string, parentId?: string) {
    try {
      const url = new URL(`${API_URL}/create-folder`);
      url.searchParams.append('folder', folderName);
      if (parentId) {
        url.searchParams.append('parentId', parentId);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      throw error;
    }
  },

  async listFiles(parentId?: string) {
    try {
      const url = new URL(`${API_URL}/list`);
      if (parentId) {
        url.searchParams.append('parentId', parentId);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la liste des fichiers:', error);
      throw error;
    }
  },

  async deleteFile(filePath: string) {
    try {
      const response = await fetch(`${API_URL}/delete?path=${filePath}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw error;
    }
  },

  async deleteFolder(folderId: string) {
    try {
      const response = await fetch(`${API_URL}/delete-folder?id=${folderId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression du dossier:', error);
      throw error;
    }
  },

  downloadFile(fileName: string) {
    window.open(`${API_URL}/download?path=${fileName}`, '_blank');
  }
}; 