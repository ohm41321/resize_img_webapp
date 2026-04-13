import express from 'express'
import busboy from 'busboy'
import sharp from 'sharp'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())

app.post('/api/upload', (req, res) => {
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
        return res.status(400).json({ error: 'No image files uploaded' })
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

      res.json({
        processed: processedFiles.length,
        original_size: totalOriginalSize,
        reduced_size: totalReducedSize,
        savings: Math.round(overallSavings * 100) / 100,
        files: processedFiles
      })
    } catch (error) {
      console.error('Error processing files:', error)
      res.status(500).json({ error: 'Failed to process images', message: error.message })
    }
  })

  req.pipe(bb)
})

app.listen(PORT, () => {
  console.log(`🖼️  API Server running at http://localhost:${PORT}`)
})
