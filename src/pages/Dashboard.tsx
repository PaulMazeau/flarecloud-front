import { useState } from 'react'

interface File {
  id: number
  name: string
  type: string
  size: string
  lastModified: string
  isFolder: boolean
  parentId: number | null
}

export default function Dashboard() {
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<File[]>([])
  const [draggedItem, setDraggedItem] = useState<File | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)

  const [files, setFiles] = useState<File[]>([
    {
      id: 1,
      name: 'Dossier',
      type: 'Dossier',
      size: '-',
      lastModified: '2024-03-20',
      isFolder: true,
      parentId: null
    },
    {
      id: 2,
      name: 'document.pdf',
      type: 'PDF',
      size: '2.5 MB',
      lastModified: '2024-03-20',
      isFolder: false,
      parentId: null
    }
  ])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  const handleDelete = (id: number) => {
    const deleteRecursively = (parentId: number) => {
      const itemsToDelete = files.filter(file => file.parentId === parentId).map(f => f.id)
      itemsToDelete.forEach(id => deleteRecursively(id))
      setFiles(files => files.filter(file => !itemsToDelete.includes(file.id)))
    }

    deleteRecursively(id)
    setFiles(files => files.filter(file => file.id !== id))
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
    return files.filter(file => file.parentId === currentFolderId)
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
      parentId: currentFolderId
    }
    setFiles([...files, newFile])
  }

  const handleAddFolder = () => {
    let baseName = 'Nouveau dossier'
    let counter = 1
    let newName = baseName

    while (isNameTaken(newName, true, currentFolderId)) {
      newName = `${baseName} (${counter})`
      counter++
    }

    const newFolder: File = {
      id: Math.max(...files.map(f => f.id)) + 1,
      name: newName,
      type: 'Dossier',
      size: '-',
      lastModified: new Date().toISOString().split('T')[0],
      isFolder: true,
      parentId: currentFolderId
    }
    setFiles([...files, newFolder])
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
    </div>
  )
} 