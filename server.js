import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { createServer as createHttpServer } from 'node:http'
import busboy from 'busboy'
import sharp from 'sharp'

async function startServer() {
  const vite = await createServer({
    plugins: [react()],
    server: {
      port: 3000,
      middlewareMode: true
    }
  })

  const server = createHttpServer(async (req, res) => {
    // Handle API routes
    if (req.url === '/api/upload' && req.method === 'POST') {
      const bb = busboy({ headers: req.headers })
      const files = []

      bb.on('file', (name, file, info) => {
        const { filename, mimeType } = info
        
        if (!mimeType || !mimeType.startsWith('image/')) {
          file.resume()
          return
        }

        const chunks = []
        file.on('data', (data) => {
          chunks.push(data)
        })
        
        file.on('close', () => {
          const buffer = Buffer.concat(chunks)
          files.push({
            name: filename || 'image.jpg',
            type: mimeType,
            buffer
          })
        })
      })

      bb.on('close', async () => {
        try {
          if (files.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ error: 'No image files uploaded' }))
          }

          const processedFiles = []
          let totalOriginalSize = 0
          let totalReducedSize = 0

          for (const file of files) {
            try {
              totalOriginalSize += file.buffer.length

              const processedImage = sharp(file.buffer)
                .resize(1920, 1080, {
                  fit: 'inside',
                  withoutEnlargement: true
                })
                .jpeg({
                  quality: 85,
                  mozjpeg: true,
                  progressive: true
                })

              const outputBuffer = await processedImage.toBuffer()
              const base64 = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`

              const baseName = file.name.split('.').slice(0, -1).join('.') || file.name
              const outputFileName = `${baseName}_reduced.jpg`

              const reducedSize = outputBuffer.length
              totalReducedSize += reducedSize

              const savings = file.buffer.length > 0
                ? ((file.buffer.length - reducedSize) / file.buffer.length) * 100
                : 0

              processedFiles.push({
                original: file.name,
                reduced: outputFileName,
                original_size: file.buffer.length,
                reduced_size: reducedSize,
                savings: Math.round(savings * 100) / 100,
                base64
              })
            } catch (error) {
              console.error(`Error processing ${file.name}:`, error)
            }
          }

          const overallSavings = totalOriginalSize > 0
            ? ((totalOriginalSize - totalReducedSize) / totalOriginalSize) * 100
            : 0

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            processed: processedFiles.length,
            original_size: totalOriginalSize,
            reduced_size: totalReducedSize,
            savings: Math.round(overallSavings * 100) / 100,
            files: processedFiles
          }))
        } catch (error) {
          console.error('Error processing files:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Failed to process images', message: error.message }))
        }
      })

      req.pipe(bb)
    } else {
      // Let Vite handle other routes
      return vite.middlewares(req, res)
    }
  })

  server.listen(3000, () => {
    console.log('🚀 Server running at http://localhost:3000')
  })
}

startServer()
