import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { fabric } from 'fabric'
import bgTemplateSrc from '../assets/template1/template1-bg.png'
import overlayTemplateSrc from '../assets/template1/template1-overlay.png'

const CanvasResult = forwardRef(
  ({ images, padding = 10, gap = 100, borderWidth = 20, borderColor = '' }, ref) => {
    const bgTemplate = bgTemplateSrc
    const overlayTemplate = overlayTemplateSrc

    const canvasRef = useRef(null)
    const fabricCanvasRef = useRef(null)
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

    /*Send Email*/
    useImperativeHandle(ref, () => ({
      exportCanvasToPNG: () => {
        if (fabricCanvasRef.current) {
          return fabricCanvasRef.current.toDataURL({ format: 'png', quality: 1 })
        }
        return null
      }
    }))

    const loadImage = (imageSrc) => {
      return new Promise((resolve) => {
        fabric.Image.fromURL(imageSrc, (img) => {
          img ? resolve(img) : (console.error('Failed to load image:', imageSrc), resolve(null))
        })
      })
    }

    useEffect(() => {
      if (!canvasRef.current) return

      const initCanvas = async () => {
        try {
          /*Load Template nya*/
          const bg = await loadImage(bgTemplate)
          /*Belum paham*/
          if (!bg) return

          /*Atur lebar & tinggi canvas -> == background size*/
          const canvasWidth = bg.width
          const canvasHeight = bg.height
          /*Atur state canvs size*/
          setCanvasSize({ width: canvasWidth, height: canvasHeight })

          // Initialize Fabric canvas
          /*Masukkan inisialisasi ke dalam ref fabricCanvasRef*/
          // Parameter pertama -> mana yang harus ia "kendali" atau jadikan sebagai area gambar
          fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight
          })

          // Add background
          /*Atur dulu posisi di canvas nya*/
          bg.set({ left: 0, top: 0, selectable: false, evented: false })
          /*baru tambahkan ke canvas*/
          fabricCanvasRef.current.add(bg)
          /*buat di layer belakang*/
          fabricCanvasRef.current.sendToBack(bg)

          // Add main images in vertical column
          /*kalau images ada isinya maka lakukan: */
          if (images.length > 0) {
            const loadedImages = await Promise.all(
              images.map(async (imgSrc) => {
                const img = await loadImage(imgSrc)
                if (!img) return null

                // Calculate scale to fit within canvas
                const maxImageWidth =
                  canvasWidth * 0.8 /*80% dari canvasWidth atau ukuran lebar bg*/
                /*Hitung tinggi 80% nya baru bagi dengan jumlah gambar yang ingin ditampilkan*/
                const maxImageHeight =
                  (canvasHeight * 0.8) /
                  images.length /*80% dari canvasHeight atau ukuran tinggi bg*/

                /*Hitung Skala*/
                const scale = Math.min(maxImageWidth / img.width, maxImageHeight / img.height)

                // *** PERUBAHAN DI SINI ***
                // Hitung lebar dan tinggi gambar setelah di-scale
                /*Ukuran baru setelah skala*/
                const scaledImageWidth = img.width * scale
                const scaledImageHeight = img.height * scale

                /*Rect -> Rectangle*/
                const borderRect = new fabric.Rect({
                  // Lebar dan tinggi borderRect sama persis dengan gambar yang sudah di-scale
                  width: scaledImageWidth,
                  height: scaledImageHeight,
                  fill: 'transparent',
                  stroke: borderColor,
                  strokeWidth: borderWidth,
                  originX: 'center',
                  originY: 'center'
                })

                img.set({
                  scaleX: scale,
                  scaleY: scale,
                  originX: 'center',
                  originY: 'center'
                })

                /*Group([Object yang dikelompokkan], {Object Options/Konfigurasi})*/
                return new fabric.Group([borderRect, img], {
                  originX: 'center',
                  originY: 'center',
                  selectable: false, // Membuat objek tidak dapat dipilih
                  hasControls: false, // Menyembunyikan kotak kontrol di sudut
                  evented: false
                })
              })
            )

            // Filter out null values
            const validImages = loadedImages.filter((img) => img !== null)

            // Calculate total height of all images with gaps
            const totalHeight = validImages.reduce((sum, img) => {
              return sum + img.getScaledHeight() + gap
            }, -gap) // Subtract last gap

            // Starting Y position to center the column
            let currentY = (canvasHeight - totalHeight) / 2

            // Position each image vertically with gap
            validImages.forEach((img) => {
              img.set({
                left: canvasWidth / 2,
                top: currentY + img.getScaledHeight() / 2
              })

              fabricCanvasRef.current.add(img)
              currentY += img.getScaledHeight() + gap
            })
          }

          // Add overlay
          const overlay = await loadImage(overlayTemplate)
          if (overlay) {
            overlay.set({ left: 0, top: 0, selectable: false, evented: false })
            fabricCanvasRef.current.add(overlay)
            fabricCanvasRef.current.bringToFront(overlay)
          }

          fabricCanvasRef.current.renderAll()
        } catch (error) {
          console.error('Error initializing canvas:', error)
        }
      }

      initCanvas()

      /*Fungsi Pembersih: */
      return () => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose()
          fabricCanvasRef.current = null
        }
      }
    }, [images, padding, gap, borderWidth, borderColor])

    return (
      <div className="w-full h-full">
        <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} />
      </div>
    )
  }
)

CanvasResult.displayName = 'CanvasResult'

export default CanvasResult

// import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
// import { fabric } from 'fabric'

// const CanvasResult = forwardRef(
//   ({ images, padding = 10, gap = 100, borderWidth = 20, borderColor = '' }, ref) => {
//     const canvasWrapperRef = useRef(null)
//     const fabricCanvasRef = useRef(null)

//     useImperativeHandle(ref, () => ({
//       exportCanvasToPNG: () => {
//         if (fabricCanvasRef.current) {
//           return fabricCanvasRef.current.toDataURL({
//             format: 'png',
//             quality: 1
//           })
//         }
//         return null
//       }
//     }))

//     useEffect(() => {
//       if (!canvasWrapperRef.current) return

//       const canvasElement = document.createElement('canvas')
//       canvasWrapperRef.current.innerHTML = ''
//       canvasWrapperRef.current.appendChild(canvasElement)

//       const fabricCanvas = new fabric.Canvas(canvasElement, {
//         backgroundColor: 'white',
//         selection: false
//       })
//       fabricCanvasRef.current = fabricCanvas

//       createMiddleLayer(fabricCanvas)

//       return () => {
//         fabricCanvas.dispose()
//         fabricCanvasRef.current = null
//       }
//     }, [images])

//     function createMiddleLayer(canvas) {
//       let currentY = padding

//       const loadImagePromises = images.map((imgUrl) => {
//         return new Promise((resolve) => {
//           fabric.Image.fromURL(imgUrl, (img) => {
//             img.scaleToWidth(300)
//             const imgHeight = img.getScaledHeight()

//             const border = new fabric.Rect({
//               left: 0,
//               top: currentY - borderWidth / 2,
//               width: img.getScaledWidth(),
//               height: imgHeight + borderWidth,
//               fill: borderColor || 'black',
//               selectable: false,
//               evented: false
//             })

//             img.set({
//               top: currentY,
//               left: 0,
//               selectable: false,
//               evented: false
//             })

//             canvas.add(border)
//             canvas.add(img)

//             currentY += imgHeight + gap
//             resolve(img)
//           })
//         })
//       })

//       Promise.all(loadImagePromises).then(() => {
//         canvas.setWidth(300)
//         canvas.setHeight(currentY)
//         canvas.renderAll()
//       })
//     }

//     return (
//       <div className="w-full h-full overflow-auto">
//         <div ref={canvasWrapperRef} className="w-fit h-fit mx-auto" />
//       </div>
//     )
//   }
// )

// export default CanvasResult
