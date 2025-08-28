import { useState } from 'react'

export default function FormEmail({ setShowEmailForm, getImageData }) {
  const [email, setEmail] = useState('')

  function handleClose() {
    setShowEmailForm(false)
  }

  /*Handle Proses*/
  const handleSend = async (e) => {
    e.preventDefault()

    const imageData = getImageData()
    if (!email) return alert('Email tidak boleh kosong!')
    if (!imageData) return alert('Gambar tidak boleh kosong!')
    handleClose()

    try {
      const result = await window.electronAPI.sendImageDataToMain({
        email,
        imageData
      })

      if (result.success) {
        alert('Email berhasil dikirim')
      } else {
        alert(`Gagal: ${result.message}`)
      }
    } catch (err) {
      console.error(err)
      alert('Terjadi error saat kirim email')
    }
  }

  return (
    <div className="absolute bg-slate-600/90 h-full w-full flex" onClick={handleClose}>
      <div
        className="px-16 py-10 bg-slate-700 rounded-md w-xl h-fit m-auto border-2 border-slate-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="font-semibold text-white text-xl">Masukkan Email Tujuan: </p>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan Email Anda"
            className="mt-6 px-8 py-2 bg-slate-200 rounded-md text-xl text-slate-900"
            autoFocus
          />
          <button
            onClick={handleSend}
            className="mt-6 bg-white/10 px-8 py-2 rounded-md font-semibold cursor-pointer text-xl text-white backdrop-blur-lg border-1 border-slate-500 active:scale-105 active:border-slate-300 hover:scale-105 hover:border-slate-300 transition"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  )
}
