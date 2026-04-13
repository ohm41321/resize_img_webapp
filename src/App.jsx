import { useState, useCallback } from 'react'
import JSZip from 'jszip'

function App() {
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [imageResults, setImageResults] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const handleImageFiles = useCallback((fileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)

    const newPreviews = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push({ name: file.name, data: e.target.result })
        if (newPreviews.length === files.length) {
          setImagePreviews([...imagePreviews, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }, [imageFiles, imagePreviews])

  const removeImage = (index) => {
    const newFiles = [...imageFiles]
    const newPreviews = [...imagePreviews]
    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-500', 'bg-gray-900')
    const files = e.dataTransfer.files
    const images = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (images.length > 0) {
      handleImageFiles(images)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-blue-500', 'bg-gray-900')
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('border-blue-500', 'bg-gray-900')
  }

  const processImages = async () => {
    if (imageFiles.length === 0) return

    setProcessing(true)
    setProgress(0)

    try {
      const formData = new FormData()
      imageFiles.forEach(file => {
        formData.append('files', file)
      })

      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText)
          setImageResults(result)
        } else {
          alert('Error processing images')
        }
        setProcessing(false)
        setProgress(0)
      }

      xhr.onerror = () => {
        alert('Network error')
        setProcessing(false)
        setProgress(0)
      }

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    } catch (error) {
      alert('Error: ' + error.message)
      setProcessing(false)
      setProgress(0)
    }
  }

  const downloadSingle = async (base64Data, filename) => {
    const link = document.createElement('a')
    link.href = base64Data
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllImages = async () => {
    if (!imageResults || !imageResults.files || imageResults.files.length === 0) return

    const zip = new JSZip()
    
    for (const file of imageResults.files) {
      const base64Data = file.base64
      const base64String = base64Data.split(',')[1]
      zip.file(file.reduced, base64String, { base64: true })
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const url = window.URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reduced_images.zip'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const resetAll = () => {
    setImageFiles([])
    setImagePreviews([])
    setImageResults(null)
    setProgress(0)
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-gray-800 px-6 py-4 backdrop-blur-sm bg-black/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md animate-pulse"></div>
            <span className="font-semibold text-white">Image Size Reducer</span>
          </div>
          {imageResults && (
            <button
              onClick={resetAll}
              className="text-sm text-gray-400 hover:text-white transition-all duration-200 hover:scale-105"
            >
              Upload More
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {!imageResults ? (
          <>
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-4">
                Reduce Image Size
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Upload multiple images and get optimized versions with smaller file sizes instantly
              </p>
            </div>

            <div
              className="border-2 border-dashed border-gray-800 rounded-xl p-16 text-center cursor-pointer transition-all duration-300 hover:border-gray-600 hover:bg-gray-900/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('imageInput').click()}
            >
              <div className="text-6xl mb-4 opacity-50 animate-bounce">🖼️</div>
              <p className="text-lg text-gray-400">
                Drag & drop images or <span className="text-blue-500 underline">browse</span>
              </p>
              <p className="text-sm text-gray-600 mt-3">Supports JPG, PNG, WEBP</p>
              <input
                id="imageInput"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageFiles(e.target.files)}
              />
            </div>

            {imagePreviews.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-6">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-800 animate-slide-up hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300" style={{animationDelay: `${index * 50}ms`}}>
                      <img src={preview.data} alt={preview.name} className="w-full h-28 object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(index)
                        }}
                        className="absolute top-2 right-2 bg-black/70 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-center text-gray-500 mt-4 text-sm animate-fade-in">
                  {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''} selected
                </p>
              </>
            )}

            <div className="text-center mt-8">
              <button
                onClick={processImages}
                disabled={imageFiles.length === 0 || processing}
                className="bg-white text-black px-6 py-3 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg hover:shadow-white/20 active:scale-95"
              >
                {processing ? 'Processing...' : 'Reduce Images →'}
              </button>
            </div>

            {processing && (
              <div className="mt-10 text-center animate-fade-in">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  <p className="text-gray-400">Processing images...</p>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-3 font-medium animate-pulse">{progress}%</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Results</h2>
                <p className="text-gray-400">
                  {imageResults.processed} image{imageResults.processed !== 1 ? 's' : ''} processed • 
                  Saved {imageResults.savings}% overall
                </p>
              </div>
              <button
                onClick={downloadAllImages}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
              >
                📦 Download All (ZIP)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {imageResults.files.map((file, index) => {
                const savingsPercent = file.savings.toFixed(1)
                return (
                  <div key={index} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all duration-300 animate-scale-in hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1" style={{animationDelay: `${index * 100}ms`}}>
                    <div className="relative overflow-hidden">
                      <img
                        src={file.base64}
                        alt={file.original}
                        className="w-full h-48 object-cover bg-gray-900 transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-white mb-3 truncate" title={file.original}>
                        {file.original}
                      </p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-gray-900 rounded-lg p-2 text-center transform hover:scale-105 transition-transform duration-200">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Original</p>
                          <p className="text-sm font-semibold text-white">{formatSize(file.original_size)}</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-2 text-center transform hover:scale-105 transition-transform duration-200">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Reduced</p>
                          <p className="text-sm font-semibold text-green-500">{formatSize(file.reduced_size)}</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-2 text-center transform hover:scale-105 transition-transform duration-200">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Saved</p>
                          <p className="text-sm font-semibold text-blue-500">{savingsPercent}%</p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadSingle(file.base64, file.reduced)}
                        className="w-full bg-transparent border border-gray-800 text-white px-4 py-2.5 rounded-lg text-sm hover:border-blue-500 hover:bg-gray-900 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-gray-800 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p className="mb-2">Made with ❤️ by <a href="https://github.com/ohm41321" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">ohm41321</a></p>
          <p>
            <a href="https://tipme.in.th/athitfkm" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-yellow-400 transition-colors inline-flex items-center gap-1">
              ☕ Donate
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
