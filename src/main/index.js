import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/p-icon.png?asset'
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
// import fs from 'fs/promises'

dotenv.config()

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  //Agar display tidak bisa ditumpuk :
  // mainWindow.setAlwaysOnTop(true, 'screen')

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/*Send lama*/
// Fungsi utama mengirim email dengan lampiran
// async function sendEmailWithAttachment(filePath, emailTarget) {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//       port: process.env.EMAIL_PORT || 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     })

//     const mailOptions = {
//       from: `"Aplikasi Kamera" <${process.env.EMAIL_USER}>`,
//       to: emailTarget, // << gunakan email dari frontend
//       subject: `Foto Terbaru - ${new Date().toLocaleString()}`,
//       text: 'Foto dari aplikasi kamera',
//       attachments: [
//         {
//           filename: path.basename(filePath),
//           path: filePath
//         }
//       ]
//     }
//     console.log(emailTarget)
//     await transporter.sendMail(mailOptions)
//     console.log('Email terkirim ke:', emailTarget)
//   } catch (error) {
//     console.error('Gagal mengirim email:', error)
//     throw error
//   }
// }

/*Send Baru*/
async function sendEmailWithAttachment(filePath, emailTarget) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'bangunjati07282@gmail.com', // Simpan di .env
        pass: 'yyfk nurw qlky pelm' // Gunakan App Password google dan gunakan passwordnya ada 16 huruf biasanya
      }
    })

    const mailOptions = {
      from: `"Aplikasi Kamera" <${'bangunjati07282@gmail.com'}>`,
      to: emailTarget, // Email tujuan printer
      subject: `Foto Terbaru - ${new Date().toLocaleString()}`,
      text: 'Foto dari aplikasi kamera',
      attachments: [
        {
          filename: path.basename(filePath),
          path: filePath
        }
      ]
    }

    await transporter.sendMail(mailOptions)
    console.log('Email terkirim!')
  } catch (error) {
    console.error('Gagal mengirim email:', error)
    throw error
  }
}

// Handler untuk menerima permintaan dari preload/frontend
/*Kode Lama: */
// ipcMain.handle('send-image', async (event, { email, imageData }) => {
//   try {
//     // Buat path file sementara
//     const tempPath = path.join(__dirname, 'temp-sent.png')

//     // Ubah data base64 menjadi file PNG
//     const base64Data = imageData.replace(/^data:image\/png;base64,/, '')
//     fs.writeFileSync(tempPath, base64Data, 'base64')

//     // Kirim email dengan lampiran
//     await sendEmailWithAttachment(tempPath, email)

//     // (Opsional) Hapus file sementara
//     fs.unlinkSync(tempPath)

//     return { success: true, message: 'Email berhasil dikirim.' }
//   } catch (error) {
//     return { success: false, message: error.message }
//   }
// })

/*Kode Baru: */
ipcMain.handle('send-image', async (event, { email, imageData }) => {
  try {
    // 1. Simpan ke folder
    const targetDir = 'C:\\Users\\ASUS\\Documents\\Photobooth\\Picture'
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `photo-${timestamp}.png`
    const filePath = path.join(targetDir, filename)

    const base64Data = imageData.replace(/^data:image\/png;base64,/, '')
    fs.writeFileSync(filePath, base64Data, 'base64')

    // 2. Kirim email (jalan di background)
    sendEmailWithAttachment(filePath, email).catch(console.error)

    return {
      success: true,
      message: `Foto disimpan di: ${filePath} dan sedang dikirim via email`,
      path: filePath
    }
  } catch (error) {
    console.error('Error utama:', error)
    return {
      success: false,
      message: `Gagal menyimpan foto: ${error.message}`
    }
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
