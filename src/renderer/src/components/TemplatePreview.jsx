import templateFull from '../assets/template1/template-full.png'

export default function TemplatePreview() {
  return (
    <div className="h-full w-full flex">
      <img src={templateFull} className="h-full m-auto" />
    </div>
  )
}
