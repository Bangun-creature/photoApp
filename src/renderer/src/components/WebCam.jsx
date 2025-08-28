import { forwardRef } from 'react'
import Webcam from 'react-webcam'

const WebCam = forwardRef((props, ref) => {
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user'
  }

  return (
    <>
      <Webcam
        ref={ref}
        className="mx-auto"
        audio={false}
        height={'auto'}
        screenshotFormat="image/jpeg"
        width={'auto'}
        videoConstraints={videoConstraints}
        mirrored={true}
        style={{
          height: '100%',
          objectFit: 'cover' // atau "contain" tergantung kebutuhan
        }}
      />
    </>
  )
})

export default WebCam
