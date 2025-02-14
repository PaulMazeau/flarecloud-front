import { useState, useEffect } from 'react'
import { fileService } from '../services/api'

interface File {
  id: number
  name: string
  type: string
  size: string
  lastModified: string
  isFolder: boolean
  parentId: number | null
  Path: string
}

export default function Dashboard() {
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<File[]>([])
  const [draggedItem, setDraggedItem] = useState<File | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  const [files, setFiles] = useState<File[]>([
    {
      id: 1,
      name: 'Dossier',
      type: 'Dossier',
      size: '-',
      lastModified: '2024-03-20',
      isFolder: true,
      parentId: null,
      Path: ''
    },
    {
      id: 2,
      name: 'document.pdf',
      type: 'PDF',
      size: '2.5 MB',
      lastModified: '2024-03-20',
      isFolder: false,
      parentId: null,
      Path: ''
    }
  ])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  const loadFiles = async () => {
    try {
      const response = await fileService.listFiles(currentFolderId?.toString());
      console.log('Réponse de l\'API:', response);
      
      const formattedFiles = [];

      // Traitement des dossiers
      if (response.folders) {
        const formattedFolders = response.folders.map((folder: { ID: any; Name: any; CreatedAt: string | number | Date; parent_id: string }) => ({
          id: folder.ID,
          name: folder.Name,
          type: 'Dossier',
          size: '-',
          lastModified: new Date(folder.CreatedAt).toISOString().split('T')[0],
          isFolder: true,
          parentId: folder.parent_id === "000000000000000000000000" ? null : folder.parent_id,
          Path: ''
        }));
        formattedFiles.push(...formattedFolders);
      }

      // Traitement des fichiers
      if (response.files) {
        const formattedFilesList = response.files.map((file: { ID: any; Name: any; Type: any; Size: number; CreatedAt: string | number | Date; parent_id: string; Path: string }) => ({
          id: file.ID,
          name: file.Name,
          type: file.Type.split('/')[1].toUpperCase(),
          size: formatFileSize(file.Size),
          lastModified: new Date(file.CreatedAt).toISOString().split('T')[0],
          isFolder: false,
          parentId: file.parent_id === "000000000000000000000000" ? null : file.parent_id,
          Path: file.Path
        }));
        formattedFiles.push(...formattedFilesList);
      }

      // Mise à jour du fil d'Ariane si l'historique est présent
      if (response.history) {
        setBreadcrumb(response.history.map((item: { ID: any; Name: any; parent_id: string }) => ({
          id: item.ID,
          name: item.Name,
          type: 'Dossier',
          size: '-',
          lastModified: '',
          isFolder: true,
          parentId: item.parent_id === "000000000000000000000000" ? null : item.parent_id,
          Path: ''
        })));
      }

      setFiles(formattedFiles);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const handleDelete = async (id: number) => {
    const fileToDelete = files.find(f => f.id === id);
    if (!fileToDelete) return;

    try {
      if (fileToDelete.isFolder) {
        await fileService.deleteFolder(fileToDelete.id.toString());
      } else {
        await fileService.deleteFile(fileToDelete.Path);
      }
      await loadFiles();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleDownload = (file: File) => {
    if (file.isFolder) {
      alert('Impossible de télécharger un dossier')
      return
    }
    
    if (!file.Path) {
      alert('Chemin du fichier non disponible')
      return
    }
    
    fileService.downloadFile(file.Path)
  }

  const handleEdit = (file: File) => {
    setSelectedFile(file)
    setNewFileName(file.name)
    setIsEditing(true)
  }

  const isNameTaken = (name: string, isFolder: boolean, parentId: number | null, currentFileId?: number) => {
    return files.some(file => {
      if (currentFileId && file.id === currentFileId) {
        return false
      }
      
      if (isFolder) {
        return file.isFolder && 
               file.name.toLowerCase() === name.toLowerCase() && 
               file.parentId === parentId
      }
      
      const getFileNameAndExt = (fileName: string) => {
        const lastDotIndex = fileName.lastIndexOf('.')
        if (lastDotIndex === -1) return [fileName, '']
        return [
          fileName.substring(0, lastDotIndex),
          fileName.substring(lastDotIndex)
        ]
      }
      
      const [newName, newExt] = getFileNameAndExt(name)
      const [existingName, existingExt] = getFileNameAndExt(file.name)
      
      return !file.isFolder && 
             newName.toLowerCase() === existingName.toLowerCase() && 
             newExt.toLowerCase() === existingExt.toLowerCase() && 
             file.parentId === parentId
    })
  }

  const handleUpdate = () => {
    if (selectedFile && newFileName.trim()) {
      if (isNameTaken(newFileName, selectedFile.isFolder, selectedFile.parentId, selectedFile.id)) {
        alert(selectedFile.isFolder 
          ? 'Un dossier avec ce nom existe déjà dans ce répertoire.' 
          : 'Un fichier avec ce nom existe déjà dans ce répertoire.')
        return
      }

      setFiles(files.map(file => 
        file.id === selectedFile.id 
          ? { ...file, name: newFileName }
          : file
      ))
      setIsEditing(false)
      setSelectedFile(null)
    }
  }

  const getCurrentFolderFiles = () => {
    const currentFiles = files.filter(file => file.parentId === currentFolderId)
    console.log('Dossier actuel:', currentFolderId)
    console.log('Fichiers filtrés:', currentFiles)
    return currentFiles
  }

  const updateBreadcrumb = (folderId: number | null) => {
    if (folderId === null) {
      setBreadcrumb([])
      return
    }

    const breadcrumbPath: File[] = []
    let currentFolder = files.find(f => f.id === folderId)
    
    while (currentFolder) {
      breadcrumbPath.unshift(currentFolder)
      currentFolder = files.find(f => f.id === currentFolder?.parentId)
    }
    
    setBreadcrumb(breadcrumbPath)
  }

  const handleFolderClick = (folder: File) => {
    setCurrentFolderId(folder.id)
    updateBreadcrumb(folder.id)
  }

  const handleBreadcrumbClick = (folder: File | null) => {
    setCurrentFolderId(folder?.id ?? null)
    updateBreadcrumb(folder?.id ?? null)
  }

  const handleAdd = () => {
    let baseName = 'Nouveau fichier'
    let extension = '.txt'
    let counter = 1
    let newName = `${baseName}${extension}`

    while (isNameTaken(newName, false, currentFolderId)) {
      newName = `${baseName} (${counter})${extension}`
      counter++
    }

    const newFile: File = {
      id: Math.max(...files.map(f => f.id)) + 1,
      name: newName,
      type: 'TXT',
      size: '0 KB',
      lastModified: new Date().toISOString().split('T')[0],
      isFolder: false,
      parentId: currentFolderId,
      Path: ''
    }
    setFiles([...files, newFile])
  }

  const handleAddFolder = async () => {
    let baseName = 'Nouveau dossier'
    let counter = 1
    let newName = baseName

    while (isNameTaken(newName, true, currentFolderId)) {
      newName = `${baseName} (${counter})`
      counter++
    }

    try {
      await fileService.createFolder(newName, currentFolderId?.toString())
      loadFiles() // Recharger la liste après création
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error)
    }
  }

  const handleDragStart = (file: File, e: React.DragEvent) => {
    setDraggedItem(file)
    // Rendre l'élément traîné semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
    setDraggedItem(null)
    setDropTarget(null)
  }

  const handleDragOver = (e: React.DragEvent, targetId: number | null) => {
    e.preventDefault()
    setDropTarget(targetId)
  }

  const handleDrop = (e: React.DragEvent, targetId: number | null) => {
    e.preventDefault()
    
    if (!draggedItem) return

    if (draggedItem.id === targetId) return

    const isSubfolder = (parentId: number | null, targetId: number): boolean => {
      if (parentId === targetId) return true
      const parent = files.find(f => f.id === parentId)
      if (!parent) return false
      return isSubfolder(parent.parentId, targetId)
    }

    if (draggedItem.isFolder && targetId && isSubfolder(targetId, draggedItem.id)) {
      alert("Impossible de déplacer un dossier dans l'un de ses sous-dossiers")
      return
    }

    if (isNameTaken(draggedItem.name, draggedItem.isFolder, targetId)) {
      alert("Un élément avec ce nom existe déjà dans ce dossier")
      return
    }

    setFiles(files.map(file => 
      file.id === draggedItem.id 
        ? { ...file, parentId: targetId }
        : file
    ))

    setDraggedItem(null)
    setDropTarget(null)
  }

  const handleWindowDragEnter = (e: globalThis.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer?.types.includes('Files')) {
      setIsDraggingFile(true)
    }
  }

  const handleWindowDragLeave = (e: globalThis.DragEvent) => {
    e.preventDefault()
    if (e.clientY <= 0 || e.clientX <= 0 || 
        e.clientY >= window.innerHeight || 
        e.clientX >= window.innerWidth) {
      setIsDraggingFile(false)
    }
  }

  const handleWindowDrop = async (e: globalThis.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(false)

    if (e.dataTransfer?.files) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      
      try {
        for (const file of droppedFiles) {
          await fileService.uploadFile(file, currentFolderId?.toString())
        }
        loadFiles() // Recharger la liste après upload
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('dragenter', handleWindowDragEnter)
    window.addEventListener('dragleave', handleWindowDragLeave)
    window.addEventListener('dragover', e => e.preventDefault())
    window.addEventListener('drop', handleWindowDrop)

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter)
      window.removeEventListener('dragleave', handleWindowDragLeave)
      window.removeEventListener('dragover', e => e.preventDefault())
      window.removeEventListener('drop', handleWindowDrop)
    }
  }, [])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestionnaire de fichiers</h1>
            <nav className="flex mt-3" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li
                  onDragOver={(e) => handleDragOver(e, null)}
                  onDrop={(e) => handleDrop(e, null)}
                  className={`${dropTarget === null ? 'bg-gray-100 rounded' : ''}`}
                >
                  <button
                    onClick={() => handleBreadcrumbClick(null)}
                    className="text-gray-600 hover:text-gray-900 px-2 py-1"
                  >
                    Accueil
                  </button>
                </li>
                {breadcrumb.map((folder) => (
                  <li 
                    key={folder.id} 
                    className="flex items-center"
                    onDragOver={(e) => handleDragOver(e, folder.id)}
                    onDrop={(e) => handleDrop(e, folder.id)}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <button
                      onClick={() => handleBreadcrumbClick(folder)}
                      className={`ml-2 text-gray-600 hover:text-gray-900 px-2 py-1 rounded ${
                        dropTarget === folder.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      {folder.name}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleAddFolder}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l7 7v9a2 2 0 01-2 2z" />
              </svg>
              Nouveau dossier
            </button>
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nouveau fichier
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Taille</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Modifié le</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {getCurrentFolderFiles().map(file => (
                  <tr
                    key={file.id}
                    draggable
                    onDragStart={(e) => handleDragStart(file, e)}
                    onDragEnd={handleDragEnd}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      draggedItem?.id === file.id ? 'opacity-40' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {isEditing && selectedFile?.id === file.id ? (
                        <div>
                          <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      ) : (
                        <div 
                          className={`flex items-center cursor-pointer ${
                            file.isFolder ? 'hover:bg-gray-100 rounded p-2' : 'mx-2'
                          }`}
                          onClick={() => file.isFolder ? handleFolderClick(file) : null}
                          onDragOver={(e) => file.isFolder ? handleDragOver(e, file.id) : undefined}
                          onDrop={(e) => file.isFolder ? handleDrop(e, file.id) : undefined}
                          style={{
                            backgroundColor: dropTarget === file.id ? 'rgba(79, 70, 229, 0.1)' : undefined,
                            border: dropTarget === file.id ? '2px dashed #4F46E5' : undefined
                          }}
                        >
                          <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {file.isFolder ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            )}
                          </svg>
                          {file.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{file.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{file.size}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{file.lastModified}</td>
                    <td className="px-6 py-4 text-right">
                      {isEditing && selectedFile?.id === file.id ? (
                        <button
                          onClick={handleUpdate}
                          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Sauvegarder
                        </button>
                      ) : (
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(file)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-900 focus:outline-none"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDownload(file)}
                            className="text-sm font-medium text-green-600 hover:text-green-900 focus:outline-none"
                          >
                            Télécharger
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-900 focus:outline-none"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isDraggingFile && (
        <div 
          className="fixed inset-0 bg-indigo-500/30 backdrop-blur-sm z-50"
          onDragLeave={(e: React.DragEvent) => setIsDraggingFile(false)}
          onDrop={(e: React.DragEvent) => {
            e.preventDefault()
            setIsDraggingFile(false)
          }}
          onDragOver={(e: React.DragEvent) => e.preventDefault()}
        >
          <div className="absolute inset-4 border-2 border-indigo-500 border-dashed flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
              <svg 
                className="w-16 h-16 mx-auto text-indigo-500 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V8"
                />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Déposez vos fichiers ici
              </h3>
              <p className="text-gray-500">
                Relâchez pour ajouter les fichiers à votre gestionnaire
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 