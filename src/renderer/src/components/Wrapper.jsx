import { useRef, useState, useEffect, useCallback } from 'react'
import FormEmail from './FormEmail'
import WebCam from './WebCam'
// import CanvasResult from "./CanvasResult";
import CanvasResult from './CanvasResult' // Import the CanvasResult component
import Template from './Template'
import TemplatePreview from './TemplatePreview'

export default function Wrapper({ statusWrapper, setStatusWrapper }) {
  return (
    <>
      <ListWrapper statusWrapper={statusWrapper} setStatusWrapper={setStatusWrapper} />
    </>
  )
}

function ListWrapper({ statusWrapper, setStatusWrapper }) {
  // Untuk manage form email dimunculkan atau tidak
  const [showEmailForm, setShowEmailForm] = useState(false)

  /*PR*/
  const canvasRef = useRef()

  // Ref untuk akses Webcam
  const webcamRef = useRef(null)
  // const [capturedImage, setCapturedImage] = useState(null); // State untuk menyimpan gambar
  const [capturedImages, setCapturedImages] = useState([])
  // Untuk countdown 3 2 1
  const [countdown, setCountdown] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  // Total foto
  const totalPhotosToCapture = 4

  /*New: */
  // Update status wrapper
  const handleClick = useCallback(() => {
    // Kalau status wrapper sudah lebih dari 3 -> artinya user menekan tombol back
    if (statusWrapper > 3) {
      return setStatusWrapper(2)
    }
    // Kembalikan setting wrapper nya + 1
    return setStatusWrapper(statusWrapper + 1)
  }, [statusWrapper, setStatusWrapper]) //Kalau ada yang berubah maka jalankan fungsinya lagi

  // Kalau tombol kirim email ditekan -> setting status form email jadi true : muncul form mengambang
  const handleShowEmailForm = useCallback(() => {
    setShowEmailForm(true)
  }, []) //Cukup lakukan sekali saja

  function handlePrintImage() {}

  // Saat tombol ambil foto ditekan : jalankan fungsi berikut
  const startCaptureProcess = useCallback(() => {
    setCapturedImages([]) // bersihkan gambar sebelumnya
    setIsCapturing(true) // ubah status capture jadi true
    setCountdown(3) // Start countdown for the first photo
  }, [])

  const captureImage = useCallback(() => {
    if (!webcamRef.current) {
      console.error('Kamera belum siap!')
      return
    }

    const imageSrc = webcamRef.current.getScreenshot()
    setCapturedImages((prevImages) => [...prevImages, imageSrc])

    // Jika jumlah hasil foto masih bisa ditambah 1 (masih kurang dari nilai total foto yang diinginkan)
    if (capturedImages.length + 1 < totalPhotosToCapture) {
      setCountdown(3) //Ubah nilai count nya jadi 3 lagi
    } else {
      setIsCapturing(false) // Semua foto sudah didapatkan
      handleClick() // Menuju halaman result
    }
  }, [capturedImages.length, handleClick])

  useEffect(() => {
    let timer //Tempat simpan waktu
    // Kondisi true -> 1 artinya isCapturing: true dan countdown ada isinya(3)
    if (isCapturing && countdown > 0) {
      timer = setTimeout(() => {
        // Dalam react -> setNilai((nilaiTerbaru) => nilaiTerbaru - 1) konfigurasinya itu ananonymous function yang parameternya otomatis berisi nilaiState terbaru terkini, (nilaiState) => nilaiState -1
        setCountdown((prevCountdown) => prevCountdown - 1)
      }, 1000) //Dengan delay 1 detik setiap setelah action mengubah nilai state countdown
      // Kalau isCapturing false dan countdown 0 -> false/0
    } else if (isCapturing && countdown === 0) {
      // Lakukan pengambilan foto
      captureImage()
    }

    return () => clearTimeout(timer) // Clean up the timer
  }, [isCapturing, countdown, captureImage]) //Kalau ada salah satu dependencie tersebut yang berubah -> jalankan lagi fungsi di dalam useEffect

  if (statusWrapper == 1) {
    return (
      <>
        <div className="bg-slate-950 flex h-full rounded-xl border-2 border-slate-500">
          <div className="m-auto">
            <button
              onClick={handleClick}
              className="bg-linear-to-r from-lime-200 via-green-400 to-emerald-600 px-8 py-2 rounded-md font-semibold cursor-pointer text-3xl text-slate-900 backdrop-blur-lg border-1 border-slate-400 active:scale-105 active:border-slate-300 hover:scale-105 hover:border-slate-300 transition shadow-xl"
              id="play"
            >
              Play
            </button>
          </div>
        </div>
      </>
    )
  } else if (statusWrapper == 2) {
    return (
      <>
        <div className="bg-slate-950 grid grid-rows-3 grid-cols-1 h-full relative rounded-xl border-2 border-slate-500">
          <div className="row-span-2 ">
            <div className="w-[60%] bg-white/50 backdrop-blur-lg h-full mx-auto md:w-[40%] lg:w-[35%]">
              {/* Template Preview */}
              <TemplatePreview />
            </div>
          </div>
          <div className="row-span-1 bg-slate-600/25 rounded-t-4xl">
            <div className="w-[50%] bg-white/20 backdrop-blur-lg h-full mx-auto md:w-[30%] lg:w-[25%]">
              {/* template-1 */}
              <Template />
            </div>
          </div>
          <div className="absolute top-1/2 right-3 translate-y-1/2">
            <button
              id="next"
              className="bg-white/10 px-8 py-2 rounded-md font-semibold cursor-pointer text-xl text-white backdrop-blur-lg border-1 border-slate-500 active:scale-105 active:border-slate-300 hover:scale-105 hover:border-slate-300 transition"
              onClick={handleClick}
            >
              Next
            </button>
          </div>
        </div>
      </>
    )
  } else if (statusWrapper == 3) {
    return (
      <>
        <div className="h-full gap-5">
          <div className="bg-slate-950 h-full flex rounded-xl border-2 border-slate-500 overflow-hidden">
            <div className="w-fit h-full m-auto relative">
              <WebCam ref={webcamRef} />
              {/* {isCapturing && ( */}
              <p className="absolute left-1/2 top-3 bg-red-600 text-white font-semibold px-4 py-3 w-20 h-16 text-xl rounded-md -translate-x-1/2 flex justify-center items-center">
                {countdown}
              </p>
              {/* )} */}
              <button
                onClick={startCaptureProcess}
                className="absolute bg-white/10 px-8 py-2 rounded-md font-semibold cursor-pointer text-xl text-green-500 backdrop-blur-lg border-1 border-green-400 active:scale-105 active:border-green-400 hover:scale-105 hover:border-green-300 transition bottom-3 left-1/2 lg:bottom-3 lg:left-1/2 -translate-x-1/2"
              >
                Ambil Foto
              </button>
            </div>
          </div>
        </div>
      </>
    )
  } else {
    return (
      <div className="bg-slate-950 w-full h-full grid grid-cols-4 grid-flow-col relative rounded-xl border-2 border-slate-500 overflow-hidden">
        <div className="bg-white/50 backdrop-blur-lg w-fit mx-auto h-full col-span-2 col-start-2 overflow-auto flex">
          {/* Result: */}
          {capturedImages.length > 0 && (
            <div className="m-auto">
              {/* <h2 className="text-lg font-semibold mb-1 text-center text-gray-800">
                Hasil Foto:
              </h2> */}
              <CanvasResult ref={canvasRef} images={capturedImages} />
            </div>
          )}
        </div>
        <div className="col-span-1 col-start-1 relative">
          <button
            onClick={handleClick}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 px-8 py-2 rounded-md font-semibold cursor-pointer text-xl text-white backdrop-blur-lg border-1 border-slate-500 active:scale-105 active:border-slate-300 hover:scale-105 hover:border-slate-300 transition"
          >
            Back
          </button>
        </div>
        <div className="col-span-1 col-start-4 flex flex-col justify-around">
          <button
            onClick={handleShowEmailForm}
            className="self-end mr-3 bg-white/10 px-8 py-2 rounded-md font-semibold cursor-pointer text-xl text-white backdrop-blur-lg border-1 border-slate-500 active:scale-105 active:border-slate-300 hover:scale-105 hover:border-slate-300 transition"
          >
            Send Email
          </button>
          <button
            onClick={handlePrintImage}
            className="self-end mr-3 bg-white/10 px-8 py-2 rounded-md font-semibold cursor-pointer text-xl text-white backdrop-blur-lg border-1 border-slate-500 active:scale-105 active:border-slate-300 hover:scale-105 hover:border-slate-300 transition"
          >
            Print
          </button>
        </div>
        {/* Kalau showEmailForm -> true : munculkan FormEmail */}
        {showEmailForm && (
          <FormEmail
            setShowEmailForm={setShowEmailForm}
            getImageData={() => canvasRef.current?.exportCanvasToPNG()}
          />
        )}
      </div>
    )
  }
}
