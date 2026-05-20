/**
 * Utility to optimize images using Canvas API
 */

export const optimizeImage = (file: File): Promise<{ webp: Blob; png?: Blob }> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      resolve({ webp: file })
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new window.Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        const maxDimension = 512

        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        
        // Generate WebP
        canvas.toBlob(
          (webpBlob) => {
            if (!webpBlob) {
              reject(new Error('WebP optimization failed'))
              return
            }

            // Also generate PNG for OG compatibility
            canvas.toBlob(
              (pngBlob) => {
                resolve({ 
                  webp: webpBlob, 
                  png: pngBlob || undefined 
                })
              },
              'image/png'
            )
          },
          'image/webp',
          0.8
        )
      }
    }
    reader.onerror = reject
  })
}
