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

  async downloadFile(filePath: string) {
    let fileName = filePath.split('/').pop() || '';
    console.log('Nom de fichier original:', fileName);
    
    fileName = fileName.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}.*/i, '');
    
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      const name = fileName.substring(0, lastDotIndex);
      const extension = fileName.substring(lastDotIndex);
      fileName = name + extension;
    }
    
    try {
      const response = await fetch(`${API_URL}/download?path=${encodeURIComponent(filePath)}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.trim();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  },

  async updateFile(fileId: string, updates: { name: string; parentId: string }) {
    try {
      const url = new URL(`${API_URL}/update-file`);
      url.searchParams.append('id', fileId);
      url.searchParams.append('name', updates.name);
      url.searchParams.append('parent_id', updates.parentId);

      const response = await fetch(url.toString(), {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fichier:', error);
      throw error;
    }
  }
}; 